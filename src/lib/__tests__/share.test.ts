import { describe, it, expect } from 'vitest'
import { xbloomGrindToDescription, formatBrewAsText } from '../share'

describe('xbloomGrindToDescription', () => {
  it('returns null for null', () => {
    expect(xbloomGrindToDescription(null)).toBeNull()
  })

  it('classifies grind ranges by xBloom dial', () => {
    expect(xbloomGrindToDescription(40)).toBe('Fine')
    expect(xbloomGrindToDescription(48)).toBe('Fine')
    expect(xbloomGrindToDescription(49)).toBe('Medium-fine')
    expect(xbloomGrindToDescription(54)).toBe('Medium-fine')
    expect(xbloomGrindToDescription(55)).toBe('Medium')
    expect(xbloomGrindToDescription(60)).toBe('Medium')
    expect(xbloomGrindToDescription(61)).toBe('Medium-coarse')
    expect(xbloomGrindToDescription(68)).toBe('Medium-coarse')
    expect(xbloomGrindToDescription(69)).toBe('Coarse')
    expect(xbloomGrindToDescription(75)).toBe('Coarse')
  })
})

describe('formatBrewAsText', () => {
  const baseBrew = {
    bean_name: 'Torahebi Banana',
    origin: 'Ethiopia',
    roaster: 'Torahebi',
    dose_g: 15,
    water_ml: 255,
    grind_xbloom: 59,
    water_temp_c: 92,
    time_seconds: 194,
    rating: 4,
    notes: null,
  }

  it('formats universal mode with grind description', () => {
    const text = formatBrewAsText(baseBrew, 'universal')
    expect(text).toContain('☕ Torahebi Banana — Ethiopia · Torahebi')
    expect(text).toContain('15g')
    expect(text).toContain('255ml')
    expect(text).toContain('1:17.0')
    expect(text).toContain('92°C')
    expect(text).toContain('Medium grind')
    expect(text).toContain('3:14')
    expect(text).toContain('★★★★☆')
    expect(text).toContain('— via Pour')
    expect(text).not.toContain('grind 59')
  })

  it('formats xbloom mode with raw grind number', () => {
    const text = formatBrewAsText(baseBrew, 'xbloom')
    expect(text).toContain('grind 59')
    expect(text).toContain('— xBloom recipe via Pour')
    expect(text).not.toContain('Medium grind')
  })

  it('omits missing fields gracefully', () => {
    const minimal = {
      ...baseBrew,
      water_ml: null,
      grind_xbloom: null,
      water_temp_c: null,
      time_seconds: null,
    }
    const text = formatBrewAsText(minimal, 'universal')
    expect(text).toContain('15g')
    expect(text).not.toContain('ml')
    expect(text).not.toContain('°C')
    expect(text).not.toContain('grind')
  })

  it('includes notes when present', () => {
    const text = formatBrewAsText({ ...baseBrew, notes: 'Sweet finish.' }, 'universal')
    expect(text).toContain('"Sweet finish."')
  })

  it('omits subtitle dash when no origin/roaster', () => {
    const text = formatBrewAsText(
      { ...baseBrew, origin: null, roaster: null },
      'universal'
    )
    // Title line is just the bean name (no " — Origin · Roaster" suffix)
    expect(text.split('\n')[0]).toBe('☕ Torahebi Banana')
    // The footer "— via Pour" still appears, so don't assert no dash anywhere
  })
})
