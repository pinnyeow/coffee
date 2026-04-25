import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  pickRecipe,
  avgRating,
  brewsHaveRatingVariance,
  formatRelative,
  type BrewForPicker,
} from '@/lib/recipe-picker'

type BrewRow = BrewForPicker

function formatTime(seconds: number | null) {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatStars(rating: number) {
  const rounded = Math.round(rating)
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded)
}

function prefillUrl(
  b: BrewRow,
  beanName: string,
  roaster: string | null,
  origin: string | null
) {
  const params = new URLSearchParams()
  params.set('bean', beanName)
  if (roaster) params.set('roaster', roaster)
  if (origin) params.set('origin', origin)
  params.set('dose', String(b.dose_g))
  if (b.water_ml != null) params.set('water', String(b.water_ml))
  if (b.grind_xbloom != null) params.set('grind', String(b.grind_xbloom))
  if (b.water_temp_c != null) params.set('temp', String(b.water_temp_c))
  if (b.time_seconds != null) {
    const m = Math.floor(b.time_seconds / 60)
    const s = b.time_seconds % 60
    params.set('time', `${m}:${s.toString().padStart(2, '0')}`)
  }
  return `/log?${params.toString()}`
}

export default async function BeanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: bean } = await supabase
    .from('beans')
    .select('id, name, roaster, origin, slug, purchased_country, purchased_city, purchased_at')
    .eq('slug', slug)
    .maybeSingle()

  if (!bean) notFound()

  const { data: brewsData } = await supabase
    .from('brews')
    .select(
      'id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, created_at'
    )
    .eq('bean_id', bean.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const brews = (brewsData ?? []) as BrewRow[]
  const recipe = pickRecipe(brews)
  const hasVariance = brewsHaveRatingVariance(brews)
  const avg = avgRating(brews)

  const best = recipe?.brew
  const ratio =
    best && best.water_ml != null && best.dose_g > 0
      ? (best.water_ml / best.dose_g).toFixed(1)
      : null

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-stone-600">← Back</Link>
        <div className="w-12" />
      </header>

      <div className="px-6">
        <div className="text-xs text-stone-500">
          {[bean.roaster, bean.origin].filter(Boolean).join(' · ') || ' '}
        </div>
        <h1 className="text-2xl font-semibold text-stone-900 mt-1">{bean.name}</h1>
        {(bean.purchased_country || bean.purchased_city || bean.purchased_at) && (
          <div className="text-xs text-stone-500 mt-1">
            Bought in{' '}
            {[bean.purchased_city, bean.purchased_country].filter(Boolean).join(', ')}
            {bean.purchased_at && <> · {bean.purchased_at}</>}
          </div>
        )}
        <div className="text-sm text-stone-500 mt-1">
          {brews.length} brew{brews.length === 1 ? '' : 's'}
          {hasVariance && (
            <>
              {' · '}
              <span className="text-amber-500">{formatStars(avg)}</span> avg
            </>
          )}
        </div>
      </div>

      {recipe && best && (
        <div className="px-6 mt-5">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
                <span>✨</span>
                {recipe.label === 'Best' ? 'BEST RECIPE' : 'LATEST RECIPE'}
              </div>
              <div className="text-xs text-amber-800">
                {recipe.hasExplicitStar
                  ? 'Starred'
                  : recipe.label === 'Best'
                  ? 'Highest-rated'
                  : 'Most recent'}
                {' · '}
                {formatRelative(best.created_at)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="DOSE" value={`${best.dose_g}g`} />
              {best.water_ml != null && <Stat label="WATER" value={`${best.water_ml}ml`} />}
              {ratio && <Stat label="RATIO" value={`1:${ratio}`} />}
              {best.water_temp_c != null && (
                <Stat label="TEMP" value={`${best.water_temp_c}°C`} />
              )}
              {best.grind_xbloom != null && (
                <Stat label="GRIND" value={String(best.grind_xbloom)} />
              )}
              {best.time_seconds != null && (
                <Stat label="TIME" value={formatTime(best.time_seconds)} />
              )}
            </div>
            {best.notes && (
              <div className="mt-3 text-xs text-amber-900/80 italic text-center">
                &ldquo;{best.notes}&rdquo;
              </div>
            )}
            <Link
              href={prefillUrl(best, bean.name, bean.roaster, bean.origin)}
              className="mt-4 block w-full bg-stone-900 text-white rounded-xl py-3 text-sm font-medium text-center"
            >
              Use these settings →
            </Link>
          </div>
        </div>
      )}

      <section className="px-6 mt-6 pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-stone-800">All brews</h2>
          <Link
            href={
              `/log?bean=${encodeURIComponent(bean.name)}` +
              (bean.roaster ? `&roaster=${encodeURIComponent(bean.roaster)}` : '') +
              (bean.origin ? `&origin=${encodeURIComponent(bean.origin)}` : '') +
              (bean.purchased_country
                ? `&country=${encodeURIComponent(bean.purchased_country)}`
                : '') +
              (bean.purchased_city ? `&city=${encodeURIComponent(bean.purchased_city)}` : '') +
              (bean.purchased_at ? `&shop=${encodeURIComponent(bean.purchased_at)}` : '')
            }
            className="text-xs text-stone-900 font-medium"
          >
            + New brew
          </Link>
        </div>

        {brews.length === 0 && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
            No brews yet for this bean.
          </div>
        )}

        <div className="space-y-3">
          {brews.map((b) => (
            <Link
              key={b.id}
              href={`/brews/${b.id}`}
              className="block bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 active:bg-stone-50"
            >
              <div className="flex items-start justify-between">
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  {b.id === best?.id && <span className="text-amber-500">★</span>}
                  {formatRelative(b.created_at)}
                </div>
                {hasVariance && (
                  <div className="text-sm text-amber-500">{formatStars(b.rating)}</div>
                )}
              </div>
              <div className="flex gap-2 mt-2 text-sm text-stone-700 flex-wrap">
                <span>{b.dose_g}g</span>
                {b.water_ml != null && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span>{b.water_ml}ml</span>
                  </>
                )}
                {b.grind_xbloom != null && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span>grind {b.grind_xbloom}</span>
                  </>
                )}
                {b.water_temp_c != null && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span>{b.water_temp_c}°C</span>
                  </>
                )}
                {b.time_seconds != null && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="font-medium">{formatTime(b.time_seconds)}</span>
                  </>
                )}
              </div>
              {b.notes && (
                <div className="text-xs text-stone-600 mt-1 italic">&ldquo;{b.notes}&rdquo;</div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-amber-800">{label}</div>
      <div className="font-semibold text-stone-900">{value}</div>
    </div>
  )
}
