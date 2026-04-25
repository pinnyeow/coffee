import { describe, it, expect } from 'vitest'
import {
  pickRecipe,
  brewsHaveRatingVariance,
  avgRating,
  type BrewForPicker,
} from '../recipe-picker'

function brew(overrides: Partial<BrewForPicker>): BrewForPicker {
  return {
    id: overrides.id ?? 'b1',
    dose_g: 15,
    water_ml: 225,
    grind_xbloom: 55,
    water_temp_c: 92,
    time_seconds: 200,
    rating: 3,
    notes: null,
    is_best: false,
    created_at: '2026-04-01T12:00:00Z',
    ...overrides,
  }
}

describe('pickRecipe', () => {
  it('returns null when there are no brews', () => {
    expect(pickRecipe([])).toBeNull()
  })

  it('prefers an explicitly starred brew', () => {
    const brews = [
      brew({ id: 'a', rating: 5 }),
      brew({ id: 'b', rating: 3, is_best: true }),
    ]
    const r = pickRecipe(brews)!
    expect(r.brew.id).toBe('b')
    expect(r.label).toBe('Best')
    expect(r.hasExplicitStar).toBe(true)
  })

  it('falls back to highest rating when ratings differ', () => {
    const brews = [
      brew({ id: 'a', rating: 4 }),
      brew({ id: 'b', rating: 5 }),
      brew({ id: 'c', rating: 3 }),
    ]
    const r = pickRecipe(brews)!
    expect(r.brew.id).toBe('b')
    expect(r.label).toBe('Best')
    expect(r.hasExplicitStar).toBe(false)
    expect(r.hasRatingVariance).toBe(true)
  })

  it('breaks rating ties by newest', () => {
    const brews = [
      brew({ id: 'old', rating: 5, created_at: '2026-01-01T00:00:00Z' }),
      brew({ id: 'new', rating: 5, created_at: '2026-04-01T00:00:00Z' }),
    ]
    expect(pickRecipe(brews)!.brew.id).toBe('new')
  })

  it('uses Latest label when all ratings are equal', () => {
    const brews = [
      brew({ id: 'old', rating: 3, created_at: '2026-01-01T00:00:00Z' }),
      brew({ id: 'new', rating: 3, created_at: '2026-04-01T00:00:00Z' }),
    ]
    const r = pickRecipe(brews)!
    expect(r.brew.id).toBe('new')
    expect(r.label).toBe('Latest')
    expect(r.hasRatingVariance).toBe(false)
    expect(r.hasExplicitStar).toBe(false)
  })

  it('starred brew still wins even with no rating variance', () => {
    const brews = [
      brew({ id: 'old', rating: 3 }),
      brew({ id: 'pinned', rating: 3, is_best: true }),
    ]
    expect(pickRecipe(brews)!.brew.id).toBe('pinned')
  })
})

describe('brewsHaveRatingVariance', () => {
  it('returns false for 0 or 1 brew', () => {
    expect(brewsHaveRatingVariance([])).toBe(false)
    expect(brewsHaveRatingVariance([brew({})])).toBe(false)
  })

  it('returns false when ratings match', () => {
    expect(brewsHaveRatingVariance([brew({ rating: 3 }), brew({ rating: 3 })])).toBe(false)
  })

  it('returns true when ratings differ', () => {
    expect(brewsHaveRatingVariance([brew({ rating: 3 }), brew({ rating: 4 })])).toBe(true)
  })
})

describe('avgRating', () => {
  it('returns 0 for empty array', () => {
    expect(avgRating([])).toBe(0)
  })

  it('averages ratings', () => {
    expect(avgRating([brew({ rating: 5 }), brew({ rating: 3 })])).toBe(4)
  })
})
