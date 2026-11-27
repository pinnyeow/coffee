import { describe, it, expect } from 'vitest'
import {
  BREW_METHODS,
  methodOf,
  primaryMethod,
  brewsForMethod,
  groupByMethod,
  bestScope,
} from '../methods'
import { BrewInputSchema, UpdateBrewSchema } from '../validation/brew'

type B = { id: string; created_at: string; brew_method?: string | null }
const b = (id: string, created_at: string, brew_method?: string): B => ({ id, created_at, brew_method })

describe('BREW_METHODS', () => {
  it('lists the seven methods, xBloom first, matching the DB check constraint', () => {
    expect(BREW_METHODS).toEqual([
      'xBloom',
      'V60',
      'Chemex',
      'AeroPress',
      'Espresso',
      'French press',
      'Cold brew',
    ])
  })
})

describe('methodOf', () => {
  it('treats a missing method as xBloom (rows from before migration 010)', () => {
    expect(methodOf({})).toBe('xBloom')
    expect(methodOf({ brew_method: null })).toBe('xBloom')
    expect(methodOf({ brew_method: 'Espresso' })).toBe('Espresso')
  })
})

describe('primaryMethod', () => {
  it('is the method of the most recent brew', () => {
    expect(
      primaryMethod([
        b('a', '2026-11-01T08:00:00Z', 'xBloom'),
        b('b', '2026-11-03T08:00:00Z', 'Espresso'),
        b('c', '2026-11-02T08:00:00Z', 'xBloom'),
      ])
    ).toBe('Espresso')
  })

  it('is xBloom for all-xBloom (and legacy) brews', () => {
    expect(primaryMethod([b('a', '2026-11-01T08:00:00Z'), b('b', '2026-11-02T08:00:00Z')])).toBe('xBloom')
  })

  it('is null with no brews', () => {
    expect(primaryMethod([])).toBeNull()
  })
})

describe('brewsForMethod / groupByMethod', () => {
  const brews = [
    b('x1', '2026-11-01T08:00:00Z', 'xBloom'),
    b('e1', '2026-11-02T08:00:00Z', 'Espresso'),
    b('x2', '2026-11-03T08:00:00Z'), // legacy → xBloom
  ]

  it('filters to one method, treating legacy rows as xBloom', () => {
    expect(brewsForMethod(brews, 'xBloom').map((x) => x.id)).toEqual(['x1', 'x2'])
    expect(brewsForMethod(brews, 'Espresso').map((x) => x.id)).toEqual(['e1'])
  })

  it('groups by method, keeping input order within each group', () => {
    const g = groupByMethod(brews)
    expect([...g.keys()]).toEqual(['xBloom', 'Espresso'])
    expect(g.get('xBloom')!.map((x) => x.id)).toEqual(['x1', 'x2'])
  })

  it('all-xBloom brews → a single xBloom group equal to the input (no visible change)', () => {
    const only = [b('a', '2026-11-01T08:00:00Z'), b('b', '2026-11-02T08:00:00Z', 'xBloom')]
    expect(brewsForMethod(only, primaryMethod(only)!)).toEqual(only)
  })
})

describe('bestScope', () => {
  it('scopes "clear other bests" to user + bean + the brew’s NEW method', () => {
    expect(
      bestScope({ userId: 'u', beanId: 'bean', newMethod: 'V60', existingMethod: 'xBloom' })
    ).toEqual({ user_id: 'u', bean_id: 'bean', brew_method: 'V60' })
  })

  it('falls back to the existing method when the form sent none (old form during deploy)', () => {
    expect(
      bestScope({ userId: 'u', beanId: 'bean', newMethod: undefined, existingMethod: 'Espresso' })
    ).toEqual({ user_id: 'u', bean_id: 'bean', brew_method: 'Espresso' })
  })

  it('falls back to xBloom when neither is known', () => {
    expect(
      bestScope({ userId: 'u', beanId: 'bean', newMethod: undefined, existingMethod: null })
    ).toEqual({ user_id: 'u', bean_id: 'bean', brew_method: 'xBloom' })
  })
})

describe('brew_method validation', () => {
  const form = { bean_name: 'Guji', dose_g: '15', rating: '4' }

  it('new brew from an old form (no method) saves as xBloom', () => {
    const r = BrewInputSchema.safeParse(form)
    expect(r.success).toBe(true)
    expect(r.data!.brew_method).toBe('xBloom')
  })

  it('accepts a known method', () => {
    expect(BrewInputSchema.safeParse({ ...form, brew_method: 'V60' }).data!.brew_method).toBe('V60')
  })

  it('rejects an unknown method', () => {
    expect(BrewInputSchema.safeParse({ ...form, brew_method: 'Moka pot' }).success).toBe(false)
  })

  it('edit from an old form leaves method undefined (keep the brew’s existing method)', () => {
    const r = UpdateBrewSchema.safeParse({ dose_g: '15', rating: '4' })
    expect(r.success).toBe(true)
    expect(r.data!.brew_method).toBeUndefined()
  })
})

import { pickPrimaryRecipe } from '../recipe-picker'

describe('pickPrimaryRecipe', () => {
  const base = {
    dose_g: 15, water_ml: 250, grind_xbloom: 55, water_temp_c: 92, time_seconds: 190,
    notes: null, is_best: false,
  }

  it('only considers the most recent method: a newer espresso shot is never picked as the xBloom best, and vice versa', () => {
    const r = pickPrimaryRecipe([
      { ...base, id: 'x5', rating: 5, is_best: true, created_at: '2026-11-01T08:00:00Z', brew_method: 'xBloom' },
      { ...base, id: 'e3', rating: 3, created_at: '2026-11-05T08:00:00Z', brew_method: 'Espresso' },
      { ...base, id: 'e4', rating: 4, created_at: '2026-11-04T08:00:00Z', brew_method: 'Espresso' },
    ])!
    expect(r.method).toBe('Espresso')
    expect(r.brew.id).toBe('e4') // xBloom star does not leak into espresso
    expect(r.methodBrews.map((b) => b.id)).toEqual(['e3', 'e4'])
  })

  it('all-xBloom: identical to pickRecipe over all brews', () => {
    const r = pickPrimaryRecipe([
      { ...base, id: 'a', rating: 4, created_at: '2026-11-01T08:00:00Z' },
      { ...base, id: 'b', rating: 5, created_at: '2026-11-02T08:00:00Z' },
    ])!
    expect([r.method, r.brew.id, r.label, r.methodBrews.length]).toEqual(['xBloom', 'b', 'Best', 2])
  })

  it('null for no brews', () => {
    expect(pickPrimaryRecipe([])).toBeNull()
  })
})
