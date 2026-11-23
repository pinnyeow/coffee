import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogBrewForm, { type ProfileOption } from './log-brew-form'
import { buildLogDefaults } from '@/lib/log-defaults'

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

  const flatParams: Record<string, string | undefined> = {}
  for (const k of Object.keys(params)) flatParams[k] = pick(k)
  const { defaults, hint, profiles } = buildLogDefaults({
    params: flatParams,
    allProfiles,
    fromOwnerLabel,
  })

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
