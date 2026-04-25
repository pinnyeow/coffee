import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ImportClient from './import-client'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: settings } = await supabase
    .from('settings')
    .select('onboarded_from_obsidian')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">Import from Obsidian</h1>
        <div className="w-12" />
      </header>

      <div className="px-6 pb-10 space-y-5">
        {settings?.onboarded_from_obsidian ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-900">
            ✓ Already imported. This is one-time only — if you need to re-run, delete imported brews first.
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
              Upload your <code>Pour Over Journal - Coffee.md</code> file.
              The parser reads bold bean names and brew lines like{' '}
              <code>15g; 55; 80; 225ml; Time: 3:30</code>. Rating defaults to ★★★☆☆ — you can edit each brew after.
            </div>

            <ImportClient />
          </>
        )}
      </div>
    </main>
  )
}
