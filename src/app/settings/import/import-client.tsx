'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { importObsidianJournal, type ImportResult } from '@/lib/actions/import'

export default function ImportClient() {
  const router = useRouter()
  const [fileName, setFileName] = useState<string | null>(null)
  const [text, setText] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const content = await file.text()
    setText(content)
    setResult(null)
  }

  async function doImport() {
    if (!text) return
    setPending(true)
    const res = await importObsidianJournal(text)
    setResult(res)
    setPending(false)
  }

  if (result?.ok && result.summary) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
          ✓ Imported <b>{result.summary.beansCreated}</b> new bean(s),
          {' '}matched <b>{result.summary.beansMatched}</b> existing,
          {' '}created <b>{result.summary.brewsCreated}</b> brew(s).
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-4">
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">
            Beans imported ({result.summary.beans.length})
          </div>
          <ul className="text-sm text-stone-800 space-y-1">
            {result.summary.beans.map((b) => (
              <li key={b.name} className="flex justify-between gap-2">
                <span className="truncate">{b.name}</span>
                <span className="text-xs text-stone-500 shrink-0">
                  {b.origin ?? 'origin?'} · {b.brewCount} brew{b.brewCount === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {result.summary.skipped.length > 0 && (
          <details className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs">
            <summary className="cursor-pointer font-medium text-amber-900">
              {result.summary.skipped.length} line(s) skipped — click to review
            </summary>
            <ul className="mt-2 font-mono text-[11px] text-amber-900 space-y-0.5">
              {result.summary.skipped.slice(0, 50).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
              {result.summary.skipped.length > 50 && (
                <li className="italic">… and {result.summary.skipped.length - 50} more</li>
              )}
            </ul>
          </details>
        )}

        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full bg-stone-900 text-white rounded-2xl py-3 text-sm font-medium"
        >
          Go to Home →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {result?.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {result.error}
        </div>
      )}

      <label className="block rounded-2xl bg-white border-2 border-dashed border-stone-300 p-6 text-center cursor-pointer hover:border-stone-400">
        <input
          type="file"
          accept=".md,text/markdown,text/plain"
          onChange={onFile}
          className="hidden"
        />
        <div className="text-sm font-medium text-stone-800">
          {fileName ?? 'Choose .md file'}
        </div>
        <div className="text-xs text-stone-500 mt-1">
          Your Pour Over Journal from Obsidian
        </div>
      </label>

      {text && (
        <div className="rounded-2xl bg-white border border-stone-200 p-4 text-xs text-stone-600">
          <div className="font-medium text-stone-800 mb-1">File loaded</div>
          {fileName} · {text.length.toLocaleString()} chars
        </div>
      )}

      <button
        type="button"
        onClick={doImport}
        disabled={!text || pending}
        className="w-full bg-stone-900 text-white rounded-2xl py-3 text-sm font-medium disabled:opacity-50"
      >
        {pending ? 'Importing…' : 'Import'}
      </button>
    </div>
  )
}
