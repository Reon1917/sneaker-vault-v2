'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../supabase/client'

export default function AuthButton() {
  const router = useRouter()

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleSignIn} className="btn btn-primary">
        Sign In
      </button>
      <button onClick={handleSignOut} className="btn btn-ghost">
        Sign Out
      </button>
    </div>
  )
}
