import { describe, it, expect } from 'vitest'
import { parseJournal } from '../obsidian-parser'

describe('parseJournal', () => {
  it('parses a bean section with multiple brews', () => {
    const text = `
**Torahebi Banana**
15g; 57; 80; 225ml; Time: 3:24mins
15g; 59; 80; 225ml; Time: 3:14mins
`
    const result = parseJournal(text)
    expect(result.beans).toHaveLength(1)
    expect(result.beans[0].name).toBe('Torahebi Banana')
    expect(result.beans[0].brews).toHaveLength(2)
    const first = result.beans[0].brews[0]
    expect(first.dose_g).toBe(15)
    expect(first.grind_xbloom).toBe(57)
    expect(first.rpm).toBe(80)
    expect(first.water_ml).toBe(225)
    expect(first.time_seconds).toBe(204)
  })

  it('detects origin from parens in the header', () => {
    const text = `
**Jibbi Raro Nansebo (Ethiopia)**
15g; 53; 80; 225ml; Time: 3:22mins
`
    const result = parseJournal(text)
    expect(result.beans[0].origin).toBe('Ethiopia')
  })

  it('detects origin when header begins with country name', () => {
    const text = `
**Thailand Doi Sam Muen Anaerobic Natural** - Swaygray
Dose 15g; 55; 80; 225ml; Time: 2:45mins
`
    const result = parseJournal(text)
    expect(result.beans[0].origin).toBe('Thailand')
  })

  it('captures notes in parens', () => {
    const text = `
**Torahebi Banana**
15g; 52; 110; 255ml; Time: 3:25mins (Super Bitter)
`
    const result = parseJournal(text)
    const b = result.beans[0].brews[0]
    expect(b.notes).toBe('Super Bitter')
  })

  it('handles labeled fields like Dose: and Grind size:', () => {
    const text = `
**Torahebi Banana + Berries**
Dose: 15g; Grind size: 52; RPM 110; 255ml; Time: 3:25mins
`
    const result = parseJournal(text)
    const b = result.beans[0].brews[0]
    expect(b.dose_g).toBe(15)
    expect(b.grind_xbloom).toBe(52)
    expect(b.rpm).toBe(110)
    expect(b.water_ml).toBe(255)
    expect(b.time_seconds).toBe(205)
  })

  it('drops sections with zero parseable brews', () => {
    const text = `
**Header but only commentary**
51 - 4:25mins - need to be more coarse
55 -> better
`
    const result = parseJournal(text)
    expect(result.beans).toHaveLength(0)
  })

  it('skips lines that are pure commentary, keeps real brews', () => {
    const text = `
**Axis Coffee (Kenya Kiamabara)**
Dose: 16g;
51 - 4:25mins - need to be more coarse
54; RPM 110; 224ml; Time: 4mins
55 -> better
15g; 55; 80; 225ml; Time: 3:30
`
    const result = parseJournal(text)
    expect(result.beans).toHaveLength(1)
    // The "54;..." line is missing dose so it's skipped; the bare-dose line is also skipped
    // The "15g; 55; 80; 225ml; Time: 3:30" line should produce one brew
    expect(result.beans[0].brews.length).toBeGreaterThanOrEqual(1)
    expect(result.skipped.length).toBeGreaterThan(0)
  })

  it('returns empty result for empty input', () => {
    expect(parseJournal('').beans).toEqual([])
  })
})
