import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — The Witching Hour',
  description: 'Sign in to your Witching Hour account.',
}

export default function LoginPage() {
  return <LoginForm />
}
