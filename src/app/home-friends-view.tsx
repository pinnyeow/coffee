'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

export type FriendBeanCard = {
  beanId: string
  beanName: string
  beanSlug: string
  beanRoaster: string | null
  beanOrigin: string | null
  user: { id: string; username: string | null; display_name: string | null }
  brewCount: number
  hasExplicitStar: boolean
  hasRatingVariance: boolean
  recipeLabel: 'Best' | 'Latest'
  recipe: {
    id: string
    dose_g: number
    water_ml: number | null
    grind_xbloom: number | null
    water_temp_c: number | null
    time_seconds: number | null
    rating: number
    created_at: string
  }
  // For sorting
  latestBrewAt: string
  latestStarredAt: string | null
}

type Filter = 'all' | 'starred'

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

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 36e5
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${Math.floor(diffH)}h ago`
  if (diffH < 48) return 'yesterday'
  if (diffH < 24 * 7) return `${Math.floor(diffH / 24)} days ago`
  if (diffH < 24 * 30) return `${Math.floor(diffH / (24 * 7))} weeks ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
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

export default function HomeFriendsView({
  cards,
}: {
  cards: FriendBeanCard[]
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const visibleCards = useMemo(() => {
    let list = cards
    if (filter === 'starred') {
      list = list.filter((c) => c.hasExplicitStar)
      // Sort by latest *starred* time desc
      list = [...list].sort((a, b) => {
        const ta = a.latestStarredAt ? new Date(a.latestStarredAt).getTime() : 0
        const tb = b.latestStarredAt ? new Date(b.latestStarredAt).getTime() : 0
        return tb - ta
      })
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.latestBrewAt).getTime() - new Date(a.latestBrewAt).getTime()
      )
    }
    if (q) {
      list = list.filter((c) => {
        const haystack = `${c.beanName} ${c.beanRoaster ?? ''} ${c.beanOrigin ?? ''} ${
          c.user.display_name ?? ''
        } ${c.user.username ?? ''}`.toLowerCase()
        return haystack.includes(q)
      })
    }
    return list
  }, [cards, filter, q])

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
        Nothing from friends yet. Add a friend by username in{' '}
        <Link href="/settings" className="underline">
          Settings
        </Link>
        , then they&apos;ll show up here when they log brews.
      </div>
    )
  }

  return (
    <>
      <div className="mb-3">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bean, roaster, friend…"
            className="w-full bg-white rounded-xl py-2.5 pl-9 pr-9 text-sm border border-stone-200 focus:outline-none focus:border-stone-400"
          />
          <span className="absolute left-3 top-2.5 text-stone-400">⌕</span>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip
          label="★ Starred"
          active={filter === 'starred'}
          onClick={() => setFilter('starred')}
        />
      </div>

      {visibleCards.length > 0 ? (
        <>
          <div className="mb-3">
            <h2 className="font-medium text-stone-800">
              {filter === 'starred'
                ? `Starred · ${visibleCards.length}`
                : `Friends' beans · ${visibleCards.length}`}
            </h2>
          </div>
          <div className="space-y-3">
            {visibleCards.map((card) => {
              const r = card.recipe
              const ratio =
                r.water_ml != null && r.dose_g > 0 ? (r.water_ml / r.dose_g).toFixed(1) : null
              const handle = card.user.username ?? '?'
              const displayName = card.user.display_name ?? handle
              return (
                <Link
                  key={`${card.user.id}-${card.beanId}`}
                  href={`/beans/${card.beanSlug}`}
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
                      <b className="text-stone-700">{displayName}</b> · brewed{' '}
                      {formatRelative(card.latestBrewAt)}
                      {card.brewCount > 1 && ` · ${card.brewCount} brews`}
                      {card.hasExplicitStar && <> · <span className="text-amber-500">★ best</span></>}
                    </span>
                  </div>
                  <div className="mt-2 flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-stone-900 truncate">{card.beanName}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {[card.beanOrigin, card.beanRoaster].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    {(card.hasExplicitStar || card.hasRatingVariance) && (
                      <div className="text-sm text-amber-500 shrink-0 ml-2">
                        {formatStars(r.rating)}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-wider text-stone-500">
                    {card.recipeLabel} recipe
                  </div>
                  <div className="mt-1 flex gap-2 text-sm text-stone-800 flex-wrap">
                    <span>{r.dose_g}g</span>
                    {r.water_ml != null && <><span className="text-stone-300">·</span><span>{r.water_ml}ml</span></>}
                    {ratio && <><span className="text-stone-300">·</span><span>1:{ratio}</span></>}
                    {r.water_temp_c != null && <><span className="text-stone-300">·</span><span>{r.water_temp_c}°C</span></>}
                    {r.grind_xbloom != null && <><span className="text-stone-300">·</span><span>grind {r.grind_xbloom}</span></>}
                    {r.time_seconds != null && <><span className="text-stone-300">·</span><span className="font-medium">{formatTime(r.time_seconds)}</span></>}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
          {q
            ? `No matches for "${query}"`
            : filter === 'starred'
            ? 'No starred brews from friends yet.'
            : 'Nothing matches.'}
        </div>
      )}
    </>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium rounded-full px-3 py-1.5 border ${
        active
          ? 'bg-stone-900 text-white border-stone-900'
          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
      }`}
    >
      {label}
    </button>
  )
}
