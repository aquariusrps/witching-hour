import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/serverClient'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — The Witching Hour',
  description: 'Sign in to your Witching Hour account.',
}

export default async function LoginPage() {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
