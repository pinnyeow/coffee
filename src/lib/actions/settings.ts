'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SettingsResult = { ok: true } | { ok: false; error: string }

export async function setShareWantToTry(value: boolean): Promise<SettingsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { error } = await supabase
    .from('settings')
    .upsert(
      { user_id: user.id, share_want_to_try: value },
      { onConflict: 'user_id' }
    )

  if (error) return { ok: false, error: error.message }
  revalidatePath('/settings')
  revalidatePath('/')
  return { ok: true }
}
