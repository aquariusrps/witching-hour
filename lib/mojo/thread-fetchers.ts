import { parse } from 'node-html-parser'

export type FetchResult = {
  last_poster: string | null
  fetch_status: 'success' | 'failed' | 'unsupported' | 'uncertain'
  detected_platform: 'tumblr' | 'jcink' | 'generic' | 'unknown'
}

export function detectPlatform(
  url: string
): 'tumblr' | 'jcink' | 'generic' | 'unknown' {
  try {
    const u = new URL(url)
    const hostname = u.hostname.toLowerCase()
    if (hostname.includes('tumblr.com')) return 'tumblr'
    if (hostname.endsWith('.jcink.net') || hostname.endsWith('.jcink.com'))
      return 'jcink'
    if (url.trim() === '') return 'unknown'
    return 'generic'
  } catch {
    return 'unknown'
  }
}

export async function fetchTumblr(url: string): Promise<FetchResult> {
  const platform = 'tumblr'

  // Extract blog name and post ID from Tumblr URL.
  // Handles two URL formats:
  //   https://blogname.tumblr.com/post/1234567890/slug
  //   https://www.tumblr.com/blogname/1234567890/slug
  //   https://tumblr.com/blogname/1234567890

  let blogName: string | null = null
  let postId: string | null = null

  try {
    const u = new URL(url)
    const hostname = u.hostname.toLowerCase()
    const pathParts = u.pathname.split('/').filter(Boolean)

    if (hostname.endsWith('.tumblr.com') && !hostname.startsWith('www.')) {
      // Format: blogname.tumblr.com/post/1234567890
      blogName = hostname.replace('.tumblr.com', '')
      // Find the numeric post ID in the path
      const numericPart = pathParts.find((p) => /^\d+$/.test(p))
      postId = numericPart ?? null
    } else {
      // Format: tumblr.com/blogname/1234567890
      // or: www.tumblr.com/blogname/1234567890
      blogName = pathParts[0] ?? null
      postId = pathParts[1] ?? null
      // Verify postId is numeric
      if (postId && !/^\d+$/.test(postId)) postId = null
    }
  } catch {
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }

  if (!blogName || !postId) {
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }

  const apiKey = process.env.TUMBLR_API_KEY
  if (!apiKey) {
    console.error('TUMBLR_API_KEY not set')
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }

  try {
    // Fetch the post's notes (reblogs) — most recent first
    const notesUrl =
      `https://api.tumblr.com/v2/blog/${blogName}/notes` +
      `?id=${postId}&mode=reblogs_with_tags&limit=20`

    const response = await fetch(notesUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000), // 8 second timeout
    })

    if (response.status === 401) {
      // Private blog or invalid key
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }
    if (response.status === 404) {
      // Post not found or blog not found
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }
    if (!response.ok) {
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }

    const data = await response.json()
    const notes: Array<{ type: string; blog_name: string }> = data?.response?.notes ?? []

    // Find the most recent reblog (first reblog in the notes array)
    // Notes are ordered newest first by the API
    const lastReblog = notes.find((n) => n.type === 'reblog')

    if (!lastReblog) {
      // Post exists but no reblogs yet — no reply
      // The original poster is the "last poster" in this case
      return {
        last_poster: blogName, // original post author = last activity
        fetch_status: 'success',
        detected_platform: platform,
      }
    }

    return {
      last_poster: lastReblog.blog_name,
      fetch_status: 'success',
      detected_platform: platform,
    }
  } catch (err) {
    console.error('Tumblr fetch error:', err)
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }
}

export async function fetchJcink(url: string): Promise<FetchResult> {
  const platform = 'jcink'

  try {
    const response = await fetch(url, {
      headers: {
        // Identify as a standard browser to avoid bot blocks
        'User-Agent': 'Mozilla/5.0 (compatible; MojoDash/1.0; thread-tracker)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }

    const html = await response.text()
    const root = parse(html)

    // JCINK/IPB uses consistent class names for post authors.
    // Try selectors in order of confidence — most specific first.
    // We want the LAST match (most recent post).

    const selectors = [
      '.post_member_name', // most common in standard JCINK skins
      '.normalname', // IPB default
      '.member_name', // some skins
      '[itemprop="author"]', // schema.org markup some skins use
      '.postdetails .name', // IPB legacy
    ]

    let lastPoster: string | null = null

    for (const selector of selectors) {
      const elements = root.querySelectorAll(selector)
      if (elements.length > 0) {
        // Take the last element's text (most recent post's author)
        const text = elements[elements.length - 1].text?.trim()
        if (text && text.length > 0 && text.length < 100) {
          lastPoster = text
          break
        }
      }
    }

    if (!lastPoster) {
      return {
        last_poster: null,
        fetch_status: 'uncertain',
        detected_platform: platform,
      }
    }

    return {
      last_poster: lastPoster,
      fetch_status: 'success',
      detected_platform: platform,
    }
  } catch (err) {
    console.error('JCINK fetch error:', err)
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }
}

export async function fetchGeneric(url: string): Promise<FetchResult> {
  const platform = 'generic'

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MojoDash/1.0; thread-tracker)',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      // Non-HTML response (probably a JS app) — cannot scrape
      return { last_poster: null, fetch_status: 'unsupported', detected_platform: platform }
    }

    const html = await response.text()

    // Check if the page is JavaScript-rendered (minimal static HTML)
    // A rough heuristic: if the page explicitly tells the visitor to
    // enable JavaScript, it's probably a client-rendered app.
    if (
      html.includes('enable javascript') ||
      html.includes('JavaScript is required') ||
      html.includes('You need JavaScript enabled')
    ) {
      return { last_poster: null, fetch_status: 'unsupported', detected_platform: platform }
    }

    const root = parse(html)

    // Try common forum author selectors across different platforms
    // Proboards, Zetaboards, Invision, SMF, phpBB, etc.
    const selectors = [
      '.poster .username',
      '.post-author .username',
      '.author a',
      '.poster_name',
      '.username a',
      '.post_username',
      'td.name a',
      '.postername',
      '.post_head .name',
      '[class*="author"] a',
      '[class*="poster"] a',
      '[class*="username"]',
    ]

    let lastPoster: string | null = null

    for (const selector of selectors) {
      const elements = root.querySelectorAll(selector)
      if (elements.length > 0) {
        const text = elements[elements.length - 1].text?.trim()
        if (text && text.length > 0 && text.length < 100) {
          lastPoster = text
          break
        }
      }
    }

    // Generic is always 'uncertain' even on success — we can't be confident
    // that the selector matched the right thing
    return {
      last_poster: lastPoster,
      fetch_status: 'uncertain',
      detected_platform: platform,
    }
  } catch (err) {
    console.error('Generic fetch error:', err)
    return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
  }
}

export async function fetchThreadStatus(url: string): Promise<FetchResult> {
  if (!url || url.trim() === '') {
    return {
      last_poster: null,
      fetch_status: 'unsupported',
      detected_platform: 'unknown',
    }
  }

  const platform = detectPlatform(url)

  switch (platform) {
    case 'tumblr':
      return fetchTumblr(url)
    case 'jcink':
      return fetchJcink(url)
    case 'generic':
      return fetchGeneric(url)
    default:
      return {
        last_poster: null,
        fetch_status: 'unsupported',
        detected_platform: 'unknown',
      }
  }
}

export function deriveWhoseTurn(
  thread: {
    last_poster: string | null
    fetch_status: string | null
    manual_whose_turn: string | null
  },
  characterName: string
): 'mine' | 'theirs' | 'unknown' {
  // Manual override takes priority
  if (thread.manual_whose_turn === 'mine') return 'mine'
  if (thread.manual_whose_turn === 'theirs') return 'theirs'

  // Auto-detection
  const unresolvable = ['uncertain', 'failed', 'unsupported', 'pending', null]
  if (!thread.fetch_status || unresolvable.includes(thread.fetch_status)) {
    return 'unknown'
  }

  if (!thread.last_poster) return 'unknown'

  // Case-insensitive comparison
  const posterLower = thread.last_poster.toLowerCase().trim()
  const charLower = characterName.toLowerCase().trim()

  // If the last poster IS your character, that means YOU were last to post
  // → it is now THEIR turn to reply.
  // If the last poster is NOT your character → they were last → it is YOUR turn.
  if (posterLower === charLower) return 'theirs'
  return 'mine'
}
