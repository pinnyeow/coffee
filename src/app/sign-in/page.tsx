'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setErrorMessage(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
        <div className="text-xs tracking-widest text-stone-500 uppercase">Pour</div>
        <h1 className="text-2xl font-semibold text-stone-900 mt-1">Sign in</h1>
        <p className="text-sm text-stone-600 mt-1">
          We&apos;ll email you a magic link — no password needed.
        </p>

        {status === 'sent' ? (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            ✓ Check <b>{email}</b> for the sign-in link. Open it on this device.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm focus:outline-none focus:border-stone-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-stone-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {status === 'error' && (
              <div className="text-xs text-red-600">{errorMessage}</div>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
