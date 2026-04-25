import { describe, it, expect } from 'vitest'
import { slugify, parseTimeToSeconds } from '../slug'

describe('slugify', () => {
  it('lowercases and joins with hyphens', () => {
    expect(slugify('Torahebi Banana')).toBe('torahebi-banana')
  })

  it('strips diacritics', () => {
    expect(slugify('Caffè Crème')).toBe('caffe-creme')
  })

  it('collapses runs of separators and trims', () => {
    expect(slugify('  Axis  Coffee — Kenya!! ')).toBe('axis-coffee-kenya')
  })

  it('strips parentheses and special chars', () => {
    expect(slugify('Jibbi Raro Nansebo (Ethiopia)')).toBe('jibbi-raro-nansebo-ethiopia')
  })

  it('returns empty string for input with only special chars', () => {
    expect(slugify('!!!')).toBe('')
  })

  it('caps length at 80 chars', () => {
    const long = 'a'.repeat(120)
    expect(slugify(long).length).toBe(80)
  })
})

describe('parseTimeToSeconds', () => {
  it('parses mm:ss', () => {
    expect(parseTimeToSeconds('3:14')).toBe(194)
    expect(parseTimeToSeconds('2:33')).toBe(153)
  })

  it("parses Pin's m.ss notation", () => {
    expect(parseTimeToSeconds('3.14')).toBe(194)
    expect(parseTimeToSeconds('4.02')).toBe(242)
  })

  it('strips trailing "mins"', () => {
    expect(parseTimeToSeconds('3:14mins')).toBe(194)
    expect(parseTimeToSeconds('4mins')).toBe(4)
  })

  it('returns null for empty or unparseable', () => {
    expect(parseTimeToSeconds('')).toBeNull()
    expect(parseTimeToSeconds('   ')).toBeNull()
  })

  it('handles single number as seconds', () => {
    expect(parseTimeToSeconds('30')).toBe(30)
  })
})
