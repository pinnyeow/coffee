import { parseTimeToSeconds } from './slug'

const ORIGINS = [
  'Ethiopia',
  'Kenya',
  'Colombia',
  'Panama',
  'Costa Rica',
  'Guatemala',
  'Brazil',
  'Honduras',
  'Mexico',
  'El Salvador',
  'Nicaragua',
  'Yemen',
  'Thailand',
  'Indonesia',
  'Vietnam',
  'Ecuador',
  'India',
  'Rwanda',
  'Burundi',
  'Tanzania',
  'Uganda',
  'Peru',
  'Bolivia',
  'Spain',
]

export type ParsedBrew = {
  dose_g: number
  grind_xbloom: number | null
  rpm: number | null
  water_ml: number | null
  time_seconds: number | null
  notes: string | null
  rawLine: string
}

export type ParsedBean = {
  name: string
  roaster: string | null
  origin: string | null
  brews: ParsedBrew[]
}

export type ParseResult = {
  beans: ParsedBean[]
  skipped: string[]
}

function extractOriginFromHeader(header: string): { name: string; origin: string | null } {
  // Patterns:
  //   "Axis Coffee (Kenya Kiamabara)" → origin = Kenya
  //   "Jibbi Raro Nansebo (Ethiopia)" → origin = Ethiopia
  //   "Thailand Doi Sam Muen..." → origin = Thailand
  //   "Torahebi Banana" → origin = null
  let name = header.trim()
  let origin: string | null = null

  const parenMatch = name.match(/\(([^)]+)\)/)
  if (parenMatch) {
    const inside = parenMatch[1]
    for (const country of ORIGINS) {
      const re = new RegExp(`\\b${country.replace(/\s/g, '\\s+')}\\b`, 'i')
      if (re.test(inside)) {
        origin = country
        break
      }
    }
  }

  if (!origin) {
    for (const country of ORIGINS) {
      const re = new RegExp(`^${country.replace(/\s/g, '\\s+')}\\b`, 'i')
      if (re.test(name)) {
        origin = country
        break
      }
    }
  }

  return { name, origin }
}

function parseBrewLine(line: string): ParsedBrew | null {
  // Strip common labels
  const cleaned = line
    .replace(/^\s*Dose:\s*/i, '')
    .replace(/;\s*Dose:\s*/gi, '; ')
    .replace(/Grind\s*(size)?\s*:?\s*/gi, '')
    .replace(/RPM\s*:?\s*/gi, '')

  // Extract notes in parens
  const parenMatch = cleaned.match(/\(([^)]+)\)/)
  const notes = parenMatch ? parenMatch[1].trim() : null
  const body = cleaned.replace(/\([^)]*\)/, '')

  // Split by semicolon
  const parts = body.split(';').map((s) => s.trim())

  // Helpers to find values in parts
  let dose: number | null = null
  let grind: number | null = null
  let rpm: number | null = null
  let water: number | null = null
  let timeSeconds: number | null = null

  for (const p of parts) {
    if (!p) continue

    const doseM = p.match(/^(\d+(?:[.,]\d+)?)\s*g\b/i)
    if (doseM && dose === null) {
      dose = Number(doseM[1].replace(',', '.'))
      continue
    }

    const waterM = p.match(/(\d+(?:[.,]\d+)?)\s*ml\b/i)
    if (waterM && water === null) {
      water = Math.round(Number(waterM[1].replace(',', '.')))
      continue
    }

    const timeM = p.match(/Time\s*:?\s*(.+?)$/i)
    if (timeM && timeSeconds === null) {
      timeSeconds = parseTimeToSeconds(timeM[1]) ?? null
      continue
    }

    // Numeric standalone — interpret by position-like heuristic
    const numM = p.match(/^(\d+(?:[.,]\d+)?)$/)
    if (numM) {
      const n = Number(numM[1].replace(',', '.'))
      if (grind === null && n >= 30 && n <= 80) {
        grind = n
      } else if (rpm === null && (n === 80 || n === 110 || (n >= 60 && n <= 150))) {
        rpm = n
      }
    }
  }

  if (dose === null) return null
  if (water === null && grind === null && rpm === null && timeSeconds === null) {
    // Just a dose — not a full brew line
    return null
  }

  return {
    dose_g: dose,
    grind_xbloom: grind,
    rpm,
    water_ml: water,
    time_seconds: timeSeconds,
    notes,
    rawLine: line.trim(),
  }
}

export function parseJournal(text: string): ParseResult {
  const lines = text.split(/\r?\n/)
  const beans: ParsedBean[] = []
  const skipped: string[] = []

  let current: ParsedBean | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    // Bold header = new bean section
    const headerMatch = line.match(/^\*{1,2}([^*]+?)\*{1,2}\s*$/)
    if (headerMatch) {
      const { name, origin } = extractOriginFromHeader(headerMatch[1])
      current = { name, roaster: null, origin, brews: [] }
      beans.push(current)
      continue
    }

    // Non-bold bean name (e.g. "Sisters Coffee (Light Roast)") — also treat as header
    //   Heuristic: line with no ';' and no digits+g → treat as bean header
    //   But only if not currently inside a bean, or if it contains keywords like "Coffee"
    if (!line.includes(';') && !/\d+\s*g/i.test(line) && /coffee|geisha|roaster/i.test(line) && line.length < 80) {
      const { name, origin } = extractOriginFromHeader(line)
      current = { name, roaster: null, origin, brews: [] }
      beans.push(current)
      continue
    }

    // Otherwise, try as brew line
    if (!current) {
      skipped.push(line)
      continue
    }
    const parsed = parseBrewLine(line)
    if (parsed) {
      current.brews.push(parsed)
    } else {
      skipped.push(line)
    }
  }

  // Drop beans with zero brews
  return {
    beans: beans.filter((b) => b.brews.length > 0),
    skipped,
  }
}
