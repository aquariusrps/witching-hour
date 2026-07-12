import { getMojoPartners } from '@/lib/db/mojo'
import MojoAddPartner from '@/app/mojo/components/MojoAddPartner'
import MojoPartnerList from '@/app/mojo/components/MojoPartnerList'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '24px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

export default async function MojoPartnersPage() {
  const partners = await getMojoPartners()

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Writing Partners
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Your co-authors, their styles &amp; your shared history
        </p>
      </div>

      <FiligreeDivider />

      <MojoAddPartner />

      <MojoPartnerList partners={partners} />
    </div>
  )
}
