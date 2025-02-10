'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const redirectTo = searchParams.get('redirectTo') || '/vault'
        router.push(redirectTo)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, searchParams, supabase])

  if (!mounted) return null

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Sneaker Vault</h1>
        <p className="text-gray-600 mt-2">
          Sign in to manage your sneaker collection
        </p>
      </div>
      
      <Auth
        supabaseClient={supabase}
        view="sign_in"
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#4F46E5',
                brandAccent: '#4338CA',
              },
            },
          },
          style: {
            button: {
              borderRadius: '6px',
              width: '100%',
            },
            input: {
              borderRadius: '6px',
            },
          },
        }}
        theme="light"
        showLinks={true}
        providers={['google', 'github']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
      />
    </div>
  )
} 