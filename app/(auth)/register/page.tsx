import type { Metadata } from 'next'
import RegisterForm from './RegisterForm'

export const metadata: Metadata = {
  title: 'Join the Circle — The Witching Hour',
  description: 'Create your account and enter The Witching Hour.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
