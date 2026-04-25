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
}

export type RecipeResolution = {
  brew: BrewForPicker
  label: 'Best' | 'Latest'
  hasRatingVariance: boolean
  hasExplicitStar: boolean
}

/**
 * Picks the representative brew for a bean.
 * - If any brew is starred → "Best" = starred
 * - Else if ratings differ → "Best" = highest rating (ties broken by newest)
 * - Else all ratings are equal (e.g. imported, all 3★) → "Latest" = newest
 */
export function pickRecipe(brews: BrewForPicker[]): RecipeResolution | null {
  if (brews.length === 0) return null

  const starred = brews.find((b) => b.is_best)
  if (starred) {
    return {
      brew: starred,
      label: 'Best',
      hasRatingVariance: brewsHaveRatingVariance(brews),
      hasExplicitStar: true,
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
  }
}

export function brewsHaveRatingVariance(brews: BrewForPicker[]): boolean {
  if (brews.length <= 1) return false
  const first = brews[0].rating
  return brews.some((b) => b.rating !== first)
}

export function avgRating(brews: BrewForPicker[]): number {
  if (brews.length === 0) return 0
  return brews.reduce((s, b) => s + b.rating, 0) / brews.length
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
