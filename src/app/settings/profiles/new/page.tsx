import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '../profile-form'

const POUR_METHODS = ['xBloom', 'V60', 'Chemex', 'AeroPress']

export default async function NewProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { method } = await searchParams
  const initialMethod = method && ['xBloom', 'V60', 'Chemex', 'AeroPress', 'Espresso', 'French press', 'Cold brew'].includes(method) ? method : 'xBloom'

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">New profile</h1>
        <div className="w-12" />
      </header>

      <ProfileForm
        mode="create"
        initial={{
          name: '',
          method: initialMethod,
          dose_g: POUR_METHODS.includes(initialMethod) ? 15 : 18,
          grind: POUR_METHODS.includes(initialMethod) ? 55 : 7,
          ratio: POUR_METHODS.includes(initialMethod) ? 17 : null,
          rpm: POUR_METHODS.includes(initialMethod) ? 80 : null,
          temp_c: POUR_METHODS.includes(initialMethod) ? 92 : 93,
          time_s: initialMethod === 'Espresso' ? 28 : null,
          yield_g: initialMethod === 'Espresso' ? 36 : null,
        }}
      />
    </main>
  )
}
