import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type BrewRow = {
  id: string
  user_id: string
  dose_g: number
  water_ml: number | null
  grind_xbloom: number | null
  water_temp_c: number | null
  time_seconds: number | null
  rating: number
  notes: string | null
  is_best: boolean
  created_at: string
}

function formatTime(seconds: number | null) {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatRating(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 36e5
  if (diffH < 24) return 'Today'
  if (diffH < 48) return 'Yesterday'
  if (diffH < 24 * 7) return `${Math.floor(diffH / 24)} days ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function pickBest(brews: BrewRow[]): BrewRow | null {
  if (brews.length === 0) return null
  const starred = brews.find((b) => b.is_best)
  if (starred) return starred
  return [...brews].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })[0]
}

function prefillUrl(b: BrewRow, beanName: string, roaster: string | null, origin: string | null) {
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
    .select('id, name, roaster, origin, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!bean) notFound()

  const { data: brewsData } = await supabase
    .from('brews')
    .select('id, user_id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, created_at')
    .eq('bean_id', bean.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const brews = (brewsData ?? []) as BrewRow[]
  const best = pickBest(brews)
  const avgRating = brews.length
    ? brews.reduce((s, b) => s + b.rating, 0) / brews.length
    : 0

  const ratio = best && best.water_ml ? (best.water_ml / best.dose_g).toFixed(1) : null

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
        <div className="text-sm text-stone-500 mt-1">
          {brews.length} brew{brews.length === 1 ? '' : 's'}
          {brews.length > 0 && (
            <> · <span className="text-amber-500">{formatRating(Math.round(avgRating))}</span> avg</>
          )}
        </div>
      </div>

      {best && (
        <div className="px-6 mt-5">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
                <span>✨</span> RECOMMENDED RECIPE
              </div>
              <div className="text-xs text-amber-800">
                {best.is_best ? 'Starred best' : 'Your best rated'} · {formatDate(best.created_at)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="DOSE" value={`${best.dose_g}g`} />
              {best.water_ml != null && <Stat label="WATER" value={`${best.water_ml}ml`} />}
              {ratio && <Stat label="RATIO" value={`1:${ratio}`} />}
              {best.water_temp_c != null && <Stat label="TEMP" value={`${best.water_temp_c}°C`} />}
              {best.grind_xbloom != null && <Stat label="GRIND" value={String(best.grind_xbloom)} />}
              {best.time_seconds != null && <Stat label="TIME" value={formatTime(best.time_seconds)} />}
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
            href={`/log?bean=${encodeURIComponent(bean.name)}${bean.roaster ? `&roaster=${encodeURIComponent(bean.roaster)}` : ''}${bean.origin ? `&origin=${encodeURIComponent(bean.origin)}` : ''}`}
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
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-stone-200">
              <div className="flex items-start justify-between">
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  {b.id === best?.id && <span className="text-amber-500">★</span>}
                  {formatDate(b.created_at)}
                </div>
                <div className="text-sm text-amber-500">{formatRating(b.rating)}</div>
              </div>
              <div className="flex gap-2 mt-2 text-sm text-stone-700 flex-wrap">
                <span>{b.dose_g}g</span>
                {b.water_ml != null && <><span className="text-stone-300">·</span><span>{b.water_ml}ml</span></>}
                {b.grind_xbloom != null && <><span className="text-stone-300">·</span><span>{b.grind_xbloom}</span></>}
                {b.water_temp_c != null && <><span className="text-stone-300">·</span><span>{b.water_temp_c}°C</span></>}
                {b.time_seconds != null && <><span className="text-stone-300">·</span><span className="font-medium">{formatTime(b.time_seconds)}</span></>}
              </div>
              {b.notes && (
                <div className="text-xs text-stone-600 mt-1 italic">&ldquo;{b.notes}&rdquo;</div>
              )}
            </div>
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
