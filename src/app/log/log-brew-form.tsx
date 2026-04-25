'use client'

import { useActionState, useState } from 'react'
import { saveBrew, type BrewFormState } from '@/lib/actions/brews'

const initialState: BrewFormState = {}

export type LogBrewDefaults = {
  bean: string
  roaster: string
  origin: string
  purchased_country: string
  purchased_city: string
  purchased_at: string
  dose_g: string
  grind_xbloom: string
  water_ml: string
  water_temp_c: string
  time_str: string
  profile_id: string
}

export type ProfileOption = {
  id: string
  name: string
  method: string
  dose_g: number | null
  grind: number | null
  ratio: number | null
  rpm: number | null
  temp_c: number | null
  is_default: boolean
}

export default function LogBrewForm({
  defaults,
  hint,
  profiles,
}: {
  defaults: LogBrewDefaults
  hint: string
  profiles: ProfileOption[]
}) {
  const [state, formAction, pending] = useActionState(saveBrew, initialState)
  const [rating, setRating] = useState<number>(4)

  const [dose, setDose] = useState(defaults.dose_g)
  const [grind, setGrind] = useState(defaults.grind_xbloom)
  const [water, setWater] = useState(defaults.water_ml)
  const [temp, setTemp] = useState(defaults.water_temp_c)
  const [profileId, setProfileId] = useState(defaults.profile_id)

  function applyProfile(id: string) {
    setProfileId(id)
    if (!id) return
    const p = profiles.find((x) => x.id === id)
    if (!p) return
    if (p.dose_g != null) setDose(String(p.dose_g))
    if (p.grind != null) setGrind(String(p.grind))
    if (p.temp_c != null) setTemp(String(p.temp_c))
    if (p.dose_g != null && p.ratio != null) {
      setWater(String(Math.round(p.dose_g * p.ratio)))
    }
  }

  // Live-compute ratio for display
  const doseNum = Number(dose)
  const waterNum = Number(water)
  const ratio =
    doseNum > 0 && waterNum > 0 ? (waterNum / doseNum).toFixed(1) : null

  return (
    <form action={formAction} className="px-6 pb-16 space-y-5">
      {hint && (
        <div className="rounded-xl px-3 py-2 text-xs bg-blue-50 text-blue-800 border border-blue-200 flex items-start gap-2">
          <span>✨</span>
          <span>{hint}</span>
        </div>
      )}

      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      {profiles.length > 0 && (
        <Field label="Profile">
          <select
            value={profileId}
            onChange={(e) => applyProfile(e.target.value)}
            className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
          >
            <option value="">(no profile)</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.is_default ? '★' : ''} · {p.method}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Bean" error={state.fieldErrors?.bean_name}>
        <input
          name="bean_name"
          required
          autoFocus={!defaults.bean}
          defaultValue={defaults.bean}
          placeholder="e.g., Torahebi Banana"
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Roaster">
          <input
            name="roaster"
            defaultValue={defaults.roaster}
            placeholder="Torahebi"
            className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
          />
        </Field>
        <Field label="Origin">
          <input
            name="origin"
            defaultValue={defaults.origin}
            placeholder="Ethiopia"
            className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
          />
        </Field>
      </div>

      <details className="bg-white rounded-2xl border border-stone-200">
        <summary className="px-4 py-3 text-xs text-stone-600 cursor-pointer list-none flex items-center justify-between">
          <span>
            Bought in <span className="text-stone-400 normal-case">— optional, remembered per bean</span>
          </span>
          <span className="text-stone-400">▾</span>
        </summary>
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <Field label="Country">
            <input
              name="purchased_country"
              defaultValue={defaults.purchased_country}
              placeholder="Japan"
              className="w-full bg-white border-b border-stone-300 py-1 text-sm focus:outline-none"
            />
          </Field>
          <Field label="City">
            <input
              name="purchased_city"
              defaultValue={defaults.purchased_city}
              placeholder="Tokyo"
              className="w-full bg-white border-b border-stone-300 py-1 text-sm focus:outline-none"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Shop / Cafe">
              <input
                name="purchased_at"
                defaultValue={defaults.purchased_at}
                placeholder="Torahebi"
                className="w-full bg-white border-b border-stone-300 py-1 text-sm focus:outline-none"
              />
            </Field>
          </div>
        </div>
      </details>

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
              value={grind}
              onChange={(e) => setGrind(e.target.value)}
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
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
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
