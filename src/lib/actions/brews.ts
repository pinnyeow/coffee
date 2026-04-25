'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { slugify, parseTimeToSeconds } from '@/lib/slug'

const UpdateBrewSchema = z.object({
  dose_g: z.coerce.number().positive().max(100),
  water_ml: z.coerce.number().int().positive().max(2000).optional().or(z.literal('').transform(() => undefined)),
  grind_xbloom: z.coerce.number().min(1).max(100).optional().or(z.literal('').transform(() => undefined)),
  water_temp_c: z.coerce.number().min(60).max(100).optional().or(z.literal('').transform(() => undefined)),
  time_str: z.string().optional().transform((v) => v?.trim() || ''),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().transform((v) => v?.trim() || null),
  is_best: z
    .union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
})

export async function updateBrew(
  id: string,
  _prev: BrewFormState,
  formData: FormData
): Promise<BrewFormState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = UpdateBrewSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message
    }
    return { error: 'Please check the fields below.', fieldErrors }
  }

  const input = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Fetch brew to verify ownership + get bean_id for revalidation
  const { data: existing } = await supabase
    .from('brews')
    .select('id, user_id, bean_id, bean:beans(slug)')
    .eq('id', id)
    .maybeSingle()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Brew not found.' }
  }

  const timeSeconds = input.time_str ? parseTimeToSeconds(input.time_str) : null

  // If marking as best, clear other bests for this bean + user first
  if (input.is_best) {
    await supabase
      .from('brews')
      .update({ is_best: false })
      .eq('user_id', user.id)
      .eq('bean_id', existing.bean_id)
      .neq('id', id)
  }

  const { error: updateError } = await supabase
    .from('brews')
    .update({
      dose_g: input.dose_g,
      water_ml: input.water_ml ?? null,
      grind_xbloom: input.grind_xbloom ?? null,
      water_temp_c: input.water_temp_c ?? null,
      time_seconds: timeSeconds,
      rating: input.rating,
      notes: input.notes,
      is_best: input.is_best,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: `Could not update brew: ${updateError.message}` }
  }

  revalidatePath('/')
  const beanSlug = (existing.bean as unknown as { slug: string } | null)?.slug
  if (beanSlug) revalidatePath(`/beans/${beanSlug}`)
  redirect(beanSlug ? `/beans/${beanSlug}` : '/')
}

export async function deleteBrew(id: string): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { data: existing } = await supabase
    .from('brews')
    .select('id, user_id, bean:beans(slug)')
    .eq('id', id)
    .maybeSingle()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Brew not found.' }
  }

  const { error } = await supabase.from('brews').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/')
  const beanSlug = (existing.bean as unknown as { slug: string } | null)?.slug
  if (beanSlug) revalidatePath(`/beans/${beanSlug}`)
  return { redirectTo: beanSlug ? `/beans/${beanSlug}` : '/' }
}

const BrewInputSchema = z.object({
  bean_name: z.string().min(1, 'Bean name required').max(120),
  roaster: z.string().max(120).optional().transform((v) => v?.trim() || null),
  origin: z.string().max(120).optional().transform((v) => v?.trim() || null),
  purchased_country: z.string().max(80).optional().transform((v) => v?.trim() || null),
  purchased_city: z.string().max(80).optional().transform((v) => v?.trim() || null),
  purchased_at: z.string().max(120).optional().transform((v) => v?.trim() || null),
  dose_g: z.coerce.number().positive().max(100),
  water_ml: z.coerce.number().int().positive().max(2000).optional().or(z.literal('').transform(() => undefined)),
  grind_xbloom: z.coerce.number().min(1).max(100).optional().or(z.literal('').transform(() => undefined)),
  water_temp_c: z.coerce.number().min(60).max(100).optional().or(z.literal('').transform(() => undefined)),
  time_str: z.string().optional().transform((v) => v?.trim() || ''),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().transform((v) => v?.trim() || null),
})

export type BrewFormState = {
  error?: string
  fieldErrors?: Record<string, string>
}

export async function saveBrew(
  _prev: BrewFormState,
  formData: FormData
): Promise<BrewFormState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = BrewInputSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message
    }
    return { error: 'Please check the fields below.', fieldErrors }
  }

  const input = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  // Find or create bean
  const slug = slugify(input.bean_name)
  if (!slug) return { error: 'Bean name is invalid.' }

  const { data: existingBean } = await supabase
    .from('beans')
    .select('id, roaster, origin, purchased_country, purchased_city, purchased_at')
    .eq('slug', slug)
    .maybeSingle()

  let beanId = existingBean?.id
  if (!beanId) {
    const { data: newBean, error: beanError } = await supabase
      .from('beans')
      .insert({
        slug,
        name: input.bean_name.trim(),
        roaster: input.roaster,
        origin: input.origin,
        purchased_country: input.purchased_country,
        purchased_city: input.purchased_city,
        purchased_at: input.purchased_at,
        created_by: user.id,
      })
      .select('id')
      .single()
    if (beanError || !newBean) {
      return { error: `Could not create bean: ${beanError?.message ?? 'unknown'}` }
    }
    beanId = newBean.id
  } else {
    // Update bean with any newly-provided fields (don't overwrite existing with empty)
    const updates: Record<string, string | null> = {}
    if (input.roaster && !existingBean!.roaster) updates.roaster = input.roaster
    if (input.origin && !existingBean!.origin) updates.origin = input.origin
    if (input.purchased_country && !existingBean!.purchased_country)
      updates.purchased_country = input.purchased_country
    if (input.purchased_city && !existingBean!.purchased_city)
      updates.purchased_city = input.purchased_city
    if (input.purchased_at && !existingBean!.purchased_at)
      updates.purchased_at = input.purchased_at
    if (Object.keys(updates).length > 0) {
      await supabase.from('beans').update(updates).eq('id', beanId)
    }
  }

  const timeSeconds = input.time_str ? parseTimeToSeconds(input.time_str) : null

  const { error: brewError } = await supabase.from('brews').insert({
    user_id: user.id,
    bean_id: beanId,
    dose_g: input.dose_g,
    water_ml: input.water_ml ?? null,
    grind_xbloom: input.grind_xbloom ?? null,
    water_temp_c: input.water_temp_c ?? null,
    time_seconds: timeSeconds,
    rating: input.rating,
    notes: input.notes,
  })

  if (brewError) {
    return { error: `Could not save brew: ${brewError.message}` }
  }

  revalidatePath('/')
  redirect('/')
}
