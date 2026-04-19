'use client'

import { useActionState, useState } from 'react'
import { saveBrew, type BrewFormState } from '@/lib/actions/brews'

const initialState: BrewFormState = {}

export default function LogBrewForm() {
  const [state, formAction, pending] = useActionState(saveBrew, initialState)
  const [rating, setRating] = useState<number>(4)

  return (
    <form action={formAction} className="px-6 pb-16 space-y-5">
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <Field label="Bean" error={state.fieldErrors?.bean_name}>
        <input
          name="bean_name"
          required
          autoFocus
          placeholder="e.g., Torahebi Banana"
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Roaster">
          <input
            name="roaster"
            placeholder="Torahebi"
            className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
          />
        </Field>
        <Field label="Origin">
          <input
            name="origin"
            placeholder="Ethiopia"
            className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
          />
        </Field>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-stone-200">
        <div className="text-xs text-stone-500 mb-3">xBloom settings</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dose (g)" error={state.fieldErrors?.dose_g}>
            <input name="dose_g" type="number" step="0.1" defaultValue="15" inputMode="decimal" className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none" />
          </Field>
          <Field label="Grind" error={state.fieldErrors?.grind_xbloom}>
            <input name="grind_xbloom" type="number" step="0.1" placeholder="55" inputMode="decimal" className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none" />
          </Field>
          <Field label="Water (ml)" error={state.fieldErrors?.water_ml}>
            <input name="water_ml" type="number" placeholder="225" inputMode="numeric" className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none" />
          </Field>
          <Field label="Temp (°C)" error={state.fieldErrors?.water_temp_c}>
            <input name="water_temp_c" type="number" step="0.1" placeholder="92" inputMode="decimal" className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none" />
          </Field>
          <Field label="Time">
            <input name="time_str" placeholder="3:14" className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none" />
          </Field>
        </div>
      </div>

      <Field label={<span>Rating <span className="text-red-500 normal-case">*</span></span>} error={state.fieldErrors?.rating}>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1 text-3xl select-none">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={n <= rating ? 'text-amber-500' : 'text-stone-300'}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </Field>

      <Field label={<span>Notes <span className="text-stone-400 normal-case">optional</span></span>}>
        <textarea
          name="notes"
          rows={2}
          placeholder="Taste, adjustments, observations…"
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-stone-900 text-white rounded-2xl py-4 text-base font-medium disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save brew'}
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
        {label}
      </div>
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  )
}
