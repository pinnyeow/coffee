'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteProfile, setDefaultProfile } from '@/lib/actions/profiles'

export default function ProfileActions({
  id,
  method,
  isDefault,
}: {
  id: string
  method: string
  isDefault: boolean
}) {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-2 text-xs">
      {!isDefault && (
        <button
          type="button"
          onClick={() => start(() => setDefaultProfile(id, method))}
          disabled={pending}
          className="text-stone-600 underline disabled:opacity-50"
        >
          Set default
        </button>
      )}
      <Link href={`/settings/profiles/${id}`} className="text-stone-600 underline">
        Edit
      </Link>
      <button
        type="button"
        onClick={() => {
          if (confirm('Delete this profile?')) {
            start(() => deleteProfile(id))
          }
        }}
        disabled={pending}
        className="text-red-600 underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
