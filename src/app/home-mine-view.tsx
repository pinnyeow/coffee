'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

export type BeanCardData = {
  beanId: string
  name: string
  slug: string
  roaster: string | null
  origin: string | null
  brewCount: number
  avgRating: number
  hasExplicitStar: boolean
  hasRatingVariance: boolean
  recipeLabel: 'Best' | 'Latest'
  recipe: {
    dose_g: number
    water_ml: number | null
    grind_xbloom: number | null
    water_temp_c: number | null
    time_seconds: number | null
    created_at: string
  }
  isBookmarked: boolean
}

export type UnbrewedBookmark = {
  id: string
  name: string
  slug: string
  roaster: string | null
  origin: string | null
}

type Filter = 'all' | 'starred' | 'bookmarked'

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
  if (diffH < 24) return 'today'
  if (diffH < 48) return 'yesterday'
  if (diffH < 24 * 7) return `${Math.floor(diffH / 24)} days ago`
  if (diffH < 24 * 30) return `${Math.floor(diffH / (24 * 7))} weeks ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function matchesQuery(card: BeanCardData, q: string) {
  const haystack = `${card.name} ${card.roaster ?? ''} ${card.origin ?? ''}`.toLowerCase()
  return haystack.includes(q)
}

function matchesQueryUnbrewed(b: UnbrewedBookmark, q: string) {
  const haystack = `${b.name} ${b.roaster ?? ''} ${b.origin ?? ''}`.toLowerCase()
  return haystack.includes(q)
}

export default function HomeMineView({
  beanCards,
  unbrewedBookmarks,
}: {
  beanCards: BeanCardData[]
  unbrewedBookmarks: UnbrewedBookmark[]
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const visibleCards = useMemo(() => {
    let cards = beanCards
    if (filter === 'starred') cards = cards.filter((c) => c.hasExplicitStar)
    if (filter === 'bookmarked') cards = cards.filter((c) => c.isBookmarked)
    if (q) cards = cards.filter((c) => matchesQuery(c, q))
    return cards
  }, [beanCards, filter, q])

  const visibleUnbrewed = useMemo(() => {
    if (filter !== 'all' && filter !== 'bookmarked') return []
    if (q) return unbrewedBookmarks.filter((b) => matchesQueryUnbrewed(b, q))
    return unbrewedBookmarks
  }, [unbrewedBookmarks, filter, q])

  const hasResults = visibleCards.length > 0 || visibleUnbrewed.length > 0

  return (
    <>
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beans, roaster, origin…"
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

      {/* Filter chips */}
      <div className="flex gap-2 mb-4">
        <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="★ Starred" active={filter === 'starred'} onClick={() => setFilter('starred')} />
        <FilterChip
          label="Want to try"
          active={filter === 'bookmarked'}
          onClick={() => setFilter('bookmarked')}
        />
      </div>

      {/* Want to try (unbrewed bookmarks) */}
      {visibleUnbrewed.length > 0 && (
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">
            Want to try · {visibleUnbrewed.length}
          </div>
          <div className="space-y-2">
            {visibleUnbrewed.map((b) => (
              <Link
                key={b.id}
                href={`/beans/${b.slug}`}
                className="block bg-amber-50 rounded-2xl p-3 border border-amber-200 hover:border-amber-300"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-stone-900 truncate">{b.name}</div>
                    <div className="text-xs text-stone-600 mt-0.5">
                      {[b.origin, b.roaster].filter(Boolean).join(' · ') || 'No details yet'}
                    </div>
                  </div>
                  <span className="text-amber-600 text-sm shrink-0 ml-2">★</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bean cards */}
      {visibleCards.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-stone-800">
              {filter === 'starred'
                ? `Starred · ${visibleCards.length}`
                : filter === 'bookmarked'
                ? `Bookmarked · ${visibleCards.length}`
                : `Your beans · ${visibleCards.length}`}
            </h2>
            {filter === 'all' && (
              <span className="text-xs text-stone-500">Highest rated first</span>
            )}
          </div>
          <div className="space-y-3">
            {visibleCards.map((card) => {
              const showStars = card.hasRatingVariance || card.hasExplicitStar
              const r = card.recipe
              const ratio =
                r.water_ml != null && r.dose_g > 0 ? (r.water_ml / r.dose_g).toFixed(1) : null
              return (
                <Link
                  key={card.beanId}
                  href={`/beans/${card.slug}`}
                  className="block bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 active:bg-stone-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-stone-900 truncate flex items-center gap-1.5">
                        {card.name}
                        {card.isBookmarked && <span className="text-amber-500 text-xs">★</span>}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {[card.origin, card.roaster].filter(Boolean).join(' · ')}
                        {card.origin || card.roaster ? ' · ' : ''}
                        {card.brewCount} brew{card.brewCount === 1 ? '' : 's'} · last{' '}
                        {formatRelative(r.created_at)}
                      </div>
                    </div>
                    {showStars && (
                      <div className="text-sm text-amber-500 shrink-0 ml-2">
                        {formatStars(card.avgRating)}
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
      )}

      {!hasResults && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center text-sm text-stone-600">
          {q
            ? `No matches for "${query}"`
            : filter === 'starred'
            ? 'No starred brews yet. Open any brew and tick "Mark as best brew".'
            : filter === 'bookmarked'
            ? 'No bookmarks yet. Open any bean and tap ☆ Want to try.'
            : 'No beans yet. Log your first brew or import from Obsidian in Settings.'}
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
