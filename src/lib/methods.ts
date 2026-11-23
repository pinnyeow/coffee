/**
 * Brew methods: single source of truth.
 * Must match the brews_brew_method_check constraint (migration 010) and
 * profiles.method's check (schema.sql).
 */
export const BREW_METHODS = [
  'xBloom',
  'V60',
  'Chemex',
  'AeroPress',
  'Espresso',
  'French press',
  'Cold brew',
] as const

export type BrewMethod = (typeof BREW_METHODS)[number]

export const DEFAULT_METHOD: BrewMethod = 'xBloom'

type HasMethod = { brew_method?: string | null }
type HasMethodAndTime = HasMethod & { created_at: string }

/** A brew's method. Rows without one (pre-migration) are xBloom. */
export function methodOf(b: HasMethod): BrewMethod {
  return (b.brew_method as BrewMethod | null | undefined) ?? DEFAULT_METHOD
}

/** The method of the most recent brew — what a bean card/page shows first. */
export function primaryMethod(brews: HasMethodAndTime[]): BrewMethod | null {
  if (brews.length === 0) return null
  let latest = brews[0]
  for (const b of brews) {
    if (new Date(b.created_at).getTime() > new Date(latest.created_at).getTime()) latest = b
  }
  return methodOf(latest)
}

export function brewsForMethod<T extends HasMethod>(brews: T[], method: BrewMethod): T[] {
  return brews.filter((b) => methodOf(b) === method)
}

export function groupByMethod<T extends HasMethod>(brews: T[]): Map<BrewMethod, T[]> {
  const out = new Map<BrewMethod, T[]>()
  for (const b of brews) {
    const m = methodOf(b)
    const arr = out.get(m) ?? []
    arr.push(b)
    out.set(m, arr)
  }
  return out
}

/**
 * Which brews to un-star when a brew is marked best: same user, same bean,
 * same method (the brew's NEW method if the form changed it). Starring a V60
 * must never clear the xBloom star.
 */
export function bestScope({
  userId,
  beanId,
  newMethod,
  existingMethod,
}: {
  userId: string
  beanId: string
  newMethod: BrewMethod | undefined
  existingMethod: string | null | undefined
}): { user_id: string; bean_id: string; brew_method: BrewMethod } {
  return {
    user_id: userId,
    bean_id: beanId,
    brew_method: newMethod ?? methodOf({ brew_method: existingMethod }),
  }
}
