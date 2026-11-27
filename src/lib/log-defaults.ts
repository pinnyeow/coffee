import type { LogBrewDefaults, ProfileOption } from '@/app/log/log-brew-form'

/**
 * Builds the Log form's starting values and hint.
 * Priority: URL params (e.g. "Use these settings →") → starred profile → empty.
 * Pure so it can be unit tested; the page does the data fetching.
 */
export function buildLogDefaults({
  params,
  allProfiles,
  fromOwnerLabel,
}: {
  params: Record<string, string | undefined>
  allProfiles: ProfileOption[]
  fromOwnerLabel: string | null
}): { defaults: LogBrewDefaults; hint: string; profiles: ProfileOption[] } {
  const pick = (k: string) => params[k]

  const profiles = allProfiles.filter((p) =>
    ['xBloom', 'V60', 'Chemex', 'AeroPress'].includes(p.method)
  )
  const starred = profiles.find((p) => p.is_default)
  const hasOnlyEspressoProfiles = allProfiles.length > 0 && profiles.length === 0

  const prefillFromUrl = Boolean(pick('bean') || pick('dose') || pick('grind'))

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
    dose_g: pick('dose') ?? (starred?.dose_g != null ? String(starred.dose_g) : ''),
    grind_xbloom: pick('grind') ?? (starred?.grind != null ? String(starred.grind) : ''),
    rpm_xbloom: pick('rpm') ?? (starred?.rpm != null ? String(starred.rpm) : ''),
    water_ml: water,
    water_temp_c: pick('temp') ?? (starred?.temp_c != null ? String(starred.temp_c) : ''),
    time_str: pick('time') ?? '',
    profile_id: starred?.id ?? '',
    derived_from_brew_id: pick('from') ?? '',
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

  return { defaults, hint, profiles }
}
