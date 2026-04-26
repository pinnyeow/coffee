'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/lib/actions/bookmarks'

export default function BookmarkToggle({
  beanId,
  initialBookmarked,
}: {
  beanId: string
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [pending, start] = useTransition()

  function onClick() {
    const previous = bookmarked
    setBookmarked(!previous) // optimistic
    start(async () => {
      const res = await toggleBookmark(beanId)
      if (!res.ok) {
        setBookmarked(previous)
        alert(res.error)
      } else {
        setBookmarked(res.bookmarked)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`text-xs font-medium rounded-full px-3 py-1.5 border transition ${
        bookmarked
          ? 'bg-amber-100 border-amber-300 text-amber-900'
          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
      }`}
      aria-pressed={bookmarked}
    >
      {bookmarked ? '★ Want to try' : '☆ Want to try'}
    </button>
  )
}
