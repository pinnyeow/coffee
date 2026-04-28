'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProfile, updateProfile, type ProfileFormState } from '@/lib/actions/profiles'

type Profile = {
  id?: string
  name: string
  method: string
  dose_g: number | null
  grind: number | null
  ratio: number | null
  rpm: number | null
  temp_c: number | null
  time_s: number | null
  yield_g: number | null
}

const POUR_METHODS = ['xBloom', 'V60', 'Chemex', 'AeroPress']

export default function ProfileForm({
  initial,
  mode,
}: {
  initial: Profile
  mode: 'create' | 'update'
}) {
  const action = mode === 'create'
    ? createProfile
    : async (prev: ProfileFormState, fd: FormData) => updateProfile(initial.id!, prev, fd)

  const [state, formAction, pending] = useActionState(action, {} as ProfileFormState)

  const isEspresso = initial.method === 'Espresso'
  const isPour = POUR_METHODS.includes(initial.method)
  const isXBloom = initial.method === 'xBloom'

  return (
    <form action={formAction} className="px-6 pb-16 space-y-5">
      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <Field label="Profile name" error={state.fieldErrors?.name}>
        <input
          name="name"
          required
          defaultValue={initial.name}
          placeholder={isEspresso ? 'Cortado 1:2' : 'Light roast / 4-pour'}
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        />
      </Field>

      <Field label="Method" error={state.fieldErrors?.method}>
        <select
          name="method"
          defaultValue={initial.method}
          className="w-full bg-white rounded-xl py-3 px-4 border border-stone-300 text-sm"
        >
          <option>xBloom</option>
          <option>V60</option>
          <option>Chemex</option>
          <option>AeroPress</option>
          <option value="Espresso">Espresso (logging coming soon)</option>
          <option>French press</option>
          <option>Cold brew</option>
        </select>
      </Field>

      {isEspresso && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          <b>Heads up:</b> espresso brew logging is on the roadmap but not built yet. You can save this profile for later — fields will appear on the brew form once we ship it.
        </div>
      )}

      {isPour && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200">
          <div className="text-xs text-stone-500 mb-3">Pour over defaults</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dose (g)" error={state.fieldErrors?.dose_g}>
              <input name="dose_g" type="number" step="0.1" inputMode="decimal" defaultValue={initial.dose_g ?? ''} placeholder="15" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Ratio (1:x)" error={state.fieldErrors?.ratio}>
              <input name="ratio" type="number" step="0.5" inputMode="decimal" defaultValue={initial.ratio ?? ''} placeholder="17" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Grind" error={state.fieldErrors?.grind}>
              <input name="grind" type="number" step="0.5" inputMode="decimal" defaultValue={initial.grind ?? ''} placeholder={isXBloom ? '55' : ''} className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            {isXBloom ? (
              <Field label="RPM" error={state.fieldErrors?.rpm}>
                <input name="rpm" type="number" inputMode="numeric" defaultValue={initial.rpm ?? ''} placeholder="80" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
              </Field>
            ) : (
              <input type="hidden" name="rpm" value="" />
            )}
            <Field label="Temp (°C)" error={state.fieldErrors?.temp_c}>
              <input name="temp_c" type="number" step="0.5" inputMode="decimal" defaultValue={initial.temp_c ?? ''} placeholder="92" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <input type="hidden" name="yield_g" value="" />
            <input type="hidden" name="time_s" value="" />
          </div>
        </div>
      )}

      {isEspresso && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200">
          <div className="text-xs text-stone-500 mb-3">Espresso defaults</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dose in (g)" error={state.fieldErrors?.dose_g}>
              <input name="dose_g" type="number" step="0.1" inputMode="decimal" defaultValue={initial.dose_g ?? ''} placeholder="18" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Yield out (g)" error={state.fieldErrors?.yield_g}>
              <input name="yield_g" type="number" step="0.1" inputMode="decimal" defaultValue={initial.yield_g ?? ''} placeholder="36" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Grind" error={state.fieldErrors?.grind}>
              <input name="grind" type="number" step="0.1" inputMode="decimal" defaultValue={initial.grind ?? ''} placeholder="7" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Temp (°C)" error={state.fieldErrors?.temp_c}>
              <input name="temp_c" type="number" step="0.5" inputMode="decimal" defaultValue={initial.temp_c ?? ''} placeholder="93" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <Field label="Time (s)" error={state.fieldErrors?.time_s}>
              <input name="time_s" type="number" inputMode="numeric" defaultValue={initial.time_s ?? ''} placeholder="28" className="w-24 text-xl font-semibold bg-transparent border-b border-stone-300" />
            </Field>
            <input type="hidden" name="rpm" value="" />
            <input type="hidden" name="ratio" value="" />
          </div>
        </div>
      )}

      {!isPour && !isEspresso && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200 text-xs text-stone-500">
          (This method has no custom defaults yet — name and method only.)
          <input type="hidden" name="dose_g" value="" />
          <input type="hidden" name="grind" value="" />
          <input type="hidden" name="ratio" value="" />
          <input type="hidden" name="rpm" value="" />
          <input type="hidden" name="temp_c" value="" />
          <input type="hidden" name="time_s" value="" />
          <input type="hidden" name="yield_g" value="" />
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/settings"
          className="flex-1 bg-stone-100 rounded-2xl py-3 text-center text-sm font-medium"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-stone-900 text-white rounded-2xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Create profile' : 'Save changes'}
        </button>
      </div>
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
