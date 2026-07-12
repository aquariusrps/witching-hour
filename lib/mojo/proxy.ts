import { getAdminClient } from '@/lib/supabase/adminClient'

export function generateProxyToken(): string {
  return crypto.randomUUID()
}

export async function registerImageToken(
  storagePath: string,
  mimeType: string,
  expiresAt: Date | null,
  label?: string
): Promise<string> {
  const token = generateProxyToken()
  const admin = getAdminClient()

  const { error } = await admin.from('mojo_image_tokens').insert({
    token,
    storage_path: storagePath,
    mime_type: mimeType,
    expires_at: expiresAt ? expiresAt.toISOString() : null,
    label: label ?? null,
  })

  if (error) throw new Error('Failed to register image token')

  return token
}

export function getProxyUrl(token: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL + '/i/' + token
}
