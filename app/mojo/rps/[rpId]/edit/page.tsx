import { notFound } from 'next/navigation'
import { getMojoRp } from '@/lib/db/mojo'
import MojoRpEditForm from '@/app/mojo/components/MojoRpEditForm'

export default async function MojoRpEditPage({
  params,
}: {
  params: Promise<{ rpId: string }>
}) {
  const { rpId } = await params
  const rp = await getMojoRp(rpId)
  if (!rp) notFound()

  return (
    <div style={{ padding: '28px 32px 64px' }}>
      <MojoRpEditForm
        rpId={rp.id}
        name={rp.name}
        siteName={rp.site_name}
        siteUrl={rp.site_url}
        colorHex={rp.color_hex}
        status={rp.status}
      />
    </div>
  )
}
