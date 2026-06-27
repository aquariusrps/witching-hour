import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { getCachedBoardTree, getCachedFactions } from '@/lib/cached-settings'
import BoardManagerClient from './BoardManagerClient'

export default async function AdminBoardsPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('manage_boards')) {
    return (
      <div style={{ padding: '40px 0' }}>
        <p style={{
          fontFamily: 'var(--f-body)',
          color: 'var(--ember)',
          fontStyle: 'italic',
        }}>
          You do not have permission to manage boards.
        </p>
      </div>
    )
  }

  const [boardTree, factions] = await Promise.all([
    getCachedBoardTree(),
    getCachedFactions(),
  ])

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--f-head)',
          fontSize: '1.9rem',
          fontWeight: 700,
          color: 'var(--roseash)',
          marginBottom: 6,
        }}>
          Board Manager
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--mist)', fontSize: '0.95rem' }}>
          Create and organise forum categories, boards, and sub-boards.
        </p>
      </div>
      <BoardManagerClient boardTree={boardTree} factions={factions} />
    </>
  )
}
