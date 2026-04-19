'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { slugify, parseTimeToSeconds } from '@/lib/slug'

const BrewInputSchema = z.object({
  bean_name: z.string().min(1, 'Bean name required').max(120),
  roaster: z.string().max(120).optional().transform((v) => v?.trim() || null),
  origin: z.string().max(120).optional().transform((v) => v?.trim() || null),
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
    .select('id')
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
        created_by: user.id,
      })
      .select('id')
      .single()
    if (beanError || !newBean) {
      return { error: `Could not create bean: ${beanError?.message ?? 'unknown'}` }
    }
    beanId = newBean.id
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
