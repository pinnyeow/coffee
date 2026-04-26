import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditBrewForm from './edit-brew-form'
import ShareButton from './share-button'

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
      'id, user_id, dose_g, water_ml, grind_xbloom, water_temp_c, time_seconds, rating, notes, is_best, visibility, created_at, derived_from_brew_id, bean:beans(id, name, slug, roaster, origin), user:users(id, username, display_name)'
    )
    .eq('id', id)
    .maybeSingle()

  if (!brew) notFound()

  const isOwner = brew.user_id === user.id
  const ownerInfo = (brew as unknown as {
    user: { id: string; username: string | null; display_name: string | null } | null
  }).user

  type DerivedFrom = {
    id: string
    user: { username: string | null; display_name: string | null } | null
    bean: { name: string; slug: string } | null
  }

  let derivedFrom: DerivedFrom | null = null
  if (brew.derived_from_brew_id) {
    const { data: src } = await supabase
      .from('brews')
      .select('id, user:users(username, display_name), bean:beans(name, slug)')
      .eq('id', brew.derived_from_brew_id)
      .maybeSingle()
    if (src) {
      derivedFrom = src as unknown as DerivedFrom
    }
  }

  const bean = brew.bean as unknown as {
    id: string
    name: string
    slug: string
    roaster: string | null
    origin: string | null
  } | null

  const backHref = bean ? `/beans/${bean.slug}` : '/'

  let timeStr = ''
  if (brew.time_seconds != null) {
    const m = Math.floor(brew.time_seconds / 60)
    const s = brew.time_seconds % 60
    timeStr = `${m}:${s.toString().padStart(2, '0')}`
  }

  const sourceLabel = derivedFrom?.user
    ? derivedFrom.user.display_name ??
      (derivedFrom.user.username ? `@${derivedFrom.user.username}` : 'a friend')
    : null

  const ownerLabel =
    !isOwner && ownerInfo
      ? ownerInfo.display_name ??
        (ownerInfo.username ? `@${ownerInfo.username}` : 'a friend')
      : null

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href={backHref} className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">{isOwner ? 'Edit brew' : "Friend's brew"}</h1>
        <div className="w-12" />
      </header>

      <div className="px-6 mb-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-3">
          <ShareButton
            brew={{
              bean_name: bean?.name ?? 'Brew',
              origin: bean?.origin ?? null,
              roaster: bean?.roaster ?? null,
              dose_g: brew.dose_g,
              water_ml: brew.water_ml,
              grind_xbloom: brew.grind_xbloom,
              water_temp_c: brew.water_temp_c,
              time_seconds: brew.time_seconds,
              rating: brew.rating,
              notes: brew.notes,
            }}
          />
        </div>
      </div>

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
              {ownerLabel && <> · by <b className="text-stone-700">{ownerLabel}</b></>}
              {brew.visibility === 'self' && <> · <span title="Private">🔒 private</span></>}
            </div>
          </>
        )}

        {sourceLabel && derivedFrom && (
          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-900">
            ✨ Recipe adapted from{' '}
            <b>{sourceLabel}</b>
            {derivedFrom.bean && (
              <>
                {' · '}
                <Link
                  href={`/brews/${derivedFrom.id}`}
                  className="underline"
                >
                  see original
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {isOwner ? (
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
            is_private: brew.visibility === 'self',
          }}
        />
      ) : (
        <ReadOnlyBrew
          brew={{
            dose_g: brew.dose_g,
            water_ml: brew.water_ml,
            grind_xbloom: brew.grind_xbloom,
            water_temp_c: brew.water_temp_c,
            time_seconds: brew.time_seconds,
            rating: brew.rating,
            notes: brew.notes,
          }}
          beanSlug={bean?.slug ?? null}
          beanName={bean?.name ?? null}
          roaster={bean?.roaster ?? null}
          origin={bean?.origin ?? null}
          fromUserId={brew.user_id}
          brewId={brew.id}
        />
      )}
    </main>
  )
}

function ReadOnlyBrew({
  brew,
  beanSlug,
  beanName,
  roaster,
  origin,
  fromUserId,
  brewId,
}: {
  brew: {
    dose_g: number
    water_ml: number | null
    grind_xbloom: number | null
    water_temp_c: number | null
    time_seconds: number | null
    rating: number
    notes: string | null
  }
  beanSlug: string | null
  beanName: string | null
  roaster: string | null
  origin: string | null
  fromUserId: string
  brewId: string
}) {
  const ratio =
    brew.water_ml != null && brew.dose_g > 0
      ? (brew.water_ml / brew.dose_g).toFixed(1)
      : null
  const m = brew.time_seconds != null ? Math.floor(brew.time_seconds / 60) : null
  const s = brew.time_seconds != null ? brew.time_seconds % 60 : null

  // Build prefill URL with attribution
  const params = new URLSearchParams()
  if (beanName) params.set('bean', beanName)
  if (roaster) params.set('roaster', roaster)
  if (origin) params.set('origin', origin)
  params.set('dose', String(brew.dose_g))
  if (brew.water_ml != null) params.set('water', String(brew.water_ml))
  if (brew.grind_xbloom != null) params.set('grind', String(brew.grind_xbloom))
  if (brew.water_temp_c != null) params.set('temp', String(brew.water_temp_c))
  if (m != null && s != null) params.set('time', `${m}:${s.toString().padStart(2, '0')}`)
  params.set('from', brewId)
  // fromUserId not used in URL but we kept it as a sanity arg
  void fromUserId

  return (
    <div className="px-6 pb-10 space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat label="DOSE" value={`${brew.dose_g}g`} />
          {brew.water_ml != null && <Stat label="WATER" value={`${brew.water_ml}ml`} />}
          {ratio && <Stat label="RATIO" value={`1:${ratio}`} />}
          {brew.water_temp_c != null && <Stat label="TEMP" value={`${brew.water_temp_c}°C`} />}
          {brew.grind_xbloom != null && <Stat label="GRIND" value={String(brew.grind_xbloom)} />}
          {brew.time_seconds != null && (
            <Stat label="TIME" value={`${m}:${s!.toString().padStart(2, '0')}`} />
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-stone-100 text-center text-sm text-amber-500">
          {'★'.repeat(brew.rating) + '☆'.repeat(5 - brew.rating)}
        </div>
        {brew.notes && (
          <div className="mt-3 text-sm text-stone-700 italic text-center">
            &ldquo;{brew.notes}&rdquo;
          </div>
        )}
      </div>

      <Link
        href={`/log?${params.toString()}`}
        className="block w-full bg-stone-900 text-white rounded-2xl py-3 text-sm font-medium text-center"
      >
        Use these settings →
      </Link>

      {beanSlug && (
        <Link
          href={`/beans/${beanSlug}`}
          className="block w-full bg-stone-100 rounded-2xl py-3 text-sm text-center text-stone-700"
        >
          ← Back to bean
        </Link>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
      <div className="text-lg font-semibold text-stone-900 mt-0.5">{value}</div>
    </div>
  )
}
