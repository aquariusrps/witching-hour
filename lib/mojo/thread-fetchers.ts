import { parse } from 'node-html-parser'

export type FetchResult = {
  last_poster: string | null
  fetch_status: 'success' | 'failed' | 'unsupported' | 'uncertain'
  detected_platform: 'tumblr' | 'jcink' | 'generic' | 'unknown'
  // Only present when a characterName was passed to fetchJcink() —
  // true if that name was found among ANY post author on the page
  // (not just the last poster). Used for class thread auto-archive.
  my_post_found?: boolean
  // FIX-045-B — only present alongside my_post_found (JCINK class-
  // thread scrapes). all_authors preserves post order (first to
  // last) for professor-mode detection (first poster = professor).
  all_authors?: string[]
  // FIX-045-B — JCINK breadcrumb subforum name, extracted only for
  // class-thread scrapes. null if the breadcrumb selector/link count
  // didn't match — extraction never throws.
  scraped_class_name?: string | null
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

export async function fetchJcink(
  url: string,
  characterName?: string
): Promise<FetchResult> {
  const platform = 'jcink'

  try {
    // Authenticate as the operator's own JCINK account when configured.
    // Server-side only — JCINK_MEMBER_ID / JCINK_PASS_HASH never reach the
    // client. Optional: fetch proceeds unauthenticated if either is unset.
    const memberId = process.env.JCINK_MEMBER_ID
    const passHash = process.env.JCINK_PASS_HASH
    const cookieHeader =
      memberId && passHash ? `member_id=${memberId}; pass_hash=${passHash}` : undefined

    const response = await fetch(url, {
      headers: {
        // Identify as a standard browser to avoid bot blocks
        'User-Agent': 'Mozilla/5.0 (compatible; MojoDash/1.0; thread-tracker)',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { last_poster: null, fetch_status: 'failed', detected_platform: platform }
    }

    const html = await response.text()

    // JCINK returns HTTP 200 even when the requester lacks permission to
    // view a topic (members-only boards) — the response is a "Board
    // Message: You do not have permission to view this topic" page, not
    // an HTTP error. Without this check the poster selectors below simply
    // find nothing and the result is indistinguishable from a genuine
    // scraper/skin mismatch. Confirmed live against marvellegacyu.jcink.net
    // (MOJO-DIAG-001 / MOJO-FIX-009).
    //
    // Reuses 'unsupported' rather than a new status value: fetchJcink()
    // never sets 'unsupported' for any other reason, so combined with
    // detected_platform === 'jcink' this is unambiguous. There is no
    // 'auth_required' value in mojo_threads_fetch_status_check and this
    // fix does not add one.
    const isAuthWall =
      html.includes('do not have permission to view this topic') ||
      html.includes('id="board-message"') ||
      html.includes("id='board-message'")

    if (isAuthWall) {
      return { last_poster: null, fetch_status: 'unsupported', detected_platform: platform }
    }

    // This skin's post-author markup (`<div class="mpname"><a ...><span
    // ...>NAME</a>`) leaves the inner <span> unclosed. node-html-parser's
    // querySelectorAll returns 0 matches for '.mpname a' against this markup
    // even though the elements are clearly present in the raw HTML —
    // confirmed live. A regex against the raw string is tried first; the
    // CSS-selector list below remains as a fallback for JCINK skins where
    // DOM parsing succeeds.
    let lastPoster: string | null = null

    const mpnameMatches = [
      ...html.matchAll(/<div class=["']mpname["']><a[^>]*>(?:<span[^>]*>)?([^<]+)<\/a>/gi),
    ]
    if (mpnameMatches.length > 0) {
      const text = mpnameMatches[mpnameMatches.length - 1][1]?.trim()
      if (text && text.length > 0 && text.length < 100) {
        lastPoster = text
      }
    }

    if (!lastPoster) {
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
    }

    // ── CLASS THREAD: CHECK IF CHARACTER HAS POSTED ──
    // Only runs when characterName is provided. Reuses the same two
    // author-detection patterns as the last_poster logic above, but
    // scans ALL matches instead of only the most recent one. Fully
    // additive — existing behavior above and below is unchanged when
    // characterName is not passed.
    let my_post_found: boolean | undefined = undefined
    let all_authors: string[] | undefined = undefined
    let scraped_class_name: string | null | undefined = undefined

    if (characterName) {
      const lowerName = characterName.toLowerCase().trim()
      const allAuthors: string[] = []

      // Pattern 1: mpname divs (same regex as last_poster detection above)
      for (const m of html.matchAll(
        /<div class=["']mpname["']><a[^>]*>(?:<span[^>]*>)?([^<]+)<\/a>/gi
      )) {
        const text = m[1]?.trim()
        if (text && text.length > 0 && text.length < 100) allAuthors.push(text)
      }

      // Pattern 2: same CSS selector fallback list as last_poster detection above
      if (allAuthors.length === 0) {
        const root = parse(html)
        const selectors = [
          '.post_member_name',
          '.normalname',
          '.member_name',
          '[itemprop="author"]',
          '.postdetails .name',
        ]
        for (const selector of selectors) {
          const elements = root.querySelectorAll(selector)
          for (const el of elements) {
            const text = el.text?.trim()
            if (text && text.length > 0 && text.length < 100) allAuthors.push(text)
          }
          if (allAuthors.length > 0) break
        }
      }

      my_post_found = allAuthors.some(
        (author) =>
          author.toLowerCase().includes(lowerName) ||
          lowerName.includes(author.toLowerCase())
      )
      all_authors = allAuthors

      // ── BREADCRUMB / SUBFORUM EXTRACTION (FIX-045-B) ──
      // JCINK/IPB breadcrumb: Home > Category > Subforum > Thread Title.
      // Subforum is the second-to-last <a> in the chain (the last <a>
      // is the thread title itself). Never throws — null on any failure.
      scraped_class_name = null
      try {
        const breadcrumbRoot = parse(html)
        const breadcrumbSelectors = ['#nav', '.navbar', 'nav[id="nav"]', '.breadcrumb']
        for (const selector of breadcrumbSelectors) {
          const container = breadcrumbRoot.querySelector(selector)
          if (!container) continue
          const links = container.querySelectorAll('a')
          if (links.length >= 2) {
            const text = links[links.length - 2].text?.trim()
            if (text && text.length > 0) {
              scraped_class_name = text
              break
            }
          }
        }
      } catch {
        scraped_class_name = null
      }
    }

    if (!lastPoster) {
      return {
        last_poster: null,
        fetch_status: 'uncertain',
        detected_platform: platform,
        ...(my_post_found !== undefined ? { my_post_found } : {}),
        ...(all_authors !== undefined ? { all_authors } : {}),
        ...(scraped_class_name !== undefined ? { scraped_class_name } : {}),
      }
    }

    return {
      last_poster: lastPoster,
      fetch_status: 'success',
      detected_platform: platform,
      ...(my_post_found !== undefined ? { my_post_found } : {}),
      ...(all_authors !== undefined ? { all_authors } : {}),
      ...(scraped_class_name !== undefined ? { scraped_class_name } : {}),
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

export async function fetchThreadStatus(
  url: string,
  characterName?: string
): Promise<FetchResult> {
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
      return fetchJcink(url, characterName)
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
