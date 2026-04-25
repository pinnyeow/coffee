import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  pickRecipe,
  avgRating,
  formatRelative,
  type BrewForPicker,
} from '@/lib/recipe-picker'

type BrewRow = BrewForPicker & {
  bean: {
    id: string
    name: string
    slug: string
    roaster: string | null
    origin: string | null
  } | null
  user: { id: string; username: string | null; display_name: string | null } | null
}

function formatTime(seconds: number | null) {
  if (seconds == null) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatStars(r: number) {
  const rounded = Math.round(r)
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
}

function avatarColor(name: string) {
  const palette = [
    'bg-amber-200 text-amber-800',
    'bg-sky-200 text-sky-800',
    'bg-rose-200 text-rose-800',
    'bg-green-200 text-green-800',
    'bg-violet-200 text-violet-800',
  ]
  const i = Array.from(name).reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length
  return palette[i]
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { view } = await searchParams
  const isFriendsView = view === 'friends'

  // Pending incoming friend requests (for badge + banner)
  const { count: pendingCount } = await supabase
    .from('friendships')
    .select('user_id', { count: 'exact', head: true })
    .eq('friend_id', user.id)
    .eq('status', 'pending')

  // Resolve friend list (for Friends view)
  let friendIds: string[] = []
  if (isFriendsView) {
    const [{ data: out }, { data: inc }] = await Promise.all([
      supabase.from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted'),
      supabase.from('friendships').select('user_id').eq('friend_id', user.id).eq('status', 'accepted'),
    ])
    friendIds = [
      ...(out ?? []).map((r) => r.friend_id),
      ...(inc ?? []).map((r) => r.user_id),
    ]
  }

  // Build query
  let brewsQuery = supabase
    .from('brews')
    .select(
      'id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, created_at, bean:beans(id, name, slug, roaster, origin), user:users(id, username, display_name)'
    )
    .order('created_at', { ascending: false })

  if (isFriendsView) {
    if (friendIds.length === 0) {
      brewsQuery = brewsQuery.eq('user_id', '00000000-0000-0000-0000-000000000000') // empty result
    } else {
      brewsQuery = brewsQuery.in('user_id', friendIds).eq('visibility', 'friends')
    }
  } else {
    brewsQuery = brewsQuery.eq('user_id', user.id)
  }

  const { data, error } = await brewsQuery
  const brews = (data ?? []) as unknown as BrewRow[]

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500">Welcome back</div>
          <h1 className="text-2xl font-semibold">Pour</h1>
        </div>
        <Link
          href="/settings"
          className="relative w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600"
          aria-label={
            pendingCount && pendingCount > 0
              ? `Settings — ${pendingCount} pending friend request${pendingCount === 1 ? '' : 's'}`
              : 'Settings'
          }
        >
          ⚙
          {pendingCount != null && pendingCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full ring-2 ring-stone-50"
              aria-hidden="true"
            />
          )}
        </Link>
      </header>

      {pendingCount != null && pendingCount > 0 && (
        <div className="px-6 mb-3">
          <Link
            href="/settings"
            className="block bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-900 active:bg-amber-100"
          >
            🔔 You have {pendingCount} pending friend request
            {pendingCount === 1 ? '' : 's'} →
          </Link>
        </div>
      )}

      <div className="px-6">
        <Link
          href="/log"
          className="block w-full bg-stone-900 text-white rounded-2xl py-4 text-base font-medium text-center"
        >
          + Log a brew
        </Link>
      </div>

      <div className="px-6 mt-5 flex items-center justify-between">
        <div className="bg-stone-100 rounded-xl p-1 inline-flex text-xs font-medium">
          <Link
            href="/"
            scroll={false}
            className={`px-3 py-1.5 rounded-lg ${
              !isFriendsView ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Mine
          </Link>
          <Link
            href="/?view=friends"
            scroll={false}
            className={`px-3 py-1.5 rounded-lg ${
              isFriendsView ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            Friends
          </Link>
        </div>
      </div>

      <section className="px-6 mt-4 pb-10">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            Error loading: {error.message}
          </div>
        )}

        {isFriendsView ? (
          <FriendsFeed brews={brews} />
        ) : (
          <MyBeans brews={brews} />
        )}
      </section>
    </main>
  )
}

function MyBeans({ brews }: { brews: BrewRow[] }) {
  // Group by bean
  const byBean = new Map<
    string,
    { bean: NonNullable<BrewRow['bean']>; brews: BrewForPicker[] }
  >()
  for (const b of brews) {
    if (!b.bean) continue
    const entry = byBean.get(b.bean.id)
    const brewOnly: BrewForPicker = {
      id: b.id,
      dose_g: b.dose_g,
      water_ml: b.water_ml,
      grind_xbloom: b.grind_xbloom,
      water_temp_c: b.water_temp_c,
      time_seconds: b.time_seconds,
      rating: b.rating,
      notes: b.notes,
      is_best: b.is_best,
      created_at: b.created_at,
    }
    if (entry) entry.brews.push(brewOnly)
    else byBean.set(b.bean.id, { bean: b.bean, brews: [brewOnly] })
  }

  const beanCards = Array.from(byBean.values())
    .map(({ bean, brews }) => {
      const recipe = pickRecipe(brews)!
      return {
        bean,
        brews,
        recipe,
        maxRating: Math.max(...brews.map((b) => b.rating)),
        latestTs: Math.max(...brews.map((b) => new Date(b.created_at).getTime())),
        avg: avgRating(brews),
      }
    })
    .sort((a, b) => {
      if (b.maxRating !== a.maxRating) return b.maxRating - a.maxRating
      return b.latestTs - a.latestTs
    })

  if (beanCards.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
        No beans yet. Log your first brew or import from Obsidian in Settings.
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-stone-800">Your beans · {beanCards.length}</h2>
        <span className="text-xs text-stone-500">Highest rated first</span>
      </div>
      <div className="space-y-3">
        {beanCards.map(({ bean, brews, recipe, avg }) => {
          const showStars = recipe.hasRatingVariance || recipe.hasExplicitStar
          const b = recipe.brew
          const ratio =
            b.water_ml != null && b.dose_g > 0
              ? (b.water_ml / b.dose_g).toFixed(1)
              : null
          return (
            <Link
              key={bean.id}
              href={`/beans/${bean.slug}`}
              className="block bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 active:bg-stone-50"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 truncate">{bean.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {[bean.origin, bean.roaster].filter(Boolean).join(' · ')}
                    {bean.origin || bean.roaster ? ' · ' : ''}
                    {brews.length} brew{brews.length === 1 ? '' : 's'} · last{' '}
                    {formatRelative(b.created_at)}
                  </div>
                </div>
                {showStars && (
                  <div className="text-sm text-amber-500 shrink-0 ml-2">
                    {formatStars(avg)}
                  </div>
                )}
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-stone-500">
                {recipe.label} recipe
              </div>
              <div className="mt-1 flex gap-2 text-sm text-stone-800 flex-wrap">
                <span>{b.dose_g}g</span>
                {b.water_ml != null && <><span className="text-stone-300">·</span><span>{b.water_ml}ml</span></>}
                {ratio && <><span className="text-stone-300">·</span><span>1:{ratio}</span></>}
                {b.water_temp_c != null && <><span className="text-stone-300">·</span><span>{b.water_temp_c}°C</span></>}
                {b.grind_xbloom != null && <><span className="text-stone-300">·</span><span>grind {b.grind_xbloom}</span></>}
                {b.time_seconds != null && <><span className="text-stone-300">·</span><span className="font-medium">{formatTime(b.time_seconds)}</span></>}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}

function FriendsFeed({ brews }: { brews: BrewRow[] }) {
  if (brews.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
        Nothing from friends yet. Add a friend by username in <Link href="/settings" className="underline">Settings</Link>, then they&apos;ll show up here when they log brews.
      </div>
    )
  }
  return (
    <>
      <div className="mb-3">
        <h2 className="font-medium text-stone-800">Friends&apos; recent brews</h2>
      </div>
      <div className="space-y-3">
        {brews.map((b) => {
          const ratio =
            b.water_ml != null && b.dose_g > 0
              ? (b.water_ml / b.dose_g).toFixed(1)
              : null
          const handle = b.user?.username ?? '?'
          const displayName = b.user?.display_name ?? handle
          return (
            <Link
              key={b.id}
              href={b.bean ? `/beans/${b.bean.slug}` : '#'}
              className="block bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 active:bg-stone-50"
            >
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span
                  className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-semibold ${avatarColor(
                    handle
                  )}`}
                >
                  {(displayName?.[0] ?? '?').toUpperCase()}
                </span>
                <span>
                  <b className="text-stone-700">{displayName}</b> ·{' '}
                  {formatRelative(b.created_at)}
                </span>
              </div>
              <div className="mt-2 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 truncate">
                    {b.bean?.name ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {[b.bean?.origin, b.bean?.roaster].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-sm text-amber-500 shrink-0 ml-2">
                  {formatStars(b.rating)}
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-sm text-stone-800 flex-wrap">
                <span>{b.dose_g}g</span>
                {b.water_ml != null && <><span className="text-stone-300">·</span><span>{b.water_ml}ml</span></>}
                {ratio && <><span className="text-stone-300">·</span><span>1:{ratio}</span></>}
                {b.water_temp_c != null && <><span className="text-stone-300">·</span><span>{b.water_temp_c}°C</span></>}
                {b.grind_xbloom != null && <><span className="text-stone-300">·</span><span>grind {b.grind_xbloom}</span></>}
                {b.time_seconds != null && <><span className="text-stone-300">·</span><span className="font-medium">{formatTime(b.time_seconds)}</span></>}
              </div>
              {b.notes && (
                <div className="text-xs text-stone-600 mt-1 italic">&ldquo;{b.notes}&rdquo;</div>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}
