import { useCallback, useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import TablePagination from '../components/TablePagination'
import usePagination from '../hooks/usePagination'
import {
  ALERT_TYPES,
  AUDIENCE_OPTIONS,
  NOTIFICATION_TEMPLATES,
} from '../data/notifications'
import {
  deleteNotificationAPI,
  dispatchNotificationAPI,
  fetchNotificationsAPI,
  updateNotificationAPI,
} from '../services/notificationService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const paths = {
  close: 'M6 18 18 6M6 6l12 12',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  send: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
}

const emptyForm = {
  audience: AUDIENCE_OPTIONS[0],
  alertType: 'info',
  title: '',
  body: '',
  description: '',
  actionLink: '',
  imageUrl: '',
  scheduleLater: false,
  scheduleAt: '',
}

function apiErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
}

function alertMeta(alertType) {
  return ALERT_TYPES.find((item) => item.id === alertType) || ALERT_TYPES[0]
}

function NotificationEditModal({ open, onClose, onSubmit, item, saving }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !item) return undefined
    setForm({
      audience: item.user || AUDIENCE_OPTIONS[0],
      alertType: item.alertType || 'info',
      title: item.title || '',
      body: item.body || '',
      description: item.description || '',
      actionLink: item.actionLink || '',
      imageUrl: item.imageUrl || '',
      scheduleLater: false,
      scheduleAt: '',
    })
    setError('')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, item, saving])

  if (!open || !item) return null

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and message body are required.')
      return
    }
    setError('')
    try {
      await onSubmit({
        id: item.id,
        title: form.title.trim(),
        body: form.body.trim(),
        description: form.description.trim(),
        user: form.audience,
        alertType: form.alertType,
        type: alertMeta(form.alertType).label,
        actionLink: form.actionLink.trim(),
        imageUrl: form.imageUrl.trim(),
      })
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to update notification.'))
    }
  }

  return (
    <div className="vendor-modal-overlay" onClick={saving ? undefined : onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 className="vendor-modal-title">
            <span className="vendor-modal-title-muted">Edit </span>
            <span className="vendor-modal-title-accent">Notification</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose} disabled={saving}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div>
              <label className="vendor-field-label" htmlFor="edit-notif-title">Title</label>
              <input id="edit-notif-title" className="glass-input vendor-field-input" value={form.title} onChange={updateField('title')} disabled={saving} />
            </div>
            <div>
              <label className="vendor-field-label" htmlFor="edit-notif-body">Message Body</label>
              <textarea id="edit-notif-body" className="glass-input vendor-field-input min-h-[88px] resize-y" value={form.body} onChange={updateField('body')} disabled={saving} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="vendor-field-label" htmlFor="edit-notif-audience">Audience</label>
                <select id="edit-notif-audience" className="glass-input vendor-field-input" value={form.audience} onChange={updateField('audience')} disabled={saving}>
                  {AUDIENCE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="vendor-field-label" htmlFor="edit-notif-type">Alert Type</label>
                <select id="edit-notif-type" className="glass-input vendor-field-input" value={form.alertType} onChange={updateField('alertType')}>
                  {ALERT_TYPES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            </div>
            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full" disabled={saving}>Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function NotificationViewModal({ open, onClose, item }) {
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || !item) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Notification</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Title</p>
            <p className="text-sm text-slate-200">{item.title}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Body</p>
            <p className="text-sm text-slate-300">{item.body}</p>
          </div>
          {item.description ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Description</p>
              <p className="text-sm text-slate-300">{item.description}</p>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Type</p>
              <p className="text-sm text-slate-200">{item.type}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">User</p>
              <p className="text-sm text-slate-200">{item.user}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Sent Time</p>
              <p className="text-sm text-slate-300">{item.sentTime}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-sm text-slate-200">{item.status}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reach</p>
              <p className="text-sm text-slate-300">
                {item.totalRecipients || 0} recipients · {item.emailSentCount || 0} emails
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Reads</p>
              <p className="text-sm text-slate-300">
                {(item.totalRecipients || 0) - (item.unreadCount || 0)} / {item.totalRecipients || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="vendor-modal-footer">
          <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Notifications({ onNavigate }) {
  const [form, setForm] = useState(emptyForm)
  const [wallpaper, setWallpaper] = useState('dark')
  const [historyTab, setHistoryTab] = useState('sent')
  const [readFilter, setReadFilter] = useState('all')
  const [sentItems, setSentItems] = useState([])
  const [scheduledItems, setScheduledItems] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const alert = alertMeta(form.alertType)
  const previewTitle = form.title.trim() || 'Notification Title'
  const previewBody = form.body.trim() || 'Compose notification body on the left to see live preview in real time.'

  const clock = useMemo(() => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase(),
    }
  }, [])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const [sentRes, scheduledRes] = await Promise.all([
        fetchNotificationsAPI({ kind: 'sent', limit: 100, read_filter: 'all' }),
        fetchNotificationsAPI({ kind: 'scheduled', limit: 100, read_filter: 'all' }),
      ])
      setSentItems(Array.isArray(sentRes?.data) ? sentRes.data : [])
      setScheduledItems(Array.isArray(scheduledRes?.data) ? scheduledRes.data : [])
    } catch (err) {
      setToast(apiErrorMessage(err, 'Failed to load notification history.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const activeList = historyTab === 'sent' ? sentItems : scheduledItems
  const filteredList = useMemo(() => {
    if (readFilter === 'all') return activeList
    if (readFilter === 'read') return activeList.filter((item) => item.read)
    return activeList.filter((item) => !item.read)
  }, [activeList, readFilter])

  const pagination = usePagination(filteredList)

  const allVisibleSelected = pagination.pageItems.length > 0
    && pagination.pageItems.every((item) => selectedIds.includes(item.id))

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const applyTemplate = (templateId) => {
    const template = NOTIFICATION_TEMPLATES.find((item) => item.id === templateId)
    if (!template) return
    setForm((current) => ({
      ...current,
      title: template.title,
      body: template.body,
      description: template.description,
      actionLink: template.actionLink,
    }))
  }

  const dispatchNotification = async (event) => {
    event.preventDefault()
    if (dispatching) return
    if (!form.title.trim() || !form.body.trim()) {
      setError('Please enter a title and message body.')
      return
    }
    if (form.scheduleLater && !form.scheduleAt) {
      setError('Please choose a schedule date and time.')
      return
    }

    const wasScheduled = form.scheduleLater
    setError('')
    setDispatching(true)
    try {
      const res = await dispatchNotificationAPI({
        title: form.title.trim(),
        body: form.body.trim(),
        description: form.description.trim(),
        audience: form.audience,
        alert_type: form.alertType,
        action_link: form.actionLink.trim(),
        image_url: form.imageUrl.trim(),
        schedule_later: wasScheduled,
        schedule_at: wasScheduled ? form.scheduleAt : null,
        send_email: true,
        send_web: true,
      })

      setForm(emptyForm)
      setToast(res?.message || (wasScheduled ? 'Notification scheduled.' : 'Notification dispatched.'))
      setHistoryTab(wasScheduled ? 'scheduled' : 'sent')
      await loadHistory()
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to dispatch notification.'))
    } finally {
      setDispatching(false)
    }
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !pagination.pageItems.some((item) => item.id === id)))
      return
    }
    setSelectedIds((current) => [...new Set([...current, ...pagination.pageItems.map((item) => item.id)])])
  }

  const toggleSelect = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    ))
  }

  const deleteItem = async (id) => {
    if (!id || deletingId) return
    setDeletingId(id)
    try {
      const res = await deleteNotificationAPI(id)
      setSentItems((current) => current.filter((item) => item.id !== id))
      setScheduledItems((current) => current.filter((item) => item.id !== id))
      setSelectedIds((current) => current.filter((value) => value !== id))
      setDeleting(null)
      setToast(res?.message || 'Notification deleted.')
    } catch (err) {
      setToast(apiErrorMessage(err, 'Failed to delete notification.'))
    } finally {
      setDeletingId(null)
    }
  }

  const updateItem = async (payload) => {
    setSaving(true)
    try {
      const res = await updateNotificationAPI(payload.id, {
        title: payload.title,
        body: payload.body,
        description: payload.description,
        audience: payload.user,
        alert_type: payload.alertType,
        action_link: payload.actionLink,
        image_url: payload.imageUrl,
      })
      const next = res?.data
      if (next) {
        setScheduledItems((current) => current.map((item) => (item.id === next.id ? next : item)))
      }
      setEditing(null)
      setToast(res?.message || 'Notification updated.')
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="page-notifications" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Direct Notifications</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('notification-inbox')}
            className="btn-glass rounded-xl px-3 py-2 text-xs font-semibold"
          >
            Open My Inbox
          </button>
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
            <span>Direct Notifications</span>
          </nav>
        </div>
      </div>

      {toast ? <div className="notif-toast mb-4">{toast}</div> : null}

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="neo-card glass-card p-5 xl:col-span-3" style={{ '--accent': '#00A3FF' }}>
          <span className="card-accent" aria-hidden="true" />
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="notif-compose-icon">
                <Icon path={paths.send} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wide text-shield">Compose Direct Broadcast</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Send email + live web notifications to the selected audience.
                </p>
              </div>
            </div>
            <select
              className="glass-input rounded-xl px-3 py-2 text-xs sm:w-48"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) applyTemplate(event.target.value)
                event.target.value = ''
              }}
              aria-label="Prefill template"
            >
              <option value="">Prefill Template...</option>
              {NOTIFICATION_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>{template.label}</option>
              ))}
            </select>
          </div>

          <form className="space-y-4" onSubmit={dispatchNotification}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="vendor-field-label" htmlFor="notif-audience">Target Audience</label>
                <select id="notif-audience" className="glass-input vendor-field-input" value={form.audience} onChange={updateField('audience')}>
                  {AUDIENCE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="vendor-field-label" htmlFor="notif-alert">Alert Type</label>
                <select id="notif-alert" className="glass-input vendor-field-input" value={form.alertType} onChange={updateField('alertType')}>
                  {ALERT_TYPES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="vendor-field-label" htmlFor="notif-title">Notification Title</label>
              <input
                id="notif-title"
                className="glass-input vendor-field-input"
                placeholder="e.g. Server Maintenance tonight."
                value={form.title}
                onChange={updateField('title')}
              />
            </div>

            <div>
              <label className="vendor-field-label" htmlFor="notif-body">Message Body</label>
              <textarea
                id="notif-body"
                className="glass-input vendor-field-input min-h-[96px] resize-y"
                placeholder="Enter the notification content users will see..."
                value={form.body}
                onChange={updateField('body')}
              />
            </div>

            <div>
              <label className="vendor-field-label" htmlFor="notif-description">Extended Description (Optional)</label>
              <textarea
                id="notif-description"
                className="glass-input vendor-field-input min-h-[72px] resize-y"
                placeholder="Detailed information visible inside notifications list..."
                value={form.description}
                onChange={updateField('description')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="vendor-field-label" htmlFor="notif-link">Action Link / Route</label>
                <input
                  id="notif-link"
                  className="glass-input vendor-field-input"
                  placeholder="e.g. /orders/view/:id"
                  value={form.actionLink}
                  onChange={updateField('actionLink')}
                />
              </div>
              <div>
                <label className="vendor-field-label" htmlFor="notif-image">Image URL (Banner)</label>
                <input
                  id="notif-image"
                  className="glass-input vendor-field-input"
                  placeholder="e.g. https://domain.com/banner.jpg"
                  value={form.imageUrl}
                  onChange={updateField('imageUrl')}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.scheduleLater} onChange={updateField('scheduleLater')} />
                <Icon path={paths.calendar} className="h-4 w-4 text-slate-400" />
                Schedule this notification for later
              </label>
              {form.scheduleLater ? (
                <input
                  type="datetime-local"
                  className="glass-input vendor-field-input mt-3"
                  value={form.scheduleAt}
                  onChange={updateField('scheduleAt')}
                />
              ) : null}
            </div>

            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}

            <button type="submit" className="notif-dispatch-btn w-full" disabled={dispatching}>
              <Icon path={paths.send} className="h-4 w-4" />
              {dispatching
                ? 'SENDING...'
                : form.scheduleLater
                  ? 'SCHEDULE NOTIFICATION'
                  : 'DISPATCH NOTIFICATION NOW'}
            </button>
          </form>
        </div>

        <div className="neo-card glass-card p-5 xl:col-span-2" style={{ '--accent': '#66cfff' }}>
          <span className="card-accent" aria-hidden="true" />
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-sm font-bold tracking-wide text-shield">Live Push Preview</h3>
            <div className="glass-pill flex gap-1 rounded-xl p-1">
              {['light', 'dark'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWallpaper(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${wallpaper === mode ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {mode === 'light' ? 'Light Wallpaper' : 'Dark Wallpaper'}
                </button>
              ))}
            </div>
          </div>

          <div className={`notif-phone ${wallpaper === 'light' ? 'is-light' : 'is-dark'}`}>
            <div className="notif-phone-screen">
              <div className="notif-phone-clock">
                <p className="notif-phone-time">{clock.time}</p>
                <p className="notif-phone-date">{clock.date}</p>
              </div>
              <div className="notif-push-card">
                <div className="notif-push-top">
                  <span className="notif-push-icon" style={{ background: alert.color }}>
                    <Icon path={paths.send} className="h-3.5 w-3.5 text-white" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">ShieldX</p>
                      <p className="text-[10px] text-slate-400">now</p>
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-800">{previewTitle}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{previewBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#00A3FF' }}>
        <span className="card-accent" aria-hidden="true" />
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            className={`notif-history-tab${historyTab === 'sent' ? ' active' : ''}`}
            onClick={() => { setHistoryTab('sent'); setSelectedIds([]) }}
          >
            Sent Notifications ({sentItems.length})
          </button>
          <button
            type="button"
            className={`notif-history-tab${historyTab === 'scheduled' ? ' active' : ''}`}
            onClick={() => { setHistoryTab('scheduled'); setSelectedIds([]) }}
          >
            Scheduled Messages ({scheduledItems.length})
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['all', 'read', 'unread'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setReadFilter(filter)}
              className={`notif-filter-pill${readFilter === filter ? ' active' : ''}`}
            >
              {filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="vendors-table data-table w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all notifications"
                  />
                </th>
                <th>S.No</th>
                <th>Content</th>
                <th>Type</th>
                <th>User</th>
                <th>Sent Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-500">Loading notifications...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                    {historyTab === 'sent' ? 'No notifications dispatched yet.' : 'No scheduled messages yet.'}
                  </td>
                </tr>
              ) : pagination.pageItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`Select ${item.title}`}
                    />
                  </td>
                  <td className="text-slate-400">{pagination.rangeStart + index}</td>
                  <td className="min-w-[220px]">
                    <p className="font-medium text-slate-200">{item.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.body}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {item.totalRecipients || 0} users · {item.emailSentCount || 0} mails
                    </p>
                  </td>
                  <td className="whitespace-nowrap text-slate-300">{item.type}</td>
                  <td className="whitespace-nowrap text-slate-300">{item.user}</td>
                  <td className="whitespace-nowrap text-slate-400">{item.sentTime}</td>
                  <td>
                    <span className={`notif-status-pill ${item.status === 'Scheduled' ? 'is-scheduled' : item.read ? 'is-read' : 'is-sent'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="action-btn" aria-label={`View ${item.title}`} onClick={() => setViewing(item)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      {item.kind === 'scheduled' ? (
                        <button type="button" className="action-btn" aria-label={`Edit ${item.title}`} onClick={() => setEditing(item)}>
                          <Icon path={paths.edit} />
                        </button>
                      ) : null}
                      <button type="button" className="action-btn action-btn-danger" aria-label={`Delete ${item.title}`} onClick={() => setDeleting(item)}>
                        <Icon path={paths.delete} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredList.length > 0 ? (
          <TablePagination
            {...pagination}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
            itemLabel="notifications"
          />
        ) : null}
      </div>

      <NotificationViewModal open={Boolean(viewing)} onClose={() => setViewing(null)} item={viewing} />
      <NotificationEditModal
        open={Boolean(editing)}
        onClose={() => (!saving ? setEditing(null) : null)}
        onSubmit={updateItem}
        item={editing}
        saving={saving}
      />
      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => (!deletingId ? setDeleting(null) : null)}
        onConfirm={() => deleteItem(deleting.id)}
        itemName={deleting?.title || ''}
        title="Delete Item"
      />
    </section>
  )
}
