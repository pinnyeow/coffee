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

  const { data: allProfilesData } = await supabase
    .from('profiles')
    .select('id, name, method, dose_g, grind, ratio, rpm, temp_c, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('name')

  const allProfiles = (allProfilesData ?? []) as ProfileOption[]
  const profiles = allProfiles.filter((p) =>
    ['xBloom', 'V60', 'Chemex', 'AeroPress'].includes(p.method)
  )
  const starred = profiles.find((p) => p.is_default)
  const hasOnlyEspressoProfiles =
    allProfiles.length > 0 && profiles.length === 0

  const prefillFromUrl = Boolean(pick('bean') || pick('dose') || pick('grind'))

  // Priority: URL params → starred profile → empty
  const water =
    pick('water') ??
    (starred?.dose_g != null && starred?.ratio != null
      ? String(Math.round(starred.dose_g * starred.ratio))
      : '')

  const fromBrewId = pick('from') ?? ''

  // If we have a "from" id, look up the source brew's owner display info for attribution hint
  let fromOwnerLabel: string | null = null
  if (fromBrewId) {
    const { data: src } = await supabase
      .from('brews')
      .select('user:users(username, display_name)')
      .eq('id', fromBrewId)
      .maybeSingle()
    const u = (src?.user as unknown) as { username: string | null; display_name: string | null } | null
    if (u) fromOwnerLabel = u.display_name ?? (u.username ? `@${u.username}` : 'a friend')
  }

  const defaults: LogBrewDefaults = {
    bean: pick('bean') ?? '',
    roaster: pick('roaster') ?? '',
    origin: pick('origin') ?? '',
    purchased_country: pick('country') ?? '',
    purchased_city: pick('city') ?? '',
    purchased_at: pick('shop') ?? '',
    dose_g: pick('dose') ?? (starred?.dose_g != null ? String(starred.dose_g) : ''),
    grind_xbloom: pick('grind') ?? (starred?.grind != null ? String(starred.grind) : ''),
    rpm_xbloom: pick('rpm') ?? (starred?.rpm != null ? String(starred.rpm) : ''),
    water_ml: water,
    water_temp_c: pick('temp') ?? (starred?.temp_c != null ? String(starred.temp_c) : ''),
    time_str: pick('time') ?? '',
    profile_id: starred?.id ?? '',
    derived_from_brew_id: fromBrewId,
  }

  const hint = fromOwnerLabel
    ? `Trying ${fromOwnerLabel}'s recipe for ${defaults.bean || 'this bean'}. We'll credit them on your brew.`
    : prefillFromUrl
    ? `Prefilled from best brew of ${defaults.bean || 'this bean'}. Tweak any field before saving.`
    : starred
    ? `Prefilled from your profile: ${starred.name}. Change profile or tweak fields below.`
    : hasOnlyEspressoProfiles
    ? "Espresso brew logging is coming soon ☕ For now, you can log pour-over brews here — add a pour-over profile in Settings to auto-fill."
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
