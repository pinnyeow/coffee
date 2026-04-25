'use client'

import { useState, useTransition } from 'react'
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  updateUsername,
  updateDisplayName,
} from '@/lib/actions/friends'

type FriendRow = {
  user: { id: string; username: string | null; display_name: string | null }
}

export default function FriendsSection({
  myUsername,
  myDisplayName,
  pendingIncoming,
  pendingOutgoing,
  accepted,
}: {
  myUsername: string | null
  myDisplayName: string | null
  pendingIncoming: FriendRow[]
  pendingOutgoing: FriendRow[]
  accepted: FriendRow[]
}) {
  return (
    <section className="space-y-4">
      <DisplayNameRow current={myDisplayName} />
      <UsernameRow current={myUsername} />
      <AddFriend />
      {pendingIncoming.length > 0 && (
        <PendingIncoming rows={pendingIncoming} />
      )}
      {pendingOutgoing.length > 0 && (
        <PendingOutgoing rows={pendingOutgoing} />
      )}
      {accepted.length > 0 && <AcceptedFriends rows={accepted} />}
      {accepted.length === 0 && pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
        <div className="rounded-2xl bg-white border border-stone-200 p-4 text-center text-xs text-stone-500">
          No friends yet. Add one by username above.
        </div>
      )}
    </section>
  )
}

function DisplayNameRow({ current }: { current: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current ?? '')
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function save() {
    setError(null)
    start(async () => {
      const res = await updateDisplayName(value)
      if (!res.ok) setError(res.error)
      else setEditing(false)
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-4">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
        Display name
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., Pin"
            className="flex-1 bg-stone-50 rounded-lg px-2 py-1.5 text-sm border border-stone-200"
            autoFocus
          />
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="text-xs font-medium text-stone-900 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setValue(current ?? '')
              setError(null)
            }}
            className="text-xs text-stone-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="font-medium text-stone-900">
            {current ?? <span className="text-stone-400 italic font-normal">(not set)</span>}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-stone-600 underline"
          >
            Edit
          </button>
        </div>
      )}
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      <div className="text-[11px] text-stone-500 mt-2">
        Friendly name shown to friends. Defaults to your username.
      </div>
    </div>
  )
}

function UsernameRow({ current }: { current: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current ?? '')
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function save() {
    setError(null)
    start(async () => {
      const res = await updateUsername(value)
      if (!res.ok) setError(res.error)
      else setEditing(false)
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-4">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
        Your username
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-stone-500">@</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 bg-stone-50 rounded-lg px-2 py-1.5 text-sm border border-stone-200"
            autoFocus
          />
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="text-xs font-medium text-stone-900 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setValue(current ?? '')
              setError(null)
            }}
            className="text-xs text-stone-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="font-medium text-stone-900">
            @{current ?? '—'}
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-stone-600 underline"
          >
            Edit
          </button>
        </div>
      )}
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      <div className="text-[11px] text-stone-500 mt-2">
        Friends add you with this. Share it with Michael so he can find you.
      </div>
    </div>
  )
}

function AddFriend() {
  const [value, setValue] = useState('')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setMsg(null)
    start(async () => {
      const res = await sendFriendRequest(value)
      if (res.ok) {
        setMsg({ kind: 'ok', text: `Request sent to @${value.trim().toLowerCase().replace(/^@/, '')}.` })
        setValue('')
      } else {
        setMsg({ kind: 'err', text: res.error })
      }
    })
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white border border-stone-200 p-4">
      <div className="text-[11px] uppercase tracking-wider text-stone-500 mb-1">
        Add a friend
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-stone-500">@</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="username"
          className="flex-1 bg-stone-50 rounded-lg px-2 py-1.5 text-sm border border-stone-200"
        />
        <button
          type="submit"
          disabled={pending || !value.trim()}
          className="text-xs font-medium bg-stone-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send'}
        </button>
      </div>
      {msg && (
        <div
          className={`text-xs mt-2 ${msg.kind === 'ok' ? 'text-green-700' : 'text-red-600'}`}
        >
          {msg.text}
        </div>
      )}
    </form>
  )
}

function PendingIncoming({ rows }: { rows: FriendRow[] }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 divide-y divide-stone-100">
      <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-stone-500">
        Pending requests · {rows.length}
      </div>
      {rows.map((r) => (
        <PendingIncomingRow key={r.user.id} row={r} />
      ))}
    </div>
  )
}

function PendingIncomingRow({ row }: { row: FriendRow }) {
  const [pending, start] = useTransition()
  const u = row.user
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm text-stone-900">{u.display_name ?? u.username}</div>
        <div className="text-xs text-stone-500">@{u.username}</div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await acceptFriendRequest(u.id)
              if (!res.ok) alert(res.error)
            })
          }
          className="text-xs font-medium bg-stone-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await removeFriend(u.id)
            })
          }
          className="text-xs text-stone-600 underline"
        >
          Decline
        </button>
      </div>
    </div>
  )
}

function PendingOutgoing({ rows }: { rows: FriendRow[] }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 divide-y divide-stone-100">
      <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-stone-500">
        Sent · {rows.length}
      </div>
      {rows.map((r) => (
        <PendingOutgoingRow key={r.user.id} row={r} />
      ))}
    </div>
  )
}

function PendingOutgoingRow({ row }: { row: FriendRow }) {
  const [pending, start] = useTransition()
  const u = row.user
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm text-stone-900">{u.display_name ?? u.username}</div>
        <div className="text-xs text-stone-500">@{u.username} · waiting</div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await removeFriend(u.id)
          })
        }
        className="text-xs text-stone-600 underline disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  )
}

function AcceptedFriends({ rows }: { rows: FriendRow[] }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 divide-y divide-stone-100">
      <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-stone-500">
        Friends · {rows.length}
      </div>
      {rows.map((r) => (
        <AcceptedFriendRow key={r.user.id} row={r} />
      ))}
    </div>
  )
}

function AcceptedFriendRow({ row }: { row: FriendRow }) {
  const [pending, start] = useTransition()
  const u = row.user
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm text-stone-900">{u.display_name ?? u.username}</div>
        <div className="text-xs text-stone-500">@{u.username}</div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`Remove @${u.username} as a friend?`)) {
            start(async () => {
              await removeFriend(u.id)
            })
          }
        }}
        className="text-xs text-stone-600 underline disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  )
}
