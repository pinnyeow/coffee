'use client'

import { useState, useTransition } from 'react'
import { setShareWantToTry } from '@/lib/actions/settings'

export default function ShareWantToTryToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    const next = !on
    setOn(next) // optimistic
    setError(null)
    start(async () => {
      const res = await setShareWantToTry(next)
      if (!res.ok) {
        setOn(!next)
        setError(res.error)
      }
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-4">
      <label className="flex items-start justify-between gap-3 cursor-pointer">
        <div className="min-w-0">
          <div className="text-sm font-medium text-stone-900">Share my Want-to-try list</div>
          <div className="text-xs text-stone-500 mt-1">
            When on, friends can see which beans you&apos;ve bookmarked. Useful when they brew it
            and want to send you their recipe.
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={on}
          className={`shrink-0 w-11 h-6 rounded-full transition relative ${
            on ? 'bg-stone-900' : 'bg-stone-300'
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
              on ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </label>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  )
}
