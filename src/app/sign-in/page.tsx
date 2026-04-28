'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'sending' | 'verifying' | 'error'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      console.error('Sign-in error:', error)
      setErrorMessage("Couldn't send your code. Please try again in a moment.")
      setStatus('error')
    } else {
      setStep('code')
      setStatus('idle')
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setStatus('verifying')
    setErrorMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) {
      console.error('Verify error:', error)
      setErrorMessage("That code didn't work. Try again or request a new one.")
      setStatus('error')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
        <div className="text-xs tracking-widest text-stone-500 uppercase">Pour</div>
        <h1 className="text-2xl font-semibold text-stone-900 mt-1">Sign in</h1>

        {step === 'email' ? (
          <>
            <p className="text-sm text-stone-600 mt-1">
              We&apos;ll email you a sign-in code — no password needed.
            </p>
            <form onSubmit={sendCode} className="mt-6 space-y-3">
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
                {status === 'sending' ? 'Sending…' : 'Send code'}
              </button>
              {status === 'error' && (
                <div className="text-xs text-red-600">{errorMessage}</div>
              )}
            </form>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              ✓ Code sent to <b>{email}</b>
            </div>
            <p className="text-sm text-stone-600 mt-4">
              Check your inbox (and junk folder, just in case) and enter the code below.
            </p>
            <form onSubmit={verifyCode} className="mt-4 space-y-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                required
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-lg tracking-[0.4em] text-center focus:outline-none focus:border-stone-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={status === 'verifying' || code.length < 6}
                className="w-full bg-stone-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                {status === 'verifying' ? 'Verifying…' : 'Sign in'}
              </button>
              {status === 'error' && (
                <div className="text-xs text-red-600">{errorMessage}</div>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setStatus('idle')
                  setErrorMessage('')
                }}
                className="w-full text-xs text-stone-500 hover:text-stone-800 underline pt-2"
              >
                Use a different email
              </button>
            </form>
          </>
        )}
      </div>
      <Link
        href="/welcome"
        className="mt-6 text-xs text-stone-500 hover:text-stone-800 underline"
      >
        New here? Read about Pour →
      </Link>
    </main>
  )
}
