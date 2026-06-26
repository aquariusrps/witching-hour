import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/adminClient'

export const getCachedSiteSettings = unstable_cache(
  async () => {
    const admin = getAdminClient()
    const { data } = await admin.from('site_settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value
    return map
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 }
)
