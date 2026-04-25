import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogBrewForm, { type LogBrewDefaults, type ProfileOption } from './log-brew-form'

export default async function LogBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const params = await searchParams
  const pick = (k: string) => {
    const v = params[k]
    return Array.isArray(v) ? v[0] : v
  }

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, name, method, dose_g, grind, ratio, rpm, temp_c, is_default')
    .eq('user_id', user.id)
    .in('method', ['xBloom', 'V60', 'Chemex', 'AeroPress'])
    .order('is_default', { ascending: false })
    .order('name')

  const profiles = (profilesData ?? []) as ProfileOption[]
  const starred = profiles.find((p) => p.is_default)

  const prefillFromUrl = Boolean(pick('bean') || pick('dose') || pick('grind'))

  // Priority: URL params → starred profile → empty
  const water =
    pick('water') ??
    (starred?.dose_g != null && starred?.ratio != null
      ? String(Math.round(starred.dose_g * starred.ratio))
      : '')

  const defaults: LogBrewDefaults = {
    bean: pick('bean') ?? '',
    roaster: pick('roaster') ?? '',
    origin: pick('origin') ?? '',
    purchased_country: pick('country') ?? '',
    purchased_city: pick('city') ?? '',
    purchased_at: pick('shop') ?? '',
    dose_g: pick('dose') ?? (starred?.dose_g != null ? String(starred.dose_g) : '15'),
    grind_xbloom: pick('grind') ?? (starred?.grind != null ? String(starred.grind) : ''),
    water_ml: water,
    water_temp_c: pick('temp') ?? (starred?.temp_c != null ? String(starred.temp_c) : ''),
    time_str: pick('time') ?? '',
    profile_id: starred?.id ?? '',
  }

  const hint = prefillFromUrl
    ? `Prefilled from best brew of ${defaults.bean || 'this bean'}. Tweak any field before saving.`
    : starred
    ? `Prefilled from your profile: ${starred.name}. Change profile or tweak fields below.`
    : profiles.length === 0
    ? 'No profile set. Create one in Settings to auto-fill future brews.'
    : ''

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">New brew</h1>
        <div className="w-12" />
      </header>

      <LogBrewForm defaults={defaults} hint={hint} profiles={profiles} />
    </main>
  )
}
