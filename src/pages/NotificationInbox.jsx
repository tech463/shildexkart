import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchInboxAPI,
  markInboxReadAllAPI,
  markInboxReadAPI,
} from '../services/notificationService'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
]

const alertMeta = {
  info: { label: 'Information', color: '#3b82f6' },
  success: { label: 'Success', color: '#10b981' },
  warning: { label: 'Warning', color: '#f59e0b' },
  danger: { label: 'Alert', color: '#ef4444' },
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '')
}

function apiErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
}

export default function NotificationInbox({ onNavigate }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const loadInbox = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchInboxAPI({ limit: 100, filter: 'all' })
      const rows = Array.isArray(res?.data) ? res.data : []
      setItems(rows)
      setUnreadCount(Number(res?.unreadCount || 0))
      setSelected((current) => current || rows[0] || null)
    } catch (err) {
      setItems([])
      setError(apiErrorMessage(err, 'Failed to load inbox.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'unread' && item.is_read) return false
      if (filter === 'read' && !item.is_read) return false
      if (!q) return true
      return (
        String(item.title || '').toLowerCase().includes(q)
        || String(item.body || '').toLowerCase().includes(q)
      )
    })
  }, [items, filter, query])

  const markRead = async (item) => {
    if (!item?.id || item.is_read) {
      setSelected(item)
      return
    }
    try {
      await markInboxReadAPI(item.id)
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, is_read: true } : row)))
      setUnreadCount((count) => Math.max(0, count - 1))
      setSelected({ ...item, is_read: true })
    } catch {
      setSelected(item)
    }
  }

  const markAll = async () => {
    try {
      await markInboxReadAllAPI()
      setItems((current) => current.map((row) => ({ ...row, is_read: true })))
      setUnreadCount(0)
      if (selected) setSelected({ ...selected, is_read: true })
      setToast('All notifications marked as read.')
    } catch (err) {
      setToast(apiErrorMessage(err, 'Could not mark all as read.'))
    }
  }

  return (
    <section id="page-notification-inbox" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">My Inbox</h2>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onNavigate?.('dashboard')
            }}
          >
            Home
          </a>
          <span className="mx-2 text-slate-600">›</span>
          <span>My Inbox</span>
        </nav>
      </div>

      {toast ? <div className="notif-toast mb-4">{toast}</div> : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="neo-card glass-card p-4">
          <p className="text-2xl font-bold text-slate-100">{items.length}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
        </div>
        <div className="neo-card glass-card p-4" style={{ '--accent': '#00A3FF' }}>
          <p className="text-2xl font-bold text-brand-300">{unreadCount}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unread</p>
        </div>
        <div className="neo-card glass-card p-4" style={{ '--accent': '#34d399' }}>
          <p className="text-2xl font-bold text-emerald-300">{Math.max(0, items.length - unreadCount)}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Read</p>
        </div>
      </div>

      <div className="neo-card glass-card overflow-hidden p-0" style={{ '--accent': '#00A3FF' }}>
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`notif-filter-pill${filter === item.id ? ' active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search inbox..."
              className="glass-input w-full rounded-xl px-3 py-2 text-sm sm:w-56"
            />
            <button type="button" onClick={markAll} className="btn-glass rounded-xl px-3 py-2 text-xs font-semibold">
              Mark all read
            </button>
            <button type="button" onClick={loadInbox} className="btn-glass rounded-xl px-3 py-2 text-xs font-semibold">
              Refresh
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('notifications')}
              className="btn-glass rounded-xl px-3 py-2 text-xs font-semibold"
            >
              Compose broadcast
            </button>
          </div>
        </div>

        {error ? <p className="vendor-form-error m-4">{error}</p> : null}

        <div className="grid min-h-[420px] lg:grid-cols-[360px_1fr]">
          <div className="border-b border-white/10 lg:border-r lg:border-b-0">
            {loading ? (
              <p className="px-4 py-14 text-center text-sm text-slate-500">Loading inbox...</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-14 text-center text-sm text-slate-500">No notifications found.</p>
            ) : (
              <ul className="max-h-[560px] overflow-y-auto">
                {filtered.map((item) => {
                  const meta = alertMeta[item.alert_type] || alertMeta.info
                  const active = selected?.id === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => markRead(item)}
                        className={`inbox-item${active ? ' is-active' : ''}${!item.is_read ? ' is-unread' : ''}`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="inbox-type-pill" style={{ '--tone': meta.color }}>{meta.label}</span>
                          {!item.is_read ? <span className="h-2 w-2 rounded-full bg-brand-400" /> : null}
                          <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">
                            {formatTime(item.sent_at || item.created_at)}
                          </span>
                        </div>
                        <p className="truncate text-sm font-semibold text-slate-200">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.body}</p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="p-5">
            {!selected ? (
              <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500">
                Select a notification to read details.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span
                      className="inbox-type-pill"
                      style={{ '--tone': (alertMeta[selected.alert_type] || alertMeta.info).color }}
                    >
                      {(alertMeta[selected.alert_type] || alertMeta.info).label}
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-slate-100">{selected.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{formatTime(selected.sent_at || selected.created_at)}</p>
                  </div>
                  <span className={`notif-status-pill ${selected.is_read ? 'is-read' : 'is-sent'}`}>
                    {selected.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="text-sm leading-7 text-slate-300">{selected.body}</p>
                {selected.description ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-400">
                    {selected.description}
                  </div>
                ) : null}
                {selected.image_url ? (
                  <img src={selected.image_url} alt="" className="max-h-56 w-full rounded-xl object-cover" />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
