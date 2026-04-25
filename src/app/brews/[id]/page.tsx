import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditBrewForm from './edit-brew-form'

export default async function BrewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: brew } = await supabase
    .from('brews')
    .select(
      'id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, created_at, bean:beans(id, name, slug, roaster, origin)'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!brew) notFound()

  const bean = brew.bean as unknown as {
    id: string
    name: string
    slug: string
    roaster: string | null
    origin: string | null
  } | null

  const backHref = bean ? `/beans/${bean.slug}` : '/'

  // Convert time_seconds → mm:ss for form
  let timeStr = ''
  if (brew.time_seconds != null) {
    const m = Math.floor(brew.time_seconds / 60)
    const s = brew.time_seconds % 60
    timeStr = `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href={backHref} className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">Edit brew</h1>
        <div className="w-12" />
      </header>

      <div className="px-6 pb-3">
        {bean && (
          <>
            <div className="text-xs text-stone-500">
              {[bean.roaster, bean.origin].filter(Boolean).join(' · ') || ' '}
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mt-0.5">{bean.name}</h2>
            <div className="text-xs text-stone-500 mt-0.5">
              Brewed {new Date(brew.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </>
        )}
      </div>

      <EditBrewForm
        id={brew.id}
        defaults={{
          dose_g: String(brew.dose_g),
          water_ml: brew.water_ml != null ? String(brew.water_ml) : '',
          grind_xbloom: brew.grind_xbloom != null ? String(brew.grind_xbloom) : '',
          water_temp_c: brew.water_temp_c != null ? String(brew.water_temp_c) : '',
          time_str: timeStr,
          rating: brew.rating,
          notes: brew.notes ?? '',
          is_best: brew.is_best,
        }}
      />
    </main>
  )
}
