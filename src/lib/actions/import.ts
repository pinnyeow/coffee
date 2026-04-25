'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slug'
import { parseJournal, type ParsedBean } from '@/lib/obsidian-parser'

export type ImportResult = {
  ok: boolean
  error?: string
  summary?: {
    beansCreated: number
    beansMatched: number
    brewsCreated: number
    beans: Array<{ name: string; origin: string | null; brewCount: number }>
    skipped: string[]
  }
}

export async function importObsidianJournal(fileText: string): Promise<ImportResult> {
  const parsed = parseJournal(fileText)
  if (parsed.beans.length === 0) {
    return { ok: false, error: 'No beans found in file. Check the format.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not signed in.' }

  let beansCreated = 0
  let beansMatched = 0
  let brewsCreated = 0

  for (const bean of parsed.beans) {
    const slug = slugify(bean.name)
    if (!slug) continue

    // Find or create bean
    const { data: existing } = await supabase
      .from('beans')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    let beanId = existing?.id
    if (beanId) {
      beansMatched++
    } else {
      const { data: created, error: beanErr } = await supabase
        .from('beans')
        .insert({
          slug,
          name: bean.name,
          origin: bean.origin,
          roaster: bean.roaster,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (beanErr || !created) {
        return { ok: false, error: `Failed on bean "${bean.name}": ${beanErr?.message}` }
      }
      beanId = created.id
      beansCreated++
    }

    // Insert brews
    const rows = bean.brews.map((b) => ({
      user_id: user.id,
      bean_id: beanId,
      dose_g: b.dose_g,
      water_ml: b.water_ml,
      grind_xbloom: b.grind_xbloom,
      water_temp_c: null,
      time_seconds: b.time_seconds,
      rating: 3, // default for imported historical brews, user can edit
      notes: b.notes,
    }))
    if (rows.length > 0) {
      const { error: brewErr } = await supabase.from('brews').insert(rows)
      if (brewErr) {
        return { ok: false, error: `Failed saving brews for "${bean.name}": ${brewErr.message}` }
      }
      brewsCreated += rows.length
    }
  }

  // Mark onboarded
  await supabase
    .from('settings')
    .upsert({ user_id: user.id, onboarded_from_obsidian: true }, { onConflict: 'user_id' })

  revalidatePath('/')
  revalidatePath('/settings')

  return {
    ok: true,
    summary: {
      beansCreated,
      beansMatched,
      brewsCreated,
      beans: parsed.beans.map((b: ParsedBean) => ({
        name: b.name,
        origin: b.origin,
        brewCount: b.brews.length,
      })),
      skipped: parsed.skipped,
    },
  }
}
