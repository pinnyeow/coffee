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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data, error } = await supabase
    .from('brews')
    .select(
      'id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, created_at, bean:beans(id, name, slug, roaster, origin)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const brews = (data ?? []) as unknown as BrewRow[]

  // Group by bean
  const byBean = new Map<
    string,
    {
      bean: NonNullable<BrewRow['bean']>
      brews: BrewForPicker[]
    }
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

  // Build bean cards
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
    // Default sort: highest rating desc, then most recently brewed
    .sort((a, b) => {
      if (b.maxRating !== a.maxRating) return b.maxRating - a.maxRating
      return b.latestTs - a.latestTs
    })

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500">Welcome back</div>
          <h1 className="text-2xl font-semibold">Pour</h1>
        </div>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600"
          aria-label="Settings"
        >
          ⚙
        </Link>
      </header>

      <div className="px-6">
        <Link
          href="/log"
          className="block w-full bg-stone-900 text-white rounded-2xl py-4 text-base font-medium text-center"
        >
          + Log a brew
        </Link>
      </div>

      <section className="px-6 mt-6 pb-10">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            Error loading: {error.message}
          </div>
        )}

        {!error && beanCards.length === 0 && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
            No beans yet. Log your first brew or import from Obsidian in Settings.
          </div>
        )}

        {beanCards.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-stone-800">
              Your beans · {beanCards.length}
            </h2>
            <span className="text-xs text-stone-500">Highest rated first</span>
          </div>
        )}

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
                    <div className="font-medium text-stone-900 truncate">
                      {bean.name}
                    </div>
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

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">
                    {recipe.label} recipe
                  </div>
                </div>
                <div className="mt-1 flex gap-2 text-sm text-stone-800 flex-wrap">
                  <span>{b.dose_g}g</span>
                  {b.water_ml != null && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span>{b.water_ml}ml</span>
                    </>
                  )}
                  {ratio && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span>1:{ratio}</span>
                    </>
                  )}
                  {b.water_temp_c != null && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span>{b.water_temp_c}°C</span>
                    </>
                  )}
                  {b.grind_xbloom != null && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span>grind {b.grind_xbloom}</span>
                    </>
                  )}
                  {b.time_seconds != null && (
                    <>
                      <span className="text-stone-300">·</span>
                      <span className="font-medium">{formatTime(b.time_seconds)}</span>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
