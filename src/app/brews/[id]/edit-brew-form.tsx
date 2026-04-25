'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBrew, deleteBrew, type BrewFormState } from '@/lib/actions/brews'

type Defaults = {
  dose_g: string
  water_ml: string
  grind_xbloom: string
  water_temp_c: string
  time_str: string
  rating: number
  notes: string
  is_best: boolean
}

export default function EditBrewForm({
  id,
  defaults,
}: {
  id: string
  defaults: Defaults
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    async (prev: BrewFormState, fd: FormData) => updateBrew(id, prev, fd),
    {} as BrewFormState
  )
  const [rating, setRating] = useState<number>(defaults.rating)
  const [isBest, setIsBest] = useState<boolean>(defaults.is_best)
  const [dose, setDose] = useState(defaults.dose_g)
  const [water, setWater] = useState(defaults.water_ml)
  const [deletePending, startDelete] = useTransition()

  const doseNum = Number(dose)
  const waterNum = Number(water)
  const ratio =
    doseNum > 0 && waterNum > 0 ? (waterNum / doseNum).toFixed(1) : null

  return (
    <form action={formAction} className="px-6 pb-16 space-y-5">
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 border border-stone-200">
        <div className="text-xs text-stone-500 mb-3">xBloom settings</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dose (g)" error={state.fieldErrors?.dose_g}>
            <input
              name="dose_g"
              type="number"
              step="0.1"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              inputMode="decimal"
              className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none"
            />
          </Field>
          <Field label="Grind" error={state.fieldErrors?.grind_xbloom}>
            <input
              name="grind_xbloom"
              type="number"
              step="0.5"
              defaultValue={defaults.grind_xbloom}
              placeholder="55"
              inputMode="decimal"
              className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none"
            />
          </Field>
          <Field label="Water (ml)" error={state.fieldErrors?.water_ml}>
            <input
              name="water_ml"
              type="number"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              placeholder="225"
              inputMode="numeric"
              className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none"
            />
          </Field>
          <Field label="Temp (°C)" error={state.fieldErrors?.water_temp_c}>
            <input
              name="water_temp_c"
              type="number"
              step="0.5"
              defaultValue={defaults.water_temp_c}
              placeholder="92"
              inputMode="decimal"
              className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none"
            />
          </Field>
          <Field label="Time">
            <input
              name="time_str"
              defaultValue={defaults.time_str}
              placeholder="3:14"
              className="w-24 text-2xl font-semibold bg-transparent border-b border-stone-300 focus:outline-none"
            />
          </Field>
          {ratio && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
                Ratio
              </div>
              <div className="text-2xl font-semibold text-stone-700">1:{ratio}</div>
            </div>
          )}
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

      <Field label="Notes">
        <textarea
          name="notes"
          rows={2}
          defaultValue={defaults.notes}
          placeholder="Taste, adjustments, observations…"
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          name="is_best"
          checked={isBest}
          onChange={(e) => setIsBest(e.target.checked)}
          className="w-4 h-4"
        />
        <span>★ Mark as best brew for this bean</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-stone-900 text-white rounded-2xl py-4 text-base font-medium disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>

      <button
        type="button"
        disabled={deletePending}
        onClick={() => {
          if (confirm('Delete this brew?')) {
            startDelete(async () => {
              const res = await deleteBrew(id)
              if (res.error) {
                alert(res.error)
              } else if (res.redirectTo) {
                router.push(res.redirectTo)
              }
            })
          }
        }}
        className="w-full bg-white border border-red-200 text-red-700 rounded-2xl py-3 text-sm font-medium disabled:opacity-50"
      >
        {deletePending ? 'Deleting…' : 'Delete brew'}
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
