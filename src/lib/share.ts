export function xbloomGrindToDescription(g: number | null): string | null {
  if (g == null) return null
  if (g <= 48) return 'Fine'
  if (g <= 54) return 'Medium-fine'
  if (g <= 60) return 'Medium'
  if (g <= 68) return 'Medium-coarse'
  return 'Coarse'
}

export type ShareableBrew = {
  bean_name: string
  origin: string | null
  roaster: string | null
  dose_g: number
  water_ml: number | null
  grind_xbloom: number | null
  water_temp_c: number | null
  time_seconds: number | null
  rating: number
  notes: string | null
}

function formatTime(seconds: number | null) {
  if (seconds == null) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatBrewAsText(b: ShareableBrew, mode: 'universal' | 'xbloom') {
  const subtitle = [b.origin, b.roaster].filter(Boolean).join(' · ')
  const ratio =
    b.water_ml != null && b.dose_g > 0
      ? `1:${(b.water_ml / b.dose_g).toFixed(1)}`
      : null

  const parts: string[] = []
  parts.push(`${b.dose_g}g`)
  if (b.water_ml != null) parts.push(`${b.water_ml}ml`)
  if (ratio) parts.push(ratio)
  if (b.water_temp_c != null) parts.push(`${b.water_temp_c}°C`)

  if (mode === 'xbloom') {
    if (b.grind_xbloom != null) parts.push(`grind ${b.grind_xbloom}`)
  } else {
    const desc = xbloomGrindToDescription(b.grind_xbloom)
    if (desc) parts.push(`${desc} grind`)
  }
  const t = formatTime(b.time_seconds)
  if (t) parts.push(t)

  const stars = '★'.repeat(b.rating) + '☆'.repeat(5 - b.rating)

  const lines = [
    `☕ ${b.bean_name}${subtitle ? ` — ${subtitle}` : ''}`,
    parts.join(' · '),
    stars,
  ]
  if (b.notes) {
    lines.push('')
    lines.push(`"${b.notes}"`)
  }
  lines.push('')
  lines.push(mode === 'xbloom' ? '— xBloom recipe via Pour' : '— via Pour')
  return lines.join('\n')
}
