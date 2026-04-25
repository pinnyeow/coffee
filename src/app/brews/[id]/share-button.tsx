'use client'

import { useState } from 'react'
import { formatBrewAsText, type ShareableBrew } from '@/lib/share'

export default function ShareButton({ brew }: { brew: ShareableBrew }) {
  const [mode, setMode] = useState<'universal' | 'xbloom'>('universal')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const text = formatBrewAsText(brew, mode)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert('Could not copy. Long-press the preview to copy manually.')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-stone-700 underline"
      >
        Share
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="bg-stone-100 rounded-xl p-1 inline-flex text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('universal')}
            className={`px-3 py-1.5 rounded-lg ${
              mode === 'universal' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Universal
          </button>
          <button
            type="button"
            onClick={() => setMode('xbloom')}
            className={`px-3 py-1.5 rounded-lg ${
              mode === 'xbloom' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            xBloom
          </button>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-500">
          Close
        </button>
      </div>
      <div className="text-[11px] text-stone-500">
        {mode === 'universal'
          ? 'For friends on any pour over gear (V60, Chemex, etc.)'
          : 'Exact xBloom numbers for other xBloom users.'}
      </div>
      <pre className="bg-stone-100 rounded-xl p-3 text-xs whitespace-pre-wrap text-stone-800 select-all">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="w-full bg-stone-900 text-white rounded-2xl py-3 text-sm font-medium"
      >
        {copied ? '✓ Copied' : 'Copy as text'}
      </button>
    </div>
  )
}
