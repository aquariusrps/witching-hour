import { getMojoWishlist } from '@/lib/db/mojo'
import MojoAddWishlistItem from '@/app/mojo/components/MojoAddWishlistItem'
import MojoWishlistList from '@/app/mojo/components/MojoWishlistList'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '24px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

export default async function MojoWishlistPage() {
  const items = await getMojoWishlist()

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          The Wishlist
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Character concepts, plot ideas &amp; fandoms to explore
        </p>
      </div>

      <FiligreeDivider />

      <MojoAddWishlistItem />

      <MojoWishlistList items={items} />
    </div>
  )
}
