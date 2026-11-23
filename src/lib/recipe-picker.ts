export type BrewForPicker = {
  id: string
  dose_g: number
  water_ml: number | null
  grind_xbloom: number | null
  water_temp_c: number | null
  time_seconds: number | null
  rating: number
  notes: string | null
  is_best: boolean
  created_at: string
  /** True for placeholder ratings (e.g. Obsidian import's default 3★) the user never set. */
  rating_is_default?: boolean
}

export type RecipeResolution = {
  brew: BrewForPicker
  label: 'Best' | 'Latest'
  hasRatingVariance: boolean
  hasExplicitStar: boolean
  /** At least one brew carries a rating the user actually chose. */
  hasUserRating: boolean
}

/**
 * Picks the representative brew for a bean.
 * - If any brew is starred → "Best" = starred
 * - Else if ratings differ → "Best" = highest rating (ties broken by newest)
 * - Else all ratings are equal (e.g. imported, all 3★) → "Latest" = newest
 */
export function pickRecipe(brews: BrewForPicker[]): RecipeResolution | null {
  if (brews.length === 0) return null
  const hasUserRating = brewsHaveUserRating(brews)

  const starred = brews.find((b) => b.is_best)
  if (starred) {
    return {
      brew: starred,
      label: 'Best',
      hasRatingVariance: brewsHaveRatingVariance(brews),
      hasExplicitStar: true,
      hasUserRating,
    }
  }

  const hasVariance = brewsHaveRatingVariance(brews)
  if (hasVariance) {
    const sorted = [...brews].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    return {
      brew: sorted[0],
      label: 'Best',
      hasRatingVariance: true,
      hasExplicitStar: false,
      hasUserRating,
    }
  }

  // No variance, no star — use latest
  const latest = [...brews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]
  return {
    brew: latest,
    label: 'Latest',
    hasRatingVariance: false,
    hasExplicitStar: false,
    hasUserRating,
  }
}

export function brewsHaveRatingVariance(brews: BrewForPicker[]): boolean {
  if (brews.length <= 1) return false
  const first = brews[0].rating
  return brews.some((b) => b.rating !== first)
}

export function brewsHaveUserRating(brews: BrewForPicker[]): boolean {
  return brews.some((b) => !b.rating_is_default)
}

/** Average of the ratings the user chose; falls back to all brews if none were. */
export function avgRating(brews: BrewForPicker[]): number {
  if (brews.length === 0) return 0
  const rated = brews.filter((b) => !b.rating_is_default)
  const pool = rated.length > 0 ? rated : brews
  return pool.reduce((s, b) => s + b.rating, 0) / pool.length
}

export function formatRelative(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 36e5
  if (diffH < 24) return 'today'
  if (diffH < 48) return 'yesterday'
  if (diffH < 24 * 7) return `${Math.floor(diffH / 24)} days ago`
  if (diffH < 24 * 30) return `${Math.floor(diffH / (24 * 7))} weeks ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
