export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function parseTimeToSeconds(input: string): number | null {
  if (!input) return null
  const trimmed = input.trim().replace(/mins?$/i, '').trim()
  if (!trimmed) return null
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) {
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2])
  }
  const decimalMatch = trimmed.match(/^(\d+)[.,](\d+)$/)
  if (decimalMatch) {
    // 3.14 is 3 minutes 14 seconds in Pin's journal notation
    return Number(decimalMatch[1]) * 60 + Number(decimalMatch[2])
  }
  const seconds = Number(trimmed)
  if (!Number.isNaN(seconds)) return seconds
  return null
}
