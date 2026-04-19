import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type BrewRow = {
  id: string
  dose_g: number
  water_ml: number | null
  grind_xbloom: number | null
  water_temp_c: number | null
  time_seconds: number | null
  rating: number
  notes: string | null
  created_at: string
  bean: { name: string; roaster: string | null; origin: string | null } | null
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
  if (diffH < 24) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (diffH < 48) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data, error } = await supabase
    .from('brews')
    .select('id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, created_at, bean:beans(name, roaster, origin)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const brews = (data ?? []) as unknown as BrewRow[]

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500">Welcome back</div>
          <h1 className="text-2xl font-semibold">Pour</h1>
        </div>
        <form action="/sign-out" method="post">
          <button type="submit" className="text-xs text-stone-500 underline">
            Sign out
          </button>
        </form>
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
        <h2 className="font-medium text-stone-800 mb-3">Recent brews</h2>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            Error loading brews: {error.message}
          </div>
        )}

        {!error && brews.length === 0 && (
          <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
            No brews yet. Log your first one to get started.
          </div>
        )}

        <div className="space-y-3">
          {brews.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-stone-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-stone-900">
                    {b.bean?.name ?? 'Unknown bean'}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {[b.bean?.roaster, b.bean?.origin].filter(Boolean).join(' · ')}
                    {b.bean?.roaster || b.bean?.origin ? ' · ' : ''}
                    {formatDate(b.created_at)}
                  </div>
                </div>
                <div className="text-sm text-amber-500">{formatRating(b.rating)}</div>
              </div>
              <div className="flex gap-2 mt-3 text-sm text-stone-700 flex-wrap">
                <span>{b.dose_g}g</span>
                {b.water_ml != null && <><span className="text-stone-300">·</span><span>{b.water_ml}ml</span></>}
                {b.grind_xbloom != null && <><span className="text-stone-300">·</span><span>grind {b.grind_xbloom}</span></>}
                {b.water_temp_c != null && <><span className="text-stone-300">·</span><span>{b.water_temp_c}°C</span></>}
                {b.time_seconds != null && <><span className="text-stone-300">·</span><span>{formatTime(b.time_seconds)}</span></>}
              </div>
              {b.notes && (
                <div className="text-xs text-stone-600 mt-2 italic">&ldquo;{b.notes}&rdquo;</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
