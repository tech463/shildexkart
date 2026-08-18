import { useEffect, useState } from 'react'
import { changeAdminPasswordAPI, fetchAdminMeAPI } from '../services/adminService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const paths = {
  eye: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  eyePupil: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB')
}

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function PasswordField({ id, label, placeholder, value, onChange, visible, onToggle }) {
  return (
    <div>
      <label htmlFor={id} className="vendor-field-label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="glass-input vendor-field-input pr-11"
          autoComplete="new-password"
        />
        <button
          type="button"
          className="account-eye-btn"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggle}
        >
          {visible ? (
            <Icon path={paths.eyeOff} />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={paths.eye} />
              <path strokeLinecap="round" strokeLinejoin="round" d={paths.eyePupil} />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default function Account({ onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadError, setLoadError] = useState('')

  const loadProfile = async () => {
    setLoadingProfile(true)
    setLoadError('')
    try {
      const data = await fetchAdminMeAPI()
      setProfile(data?.admin || data?.data || null)
    } catch (err) {
      setLoadError(err?.response?.data?.message || err?.message || 'Failed to load admin profile.')
    } finally {
      setLoadingProfile(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const updatePasswordField = (key) => (event) => {
    setPasswordForm((current) => ({ ...current, [key]: event.target.value }))
    setError('')
    setSuccess('')
  }

  const toggleVisibility = (key) => {
    setVisibility((current) => ({ ...current, [key]: !current[key] }))
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (!passwordForm.current.trim() || !passwordForm.next.trim() || !passwordForm.confirm.trim()) {
      setError('Please fill in all password fields.')
      return
    }
    if (passwordForm.next.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setError('New password and confirm password do not match.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await changeAdminPasswordAPI({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      })
      setSuccess(res?.message || 'Password updated successfully.')
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  const { firstName, lastName } = splitName(profile?.name)
  const fullName = profile?.name || 'Admin'
  const avatar = initialsFrom(fullName)

  return (
    <section id="page-account" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Account Settings</h2>
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
          <span>Account Settings</span>
        </nav>
      </div>

      {loadError ? <div className="vendor-form-error mb-4">{loadError}</div> : null}
      {loadingProfile ? <p className="mb-4 text-sm text-slate-400">Loading profile...</p> : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <div className="neo-card glass-card account-id-card p-5" style={{ '--accent': '#10b981' }}>
            <span className="card-accent" aria-hidden="true" />
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold tracking-wide text-shield">ID Card</h3>
              <span className="account-active-label">{profile?.is_active === false ? 'inactive' : 'active'}</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="account-avatar" aria-hidden="true">{avatar}</div>
              <p className="mt-4 text-lg font-bold text-slate-100">{fullName}</p>
              <p className="mt-1 text-sm text-slate-400">Admin</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Joined</p>
                <p className="mt-1 text-sm font-medium text-slate-200">{formatDate(profile?.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm font-medium text-slate-200">{formatDate(profile?.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="neo-card glass-card p-5" style={{ '--accent': '#10b981' }}>
            <span className="card-accent" aria-hidden="true" />
            <h3 className="mb-5 font-display text-sm font-bold tracking-wide text-shield">Change Password</h3>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <PasswordField
                id="current-password"
                label="Current Password"
                placeholder="Enter current password"
                value={passwordForm.current}
                onChange={updatePasswordField('current')}
                visible={visibility.current}
                onToggle={() => toggleVisibility('current')}
              />
              <PasswordField
                id="new-password"
                label="New Password"
                placeholder="Enter new password"
                value={passwordForm.next}
                onChange={updatePasswordField('next')}
                visible={visibility.next}
                onToggle={() => toggleVisibility('next')}
              />
              <PasswordField
                id="confirm-password"
                label="Confirm Password"
                placeholder="Confirm new password"
                value={passwordForm.confirm}
                onChange={updatePasswordField('confirm')}
                visible={visibility.confirm}
                onToggle={() => toggleVisibility('confirm')}
              />
              {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
              {success ? <p className="text-xs font-medium text-emerald-400">{success}</p> : null}
              <button type="submit" className="account-update-btn w-full" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        <div className="neo-card glass-card p-5" style={{ '--accent': '#00A3FF' }}>
          <span className="card-accent" aria-hidden="true" />
          <h3 className="mb-5 font-display text-sm font-bold tracking-wide text-shield">Personal Information</h3>
          <div className="space-y-4">
            {[
              ['First Name', firstName],
              ['Last Name', lastName],
              ['Email Address', profile?.email || ''],
              ['Phone Number', profile?.phone || ''],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="vendor-field-label">{label}</label>
                <input
                  type="text"
                  value={value || '—'}
                  readOnly
                  className="glass-input vendor-field-input account-readonly-input"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function initialsFrom(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A'
}
