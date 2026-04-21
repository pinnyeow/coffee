'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const methodEnum = z.enum([
  'xBloom',
  'V60',
  'Chemex',
  'AeroPress',
  'Espresso',
  'French press',
  'Cold brew',
])

const optionalNum = z
  .union([z.string(), z.number()])
  .transform((v) => (v === '' || v == null ? null : Number(v)))
  .pipe(z.number().nullable())

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name required').max(80),
  method: methodEnum,
  dose_g: optionalNum.refine((v) => v === null || v > 0, 'Dose must be positive'),
  grind: optionalNum,
  ratio: optionalNum,
  rpm: optionalNum,
  temp_c: optionalNum,
  time_s: optionalNum,
  yield_g: optionalNum,
})

export type ProfileFormState = {
  error?: string
  fieldErrors?: Record<string, string>
}

function parseProfileForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  return ProfileSchema.safeParse(raw)
}

export async function createProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = parseProfileForm(formData)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message
    }
    return { error: 'Check fields below.', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase.from('profiles').insert({
    user_id: user.id,
    ...parsed.data,
  })

  if (error) return { error: `Could not create profile: ${error.message}` }

  revalidatePath('/settings')
  redirect('/settings')
}

export async function updateProfile(
  id: string,
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = parseProfileForm(formData)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message
    }
    return { error: 'Check fields below.', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: `Could not update profile: ${error.message}` }

  revalidatePath('/settings')
  redirect('/settings')
}

export async function deleteProfile(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/settings')
}

export async function setDefaultProfile(id: string, method: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Clear existing default for this method, then set the new one
  await supabase
    .from('profiles')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('method', method)

  await supabase
    .from('profiles')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/settings')
  revalidatePath('/log')
}
