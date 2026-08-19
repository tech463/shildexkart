import { useEffect, useMemo, useState } from 'react'
import { fetchUsersAPI, setUserStatusAPI } from '../services/userService'
import TablePagination from '../components/TablePagination'
import usePagination from '../hooks/usePagination'

function Icon({ path, paths: pathList, className = 'h-4 w-4' }) {
  const segments = pathList || (path ? path.split(' M').map((segment, index) => (index === 0 ? segment : `M${segment}`)) : [])
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      {segments.map((segment) => (
        <path key={segment} strokeLinecap="round" strokeLinejoin="round" d={segment} />
      ))}
    </svg>
  )
}

const paths = {
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  refresh: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 12H16.02',
  plus: 'M12 4.5v15m7.5-7.5h-15',
  close: 'M6 18 18 6M6 6l12 12',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  upload: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
  eye: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88',
}

const AVATAR_COLORS = [
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-brand-500/20 text-brand-400 border-brand-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
]

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  status: 'Active',
  profileImage: null,
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function formatTimestamp(date = new Date()) {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '')
}

function parseUserDate(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})/)
  if (!match) {
    const fallback = new Date(value)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }
  const [, day, monthName, year] = match
  const parsed = new Date(`${monthName} ${day}, ${year} 00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDayStart(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function toDayEnd(value) {
  if (!value) return null
  const date = new Date(`${value}T23:59:59`)
  return Number.isNaN(date.getTime()) ? null : date
}

function isWithinDateRange(user, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseUserDate(user.created)
  const updated = parseUserDate(user.updated)
  const start = toDayStart(startDate)
  const end = toDayEnd(endDate)

  const matches = (date) => {
    if (!date) return false
    if (start && date < start) return false
    if (end && date > end) return false
    return true
  }

  return matches(created) || matches(updated)
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="vendor-field-label">
      {children}
    </label>
  )
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function UserModal({ open, onClose, onSubmit, user = null }) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [profilePreview, setProfilePreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    if (user) {
      const { firstName, lastName } = splitName(user.name)
      setForm({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        status: user.active ? 'Active' : 'Inactive',
        profileImage: null,
      })
    } else {
      setForm(emptyForm)
    }

    setShowPassword(false)
    setProfilePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return ''
    })
    setError('')
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
  }, [open, onClose, user])

  if (!open) return null

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const selectProfileImage = (file) => {
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, or WEBP image.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 10MB or smaller.')
      return
    }
    setError('')
    setForm((current) => ({ ...current, profileImage: file }))
    setProfilePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in first name, last name, email, and phone number.')
      return
    }
    if (!isEdit && !form.password.trim()) {
      setError('Please enter a password.')
      return
    }
    onSubmit({
      id: user?.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      status: form.status,
      active: form.status === 'Active',
      profileImage: form.profileImage,
    })
  }

  const fieldPrefix = isEdit ? 'edit-user' : 'add-user'

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-wide vendor-modal-compact glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldPrefix}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id={`${fieldPrefix}-title`} className="vendor-modal-title">
            <span className="vendor-modal-title-muted">{isEdit ? 'Edit ' : 'Add '}</span>
            <span className="vendor-modal-title-accent">User</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body">
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-first-name`}>First Name</FieldLabel>
                <input
                  id={`${fieldPrefix}-first-name`}
                  type="text"
                  value={form.firstName}
                  onChange={updateField('firstName')}
                  placeholder="John"
                  className="glass-input vendor-field-input"
                  autoFocus
                />
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-last-name`}>Last Name</FieldLabel>
                <input
                  id={`${fieldPrefix}-last-name`}
                  type="text"
                  value={form.lastName}
                  onChange={updateField('lastName')}
                  placeholder="Doe"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-email`}>Email</FieldLabel>
                <input
                  id={`${fieldPrefix}-email`}
                  type="email"
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder="john@example.com"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-phone`}>Phone Number</FieldLabel>
                <input
                  id={`${fieldPrefix}-phone`}
                  type="tel"
                  value={form.phone}
                  onChange={updateField('phone')}
                  placeholder="9876543210"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-password`}>Password</FieldLabel>
                <div className="relative">
                  <input
                    id={`${fieldPrefix}-password`}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder="••••••••"
                    className="glass-input vendor-field-input pr-11"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon path={showPassword ? paths.eyeOff : paths.eye} />
                  </button>
                </div>
                {isEdit ? (
                  <p className="mt-1.5 text-[11px] text-slate-500">Leaving blank will not update password</p>
                ) : null}
              </div>
              <div>
                <FieldLabel htmlFor={`${fieldPrefix}-status`}>Status</FieldLabel>
                <select
                  id={`${fieldPrefix}-status`}
                  value={form.status}
                  onChange={updateField('status')}
                  className="glass-input vendor-field-input"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <FieldLabel htmlFor={`${fieldPrefix}-profile-image`}>Profile Image</FieldLabel>
                <label
                  htmlFor={`${fieldPrefix}-profile-image`}
                  className={`vendor-upload-zone${profilePreview ? ' has-preview' : ''}`}
                >
                  <input
                    id={`${fieldPrefix}-profile-image`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => selectProfileImage(event.target.files?.[0] || null)}
                  />
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile preview" />
                  ) : (
                    <>
                      <span className="vendor-upload-icon" aria-hidden="true">
                        <Icon path={paths.upload} className="h-3.5 w-3.5" />
                      </span>
                      <span className="vendor-upload-copy">
                        <span className="text-sm font-semibold text-slate-200">Select image to upload</span>
                        <span className="text-[11px] leading-snug text-slate-500">PNG, JPG or WEBP (Max 10MB)</span>
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {error ? <p className="vendor-form-error mt-4">{error}</p> : null}
          </div>

          <div className="vendor-modal-footer grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">
              Cancel
            </button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">
              {isEdit ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteUserModal({ open, onClose, onConfirm, user }) {
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

  if (!open || !user) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="delete-confirm-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="delete-confirm-close action-btn" aria-label="Close" onClick={onClose}>
          <Icon path={paths.close} />
        </button>
        <div className="delete-confirm-icon" aria-hidden="true">
          <Icon path={paths.delete} className="h-6 w-6" />
        </div>
        <h3 id="delete-user-title" className="delete-confirm-title">Delete User</h3>
        <p className="delete-confirm-text">
          Are you sure you want to delete &quot;{user.name}&quot;? This action cannot be undone.
        </p>
        <div className="delete-confirm-actions">
          <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
          <button type="button" onClick={() => onConfirm(user.id)} className="delete-confirm-btn w-full">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function Users({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const t = setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 2500)
    return () => clearTimeout(t)
  }, [toastSuccess, toastError])

  const normalizeUsers = (items = []) => items.map((u, idx) => {
    const name = u?.name ?? ''
    const createdRaw = u?.created_at ?? u?.created ?? u?.createdAt
    const updatedRaw = u?.updated_at ?? u?.updated ?? u?.updatedAt
    return {
      id: u?.id ?? u?._id ?? Date.now() + idx,
      name,
      email: u?.email ?? '',
      phone: u?.phone ?? u?.phoneNumber ?? u?.mobile ?? '',
      avatar: getInitials(name),
      color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      role: 'User',
      active: Boolean(u?.is_active ?? u?.active),
      created: createdRaw ? formatTimestamp(new Date(createdRaw)) : '',
      updated: updatedRaw ? formatTimestamp(new Date(updatedRaw)) : '',
    }
  })

  const loadUsers = async () => {
    setLoadingUsers(true)
    setToastError('')
    try {
      const data = await fetchUsersAPI()
      const usersData = data?.users ?? data?.data?.users ?? data?.result?.users ?? []
      setUsers(normalizeUsers(usersData))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load users.'
      setToastError(msg)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase()
    return users.filter((user) => (
      (!search || user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search))
      && (!status || (status === 'Active') === user.active)
      && isWithinDateRange(user, startDate, endDate)
    ))
  }, [users, query, status, startDate, endDate])

  const pagination = usePagination(filteredUsers)

  const refresh = () => {
    setQuery('')
    setStatus('')
    setStartDate('')
    setEndDate('')
    loadUsers()
  }

  const toggleUser = async (id) => {
    const user = users.find((item) => item.id === id)
    if (!user || statusUpdatingId) return
    const newActive = !user.active
    setStatusUpdatingId(id)
    setToastError('')
    try {
      const res = await setUserStatusAPI({ id, isActive: newActive })
      setToastSuccess(res?.message || (newActive ? 'User Activated.' : 'User Deactivated.'))
      await loadUsers()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Status update failed.'
      setToastError(msg)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  return (
    <section id="page-users" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Users</h2>
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
          <span>Users</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#f472b6' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Users List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search by name, email..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                  <Icon path={paths.calendar} />
                </span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="glass-input date-filter-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-40"
                  aria-label="Start date"
                />
              </div>
              <span className="text-xs text-slate-500">→</span>
              <div className="relative">
                <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                  <Icon path={paths.calendar} />
                </span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="glass-input date-filter-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-40"
                  aria-label="End date"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="btn-glass flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label="Refresh"
            >
              <Icon path={paths.refresh} />
            </button>
          </div>
        </div>

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}
        {loadingUsers ? <p className="mb-4 text-sm text-slate-400">Loading users...</p> : null}

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="rounded border-white/20 bg-white/5" /></th>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-400">
                    No users found for the selected filters.
                  </td>
                </tr>
              ) : pagination.pageItems.map((user, index) => (
                <tr key={user.id}>
                  <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                  <td className="text-slate-400">{pagination.rangeStart + index}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`avatar-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${user.color}`}>
                        {user.avatar}
                      </div>
                      <span className="font-semibold text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">{user.email}</td>
                  <td className="text-slate-400">{user.phone}</td>
                  <td>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-silver-300">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={user.active}
                          disabled={loadingUsers || statusUpdatingId === user.id}
                          onChange={() => toggleUser(user.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`text-xs font-semibold ${user.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{user.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{user.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${user.name}`}
                        onClick={() => onNavigate?.('user-insights', { ...user, role: user.role || 'User' })}
                      >
                        <Icon path={paths.view} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 ? (
          <TablePagination
            {...pagination}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
            itemLabel="users"
          />
        ) : null}
      </div>
    </section>
  )
}
