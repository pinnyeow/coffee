import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from '../profile-form'

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, method, dose_g, grind, ratio, rpm, temp_c, time_s, yield_g')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) notFound()

  return (
    <main className="max-w-md mx-auto min-h-screen bg-stone-50 border-x border-stone-200">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/settings" className="text-sm text-stone-600">← Back</Link>
        <h1 className="font-semibold">Edit profile</h1>
        <div className="w-12" />
      </header>

      <ProfileForm mode="update" initial={profile} />
    </main>
  )
}
