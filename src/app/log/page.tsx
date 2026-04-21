import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogBrewForm, { type LogBrewDefaults } from './log-brew-form'

export default async function LogBrewPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const params = await searchParams
  const pick = (k: string) => {
    const v = params[k]
    return Array.isArray(v) ? v[0] : v
  }

  const defaults: LogBrewDefaults = {
    bean: pick('bean') ?? '',
    roaster: pick('roaster') ?? '',
    origin: pick('origin') ?? '',
    dose_g: pick('dose') ?? '15',
    grind_xbloom: pick('grind') ?? '',
    water_ml: pick('water') ?? '',
    water_temp_c: pick('temp') ?? '',
    time_str: pick('time') ?? '',
  }

  const fromBean = Boolean(defaults.bean)

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">New brew</h1>
        <div className="w-12" />
      </header>

      <LogBrewForm defaults={defaults} prefillHint={fromBean} />
    </main>
  )
}
