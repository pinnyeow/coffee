'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type FriendActionResult = { ok: true } | { ok: false; error: string }

export async function sendFriendRequest(
  username: string
): Promise<FriendActionResult> {
  const cleaned = username.trim().toLowerCase().replace(/^@/, '')
  if (!cleaned) return { ok: false, error: 'Username required.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: target } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', cleaned)
    .maybeSingle()

  if (!target) return { ok: false, error: `No user found with username @${cleaned}.` }
  if (target.id === user.id) return { ok: false, error: "That's you." }

  // If a friendship exists either direction, return appropriate error
  const { data: existing } = await supabase
    .from('friendships')
    .select('user_id, friend_id, status')
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${user.id})`
    )
    .limit(1)

  if (existing && existing.length > 0) {
    const row = existing[0]
    if (row.status === 'accepted') return { ok: false, error: `You're already friends with @${cleaned}.` }
    if (row.user_id === user.id) return { ok: false, error: 'Request already sent.' }
    return { ok: false, error: `@${cleaned} already sent you a request — accept it from Settings.` }
  }

  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: user.id, friend_id: target.id, status: 'pending' })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  return { ok: true }
}

export async function acceptFriendRequest(
  fromUserId: string
): Promise<FriendActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  // Mark incoming request accepted
  const { error: updErr } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', fromUserId)
    .eq('friend_id', user.id)

  if (updErr) return { ok: false, error: updErr.message }

  // Add reverse row (accepted) if it doesn't exist already
  const { data: reverse } = await supabase
    .from('friendships')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('friend_id', fromUserId)
    .maybeSingle()

  if (!reverse) {
    const { error: insErr } = await supabase
      .from('friendships')
      .insert({ user_id: user.id, friend_id: fromUserId, status: 'accepted' })
    if (insErr) return { ok: false, error: insErr.message }
  } else {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', user.id)
      .eq('friend_id', fromUserId)
  }

  revalidatePath('/settings')
  revalidatePath('/')
  return { ok: true }
}

export async function removeFriend(otherUserId: string): Promise<FriendActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  await supabase
    .from('friendships')
    .delete()
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${user.id})`
    )

  revalidatePath('/settings')
  revalidatePath('/')
  return { ok: true }
}

export async function updateDisplayName(
  newName: string
): Promise<FriendActionResult> {
  const cleaned = newName.trim()
  if (cleaned.length > 60) {
    return { ok: false, error: 'Keep it under 60 characters.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { error } = await supabase
    .from('users')
    .update({ display_name: cleaned || null })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  revalidatePath('/')
  return { ok: true }
}

export async function updateUsername(
  newUsername: string
): Promise<FriendActionResult> {
  const cleaned = newUsername.trim().toLowerCase().replace(/^@/, '')
  if (!/^[a-z0-9_]{3,30}$/.test(cleaned)) {
    return { ok: false, error: '3–30 characters, lowercase letters / numbers / underscore only.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', cleaned)
    .maybeSingle()

  if (existing && existing.id !== user.id) {
    return { ok: false, error: 'Username already taken.' }
  }

  const { error } = await supabase
    .from('users')
    .update({ username: cleaned })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  return { ok: true }
}
