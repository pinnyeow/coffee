import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileActions from './profile-actions'
import FriendsSection from './friends-section'
import ShareWantToTryToggle from './share-want-to-try-toggle'

type ProfileRow = {
  id: string
  name: string
  method: string
  dose_g: number | null
  grind: number | null
  ratio: number | null
  rpm: number | null
  temp_c: number | null
  time_s: number | null
  yield_g: number | null
  is_default: boolean
}

const POUR_METHODS = ['xBloom', 'V60', 'Chemex', 'AeroPress']
const ESPRESSO_METHODS = ['Espresso']

function summarize(p: ProfileRow): string {
  const parts: string[] = []
  if (p.dose_g != null) parts.push(`${p.dose_g}g`)
  if (p.yield_g != null) parts.push(`${p.yield_g}g out`)
  if (p.ratio != null) parts.push(`1:${p.ratio}`)
  if (p.temp_c != null) parts.push(`${p.temp_c}°C`)
  if (p.grind != null) parts.push(`grind ${p.grind}`)
  if (p.rpm != null) parts.push(`${p.rpm}rpm`)
  if (p.time_s != null) parts.push(`${p.time_s}s`)
  return parts.join(' · ')
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: settings } = await supabase
    .from('settings')
    .select('onboarded_from_obsidian, share_want_to_try')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: meRow } = await supabase
    .from('users')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle()

  // Friendships I sent
  const { data: outgoing } = await supabase
    .from('friendships')
    .select('status, friend:users!friendships_friend_id_fkey(id, username, display_name)')
    .eq('user_id', user.id)

  // Friendships sent to me
  const { data: incoming } = await supabase
    .from('friendships')
    .select('status, sender:users!friendships_user_id_fkey(id, username, display_name)')
    .eq('friend_id', user.id)

  const accepted: { user: { id: string; username: string | null; display_name: string | null } }[] = []
  const pendingOutgoing: typeof accepted = []
  const pendingIncoming: typeof accepted = []
  const seen = new Set<string>()

  for (const row of outgoing ?? []) {
    const f = (row.friend as unknown) as { id: string; username: string | null; display_name: string | null } | null
    if (!f) continue
    if (row.status === 'accepted' && !seen.has(f.id)) {
      seen.add(f.id)
      accepted.push({ user: f })
    } else if (row.status === 'pending') {
      pendingOutgoing.push({ user: f })
    }
  }
  for (const row of incoming ?? []) {
    const u = (row.sender as unknown) as { id: string; username: string | null; display_name: string | null } | null
    if (!u) continue
    if (row.status === 'accepted' && !seen.has(u.id)) {
      seen.add(u.id)
      accepted.push({ user: u })
    } else if (row.status === 'pending') {
      pendingIncoming.push({ user: u })
    }
  }

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, name, method, dose_g, grind, ratio, rpm, temp_c, time_s, yield_g, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('name')

  const profiles = (profilesData ?? []) as ProfileRow[]
  const pourOver = profiles.filter((p) => POUR_METHODS.includes(p.method))
  const espresso = profiles.filter((p) => ESPRESSO_METHODS.includes(p.method))

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">Settings</h1>
        <div className="w-12" />
      </header>

      <div className="px-6 pb-10 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          Profiles auto-fill every new brew so you don&apos;t retype the same settings.
        </div>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] uppercase tracking-wider text-stone-500">Pour over profiles</h2>
            <Link
              href="/settings/profiles/new?method=xBloom"
              className="text-xs font-medium text-stone-900"
            >
              + Add
            </Link>
          </div>
          <ProfileList profiles={pourOver} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] uppercase tracking-wider text-stone-500">Espresso profiles</h2>
            <Link
              href="/settings/profiles/new?method=Espresso"
              className="text-xs font-medium text-stone-900"
            >
              + Add
            </Link>
          </div>
          <ProfileList profiles={espresso} />
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Friends</h2>
          <FriendsSection
            myUsername={meRow?.username ?? null}
            myDisplayName={meRow?.display_name ?? null}
            pendingIncoming={pendingIncoming}
            pendingOutgoing={pendingOutgoing}
            accepted={accepted}
          />
          <div className="mt-4">
            <ShareWantToTryToggle initial={Boolean(settings?.share_want_to_try)} />
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Data</h2>
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
            {!settings?.onboarded_from_obsidian ? (
              <Link
                href="/settings/import"
                className="flex items-center justify-between px-4 py-3 text-sm text-stone-800"
              >
                <span>Import from Obsidian</span>
                <span className="text-stone-400">›</span>
              </Link>
            ) : (
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-800">Import from Obsidian</span>
                  <span className="text-xs text-green-700">✓ done</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">One-time only.</div>
              </div>
            )}
            <form action="/sign-out" method="post">
              <button
                type="submit"
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-red-600"
              >
                <span>Sign out</span>
                <span className="text-red-300">›</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

function ProfileList({ profiles }: { profiles: ProfileRow[] }) {
  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-4 text-center text-xs text-stone-500">
        No profiles yet. Add one to speed up logging.
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {profiles.map((p) => (
        <div
          key={p.id}
          className={`bg-white rounded-2xl p-3 border ${p.is_default ? 'border-amber-300' : 'border-stone-200'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={p.is_default ? 'text-amber-500' : 'text-stone-300'}>
                  ★
                </span>
                <span className="font-medium text-sm text-stone-900 truncate">
                  {p.name}
                </span>
                <span className="text-[10px] bg-stone-100 text-stone-600 rounded-full px-2 py-0.5">
                  {p.method}
                </span>
                {p.is_default && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                    default
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">{summarize(p)}</div>
            </div>
            <ProfileActions id={p.id} method={p.method} isDefault={p.is_default} />
          </div>
        </div>
      ))}
    </div>
  )
}
