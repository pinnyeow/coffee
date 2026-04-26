import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pickRecipe, avgRating, type BrewForPicker } from '@/lib/recipe-picker'
import HomeMineView, {
  type BeanCardData,
  type UnbrewedBookmark,
} from './home-mine-view'
import HomeFriendsView, {
  type FriendBeanCard,
  type FriendBookmark,
} from './home-friends-view'

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

  // Build friend bookmarks (RLS gates by share_want_to_try flag)
  let friendBookmarks: FriendBookmark[] = []
  if (isFriendsView && friendIds.length > 0) {
    const { data: rawBookmarks } = await supabase
      .from('bean_bookmarks')
      .select(
        'bean:beans(id, name, slug, roaster, origin), user:users(username, display_name)'
      )
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
    friendBookmarks = ((rawBookmarks ?? []) as unknown as {
      bean: FriendBookmark['bean'] | null
      user: FriendBookmark['user'] | null
    }[])
      .filter((r) => r.bean && r.user)
      .map((r) => ({ bean: r.bean!, user: r.user! }))
  }

  // Build friend bean cards (Friends view only) — group brews by (user, bean), pick best/latest
  let friendBeanCards: FriendBeanCard[] = []
  if (isFriendsView && friendIds.length > 0) {
    const grouped = new Map<string, BrewRow[]>()
    for (const b of brews) {
      if (!b.bean || !b.user) continue
      const key = `${b.user.id}::${b.bean.id}`
      const arr = grouped.get(key) ?? []
      arr.push(b)
      grouped.set(key, arr)
    }
    for (const [, group] of grouped) {
      const first = group[0]
      if (!first.bean || !first.user) continue
      const recipe = pickRecipe(group)!
      const latestBrewAt = group.reduce(
        (max, b) =>
          new Date(b.created_at).getTime() > new Date(max).getTime() ? b.created_at : max,
        group[0].created_at
      )
      const starredAt =
        group.filter((b) => b.is_best).reduce<string | null>((latest, b) => {
          if (!latest || new Date(b.created_at).getTime() > new Date(latest).getTime()) {
            return b.created_at
          }
          return latest
        }, null)
      friendBeanCards.push({
        beanId: first.bean.id,
        beanName: first.bean.name,
        beanSlug: first.bean.slug,
        beanRoaster: first.bean.roaster,
        beanOrigin: first.bean.origin,
        user: first.user,
        brewCount: group.length,
        hasExplicitStar: recipe.hasExplicitStar,
        hasRatingVariance: recipe.hasRatingVariance,
        recipeLabel: recipe.label,
        recipe: {
          id: recipe.brew.id,
          dose_g: recipe.brew.dose_g,
          water_ml: recipe.brew.water_ml,
          grind_xbloom: recipe.brew.grind_xbloom,
          water_temp_c: recipe.brew.water_temp_c,
          time_seconds: recipe.brew.time_seconds,
          rating: recipe.brew.rating,
          created_at: recipe.brew.created_at,
        },
        latestBrewAt,
        latestStarredAt: starredAt,
      })
    }
  }

  // Bookmarks + bean-card prep (Mine view only)
  let beanCards: BeanCardData[] = []
  let unbrewedBookmarks: UnbrewedBookmark[] = []
  if (!isFriendsView) {
    const brewedBeanIds = new Set(brews.map((b) => b.bean?.id).filter(Boolean) as string[])

    const { data: bookmarks } = await supabase
      .from('bean_bookmarks')
      .select('bean:beans(id, name, slug, roaster, origin), created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const bookmarkedIds = new Set<string>()
    for (const row of bookmarks ?? []) {
      const b = (row.bean as unknown) as UnbrewedBookmark | null
      if (!b) continue
      bookmarkedIds.add(b.id)
      if (!brewedBeanIds.has(b.id)) {
        unbrewedBookmarks.push(b)
      }
    }

    // Group brews by bean
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

    beanCards = Array.from(byBean.values())
      .map(({ bean, brews }) => {
        const recipe = pickRecipe(brews)!
        return {
          beanId: bean.id,
          name: bean.name,
          slug: bean.slug,
          roaster: bean.roaster,
          origin: bean.origin,
          brewCount: brews.length,
          avgRating: avgRating(brews),
          hasExplicitStar: recipe.hasExplicitStar,
          hasRatingVariance: recipe.hasRatingVariance,
          recipeLabel: recipe.label,
          isBookmarked: bookmarkedIds.has(bean.id),
          recipe: {
            dose_g: recipe.brew.dose_g,
            water_ml: recipe.brew.water_ml,
            grind_xbloom: recipe.brew.grind_xbloom,
            water_temp_c: recipe.brew.water_temp_c,
            time_seconds: recipe.brew.time_seconds,
            created_at: recipe.brew.created_at,
          },
          _maxRating: Math.max(...brews.map((b) => b.rating)),
          _latestTs: Math.max(
            ...brews.map((b) => new Date(b.created_at).getTime())
          ),
        }
      })
      .sort((a, b) => {
        if (b._maxRating !== a._maxRating) return b._maxRating - a._maxRating
        return b._latestTs - a._latestTs
      })
      .map(({ _maxRating, _latestTs, ...rest }) => {
        void _maxRating
        void _latestTs
        return rest
      })
  }

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
          <HomeFriendsView cards={friendBeanCards} bookmarks={friendBookmarks} />
        ) : (
          <HomeMineView
            beanCards={beanCards}
            unbrewedBookmarks={unbrewedBookmarks}
          />
        )}
      </section>
    </main>
  )
}

