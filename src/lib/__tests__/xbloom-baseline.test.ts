/**
 * xBloom baseline (characterization) tests.
 *
 * These pin how the daily xBloom flow behaves TODAY, before multi-method
 * support lands. They must stay green through every multi-method PR.
 * If one fails, the xBloom experience changed: fix the code, not the test,
 * unless the owner has explicitly agreed to the change.
 */
import { describe, it, expect } from 'vitest'
import { formatBrewAsText } from '../share'
import { pickRecipe, avgRating, type BrewForPicker } from '../recipe-picker'
import { buildLogDefaults } from '../log-defaults'
import { BrewInputSchema, UpdateBrewSchema } from '../validation/brew'
import type { ProfileOption } from '@/app/log/log-brew-form'

// ── Share text: exact strings ────────────────────────────────────────────
describe('xBloom share text (exact)', () => {
  const brew = {
    bean_name: 'Ethiopia Guji',
    origin: 'Ethiopia',
    roaster: 'Onyx',
    dose_g: 15,
    water_ml: 250,
    grind_xbloom: 55,
    water_temp_c: 92,
    time_seconds: 190,
    rating: 4,
    notes: 'Juicy.',
  }

  it('universal mode', () => {
    expect(formatBrewAsText(brew, 'universal')).toBe(
      [
        '☕ Ethiopia Guji — Ethiopia · Onyx',
        '15g · 250ml · 1:16.7 · 92°C · Medium grind · 3:10',
        '★★★★☆',
        '',
        '"Juicy."',
        '',
        '— via Pour',
      ].join('\n')
    )
  })

  it('xBloom mode', () => {
    expect(formatBrewAsText(brew, 'xbloom')).toBe(
      [
        '☕ Ethiopia Guji — Ethiopia · Onyx',
        '15g · 250ml · 1:16.7 · 92°C · grind 55 · 3:10',
        '★★★★☆',
        '',
        '"Juicy."',
        '',
        '— xBloom recipe via Pour',
      ].join('\n')
    )
  })
})

// ── Recipe picking for xBloom-only beans ─────────────────────────────────
function brew(o: Partial<BrewForPicker>): BrewForPicker {
  return {
    id: 'x',
    dose_g: 15,
    water_ml: 250,
    grind_xbloom: 55,
    water_temp_c: 92,
    time_seconds: 190,
    rating: 4,
    notes: null,
    is_best: false,
    created_at: '2026-11-01T08:00:00Z',
    ...o,
  }
}

describe('xBloom recipe picking', () => {
  it('starred brew wins and is labelled Best', () => {
    const r = pickRecipe([
      brew({ id: 'a', rating: 5, created_at: '2026-11-03T08:00:00Z' }),
      brew({ id: 'b', rating: 3, is_best: true }),
    ])!
    expect([r.brew.id, r.label, r.hasExplicitStar]).toEqual(['b', 'Best', true])
  })

  it('highest rating wins, newest breaks ties', () => {
    const r = pickRecipe([
      brew({ id: 'old5', rating: 5, created_at: '2026-11-01T08:00:00Z' }),
      brew({ id: 'new5', rating: 5, created_at: '2026-11-05T08:00:00Z' }),
      brew({ id: 'new3', rating: 3, created_at: '2026-11-06T08:00:00Z' }),
    ])!
    expect([r.brew.id, r.label]).toEqual(['new5', 'Best'])
  })

  it('equal ratings → newest, labelled Latest', () => {
    const r = pickRecipe([
      brew({ id: 'a', created_at: '2026-11-01T08:00:00Z' }),
      brew({ id: 'b', created_at: '2026-11-04T08:00:00Z' }),
    ])!
    expect([r.brew.id, r.label]).toEqual(['b', 'Latest'])
  })

  it('average ignores imported placeholder ratings', () => {
    expect(avgRating([brew({ rating: 3, rating_is_default: true }), brew({ rating: 5 })])).toBe(5)
  })
})

// ── Log form prefill from profiles ───────────────────────────────────────
const lightRoast: ProfileOption = {
  id: 'p-light',
  name: 'Light roast',
  method: 'xBloom',
  dose_g: 15,
  grind: 55,
  ratio: 16.7,
  rpm: 80,
  temp_c: 92,
  is_default: true,
}
const geisha: ProfileOption = {
  id: 'p-geisha',
  name: 'Geisha',
  method: 'xBloom',
  dose_g: 16,
  grind: 58,
  ratio: 16,
  rpm: 90,
  temp_c: 94,
  is_default: false,
}

describe('xBloom Log prefill', () => {
  it('starred profile fills dose, grind, rpm, temp and water, with the profile hint', () => {
    const { defaults, hint, profiles } = buildLogDefaults({
      params: {},
      allProfiles: [lightRoast, geisha],
      fromOwnerLabel: null,
    })
    expect(defaults).toMatchObject({
      dose_g: '15',
      grind_xbloom: '55',
      rpm_xbloom: '80',
      water_temp_c: '92',
      water_ml: '251', // round(15 × 16.7)
      profile_id: 'p-light',
      time_str: '',
      bean: '',
    })
    expect(hint).toBe('Prefilled from your profile: Light roast. Change profile or tweak fields below.')
    expect(profiles.map((p) => p.name)).toEqual(['Light roast', 'Geisha'])
  })

  it('"Use these settings" URL params override the starred profile', () => {
    const { defaults, hint } = buildLogDefaults({
      params: { bean: 'Ethiopia Guji', dose: '14', grind: '52', water: '230', time: '3:00' },
      allProfiles: [lightRoast, geisha],
      fromOwnerLabel: null,
    })
    expect(defaults).toMatchObject({
      bean: 'Ethiopia Guji',
      dose_g: '14',
      grind_xbloom: '52',
      water_ml: '230',
      time_str: '3:00',
      rpm_xbloom: '80', // not in URL → from starred profile
      profile_id: 'p-light',
    })
    expect(hint).toBe('Prefilled from best brew of Ethiopia Guji. Tweak any field before saving.')
  })

  it("friend's recipe hint credits them", () => {
    const { hint } = buildLogDefaults({
      params: { bean: 'Ethiopia Guji', from: '00000000-0000-0000-0000-000000000001' },
      allProfiles: [lightRoast],
      fromOwnerLabel: 'Sam',
    })
    expect(hint).toBe("Trying Sam's recipe for Ethiopia Guji. We'll credit them on your brew.")
  })

  it('no profiles → nudge to create one', () => {
    const { hint, defaults } = buildLogDefaults({ params: {}, allProfiles: [], fromOwnerLabel: null })
    expect(hint).toBe('No profile set. Create one in Settings to auto-fill future brews.')
    expect(defaults.dose_g).toBe('')
  })
})

// ── Validation of today's xBloom form submissions ────────────────────────
describe('xBloom form validation', () => {
  const xbloomForm = {
    bean_name: 'Ethiopia Guji',
    roaster: 'Onyx',
    origin: 'Ethiopia',
    purchased_country: '',
    purchased_city: '',
    purchased_at: '',
    dose_g: '15',
    water_ml: '250',
    grind_xbloom: '55',
    rpm_xbloom: '80',
    water_temp_c: '92',
    time_str: '3:10',
    rating: '4',
    notes: '',
    derived_from_brew_id: '',
  }

  it('a normal xBloom log validates to the same values as today', () => {
    const r = BrewInputSchema.safeParse(xbloomForm)
    expect(r.success).toBe(true)
    expect(r.data).toMatchObject({
      bean_name: 'Ethiopia Guji',
      dose_g: 15,
      water_ml: 250,
      grind_xbloom: 55,
      rpm_xbloom: 80,
      water_temp_c: 92,
      time_str: '3:10',
      rating: 4,
      notes: null,
      is_private: false,
    })
  })

  it('empty optional numbers are allowed', () => {
    const r = BrewInputSchema.safeParse({ ...xbloomForm, water_ml: '', rpm_xbloom: '', water_temp_c: '' })
    expect(r.success).toBe(true)
  })

  it('rating is required', () => {
    expect(BrewInputSchema.safeParse({ ...xbloomForm, rating: '' }).success).toBe(false)
  })

  it('a normal xBloom edit validates, including best + private', () => {
    const r = UpdateBrewSchema.safeParse({ ...xbloomForm, is_best: 'on', is_private: 'on' })
    expect(r.success).toBe(true)
    expect(r.data).toMatchObject({ grind_xbloom: 55, is_best: true, is_private: true })
  })
})
