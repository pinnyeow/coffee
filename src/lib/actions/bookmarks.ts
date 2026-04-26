'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BookmarkResult = { ok: true; bookmarked: boolean } | { ok: false; error: string }

export async function toggleBookmark(beanId: string): Promise<BookmarkResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  // Check current state
  const { data: existing } = await supabase
    .from('bean_bookmarks')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('bean_id', beanId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('bean_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('bean_id', beanId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/')
    revalidatePath('/beans')
    return { ok: true, bookmarked: false }
  } else {
    const { error } = await supabase
      .from('bean_bookmarks')
      .insert({ user_id: user.id, bean_id: beanId })
    if (error) return { ok: false, error: error.message }
    revalidatePath('/')
    revalidatePath('/beans')
    return { ok: true, bookmarked: true }
  }
}
