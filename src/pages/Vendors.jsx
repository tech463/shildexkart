import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  fetchVendorsAPI,
  setVendorApprovalStatusAPI,
  setVendorStatusAPI,
  VENDOR_APPROVAL_STATUSES,
} from '../services/vendorService'

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

const APPROVAL_BADGE = {
  pending: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  approved: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  rejected: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
  suspended: 'border-slate-500/30 bg-slate-500/15 text-slate-300',
}

const AVATAR_COLORS = [
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-brand-500/20 text-brand-400 border-brand-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
]

function capitalizeStatus(value) {
  if (!value) return ''
  const text = String(value)
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}


const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  status: 'Active',
  location: '',
  landmark: '',
  street: '',
  pincode: '',
  district: '',
  state: '',
  aadharNumber: '',
  panNumber: '',
  gstNumber: '',
  businessName: '',
  profileImage: null,
  bannerImage: null,
  aadharFrontImage: null,
  aadharBackImage: null,
  panImage: null,
}

const emptyPreviews = {
  profileImage: '',
  bannerImage: '',
  aadharFrontImage: '',
  aadharBackImage: '',
  panImage: '',
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

function parseVendorDate(value) {
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

function isWithinDateRange(vendor, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseVendorDate(vendor.created)
  const updated = parseVendorDate(vendor.updated)
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
    .join('') || 'V'
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="vendor-field-label">
      {children}
    </label>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoFocus = false,
  inputMode,
  className = '',
  matchUpload = false,
}) {
  return (
    <div className={matchUpload ? 'vendor-field-stack' : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputMode={inputMode}
        className={`glass-input vendor-field-input${matchUpload ? ' vendor-field-match-upload' : ''} ${className}`.trim()}
      />
    </div>
  )
}

function ImageUploadField({ id, label, preview, onSelect }) {
  return (
    <div className="vendor-field-stack">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <label htmlFor={id} className={`vendor-upload-zone${preview ? ' has-preview' : ''}`}>
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => onSelect(event.target.files?.[0] || null)}
        />
        {preview ? (
          <img src={preview} alt={`${label} preview`} />
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
  )
}

function FormSection({ title, children }) {
  return (
    <section className="vendor-form-section">
      <h4 className="vendor-form-section-title">{title}</h4>
      <div className="vendor-form-grid">{children}</div>
    </section>
  )
}

function VendorModal({ open, onClose, onSubmit, vendor = null }) {
  const isEdit = Boolean(vendor)
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [previews, setPreviews] = useState(emptyPreviews)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    if (vendor) {
      const { firstName, lastName } = splitName(vendor.name)
      setForm({
        ...emptyForm,
        firstName,
        lastName,
        email: vendor.email || '',
        phone: vendor.phone || '',
        password: '',
        status: vendor.active ? 'Active' : 'Inactive',
        location: vendor.location || '',
        landmark: vendor.landmark || '',
        street: vendor.street || '',
        pincode: vendor.pincode || '',
        district: vendor.district || '',
        state: vendor.state || '',
        aadharNumber: vendor.aadharNumber || '',
        panNumber: vendor.panNumber || '',
        gstNumber: vendor.gstNumber || '',
        businessName: vendor.businessName || '',
      })
    } else {
      setForm(emptyForm)
    }

    setShowPassword(false)
    setPreviews((current) => {
      Object.values(current).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
      return emptyPreviews
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
  }, [open, onClose, vendor])

  if (!open) return null

  const updateField = (field) => (event) => {
    const value = field === 'panNumber' || field === 'gstNumber'
      ? event.target.value.toUpperCase()
      : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const selectImage = (field) => (file) => {
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
    setForm((current) => ({ ...current, [field]: file }))
    setPreviews((current) => {
      if (current[field]) URL.revokeObjectURL(current[field])
      return { ...current, [field]: URL.createObjectURL(file) }
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
      id: vendor?.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      status: form.status,
      active: form.status === 'Active',
      location: form.location.trim(),
      landmark: form.landmark.trim(),
      street: form.street.trim(),
      pincode: form.pincode.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      aadharNumber: form.aadharNumber.trim(),
      panNumber: form.panNumber.trim(),
      gstNumber: form.gstNumber.trim(),
      businessName: form.businessName.trim(),
      profileImage: form.profileImage,
      bannerImage: form.bannerImage,
      aadharFrontImage: form.aadharFrontImage,
      aadharBackImage: form.aadharBackImage,
      panImage: form.panImage,
    })
  }

  const fieldPrefix = isEdit ? 'edit-vendor' : 'add-vendor'

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-wide glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldPrefix}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id={`${fieldPrefix}-title`} className="vendor-modal-title">
            <span className="vendor-modal-title-muted">{isEdit ? 'Edit ' : 'Add '}</span>
            <span className="vendor-modal-title-accent">Vendor</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body">
            <FormSection title="Basic Details">
              <TextField id={`${fieldPrefix}-first-name`} label="First Name" value={form.firstName} onChange={updateField('firstName')} placeholder="John" autoFocus />
              <TextField id={`${fieldPrefix}-last-name`} label="Last Name" value={form.lastName} onChange={updateField('lastName')} placeholder="Doe" />
              <TextField id={`${fieldPrefix}-email`} label="Email" type="email" value={form.email} onChange={updateField('email')} placeholder="john@example.com" />
              <TextField id={`${fieldPrefix}-phone`} label="Phone Number" type="tel" value={form.phone} onChange={updateField('phone')} placeholder="9876543210" />
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
            </FormSection>

            <FormSection title="Media & Location">
              <ImageUploadField id={`${fieldPrefix}-profile-image`} label="Profile Image" preview={previews.profileImage} onSelect={selectImage('profileImage')} />
              <ImageUploadField id={`${fieldPrefix}-banner-image`} label="Banner Image" preview={previews.bannerImage} onSelect={selectImage('bannerImage')} />
              <TextField id={`${fieldPrefix}-location`} label="Location" value={form.location} onChange={updateField('location')} placeholder="Enter location" matchUpload />
              <TextField id={`${fieldPrefix}-landmark`} label="Landmark" value={form.landmark} onChange={updateField('landmark')} placeholder="Enter landmark" />
              <TextField id={`${fieldPrefix}-street`} label="Road/Street" value={form.street} onChange={updateField('street')} placeholder="Enter road/street" />
              <TextField id={`${fieldPrefix}-pincode`} label="Pincode" value={form.pincode} onChange={updateField('pincode')} placeholder="Enter pincode" inputMode="numeric" />
              <TextField id={`${fieldPrefix}-district`} label="District" value={form.district} onChange={updateField('district')} placeholder="Enter district" />
              <TextField id={`${fieldPrefix}-state`} label="State" value={form.state} onChange={updateField('state')} placeholder="Enter state" />
              <TextField id={`${fieldPrefix}-aadhar-number`} label="Aadhar Number" value={form.aadharNumber} onChange={updateField('aadharNumber')} placeholder="Enter Aadhar number" inputMode="numeric" />
            </FormSection>

            <FormSection title="KYC & Business">
              <ImageUploadField id={`${fieldPrefix}-aadhar-front`} label="Aadhar Front Image" preview={previews.aadharFrontImage} onSelect={selectImage('aadharFrontImage')} />
              <ImageUploadField id={`${fieldPrefix}-aadhar-back`} label="Aadhar Back Image" preview={previews.aadharBackImage} onSelect={selectImage('aadharBackImage')} />
              <TextField id={`${fieldPrefix}-pan-number`} label="PAN Number" value={form.panNumber} onChange={updateField('panNumber')} placeholder="Enter PAN number" className="uppercase tracking-wide" matchUpload />
              <ImageUploadField id={`${fieldPrefix}-pan-image`} label="PAN Image" preview={previews.panImage} onSelect={selectImage('panImage')} />
              <TextField id={`${fieldPrefix}-gst-number`} label="GST Number" value={form.gstNumber} onChange={updateField('gstNumber')} placeholder="Enter GST number" className="uppercase tracking-wide" matchUpload />
              <TextField id={`${fieldPrefix}-business-name`} label="Business Name" value={form.businessName} onChange={updateField('businessName')} placeholder="Enter business name" matchUpload />
            </FormSection>

            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>

          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-glass vendor-btn-submit">
              {isEdit ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Vendors({ onNavigate }) {
  const [vendors, setVendors] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)
  const [deletingVendor, setDeletingVendor] = useState(null)
  const [loadingVendors, setLoadingVendors] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const t = setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 3000)
    return () => clearTimeout(t)
  }, [toastSuccess, toastError])

  const normalizeVendors = (items = []) => items.map((v, idx) => {
    const name = v?.name ?? ''
    const initials = getInitials(name)
    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]

    const createdRaw = v?.created_at ?? v?.created ?? v?.createdAt
    const updatedRaw = v?.updated_at ?? v?.updated ?? v?.updatedAt
    const approvalStatus = String(v?.status || 'pending').toLowerCase()

    return {
      id: v?.id ?? v?._id ?? Date.now() + idx,
      name,
      email: v?.email ?? '',
      phone: v?.phone ?? v?.phoneNumber ?? '',
      approvalStatus,
      active: Boolean(v?.is_active ?? v?.active),
      created: createdRaw ? formatTimestamp(new Date(createdRaw)) : '',
      updated: updatedRaw ? formatTimestamp(new Date(updatedRaw)) : '',
      avatar: initials,
      color,
    }
  })

  const loadVendors = async () => {
    setLoadingVendors(true)
    setToastError('')
    try {
      const data = await fetchVendorsAPI()
      const vendorsData = data?.vendors ?? data?.data?.vendors ?? data?.result?.vendors ?? []
      setVendors(normalizeVendors(vendorsData))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load vendors.'
      setToastError(msg)
    } finally {
      setLoadingVendors(false)
    }
  }

  useEffect(() => {
    loadVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredVendors = useMemo(() => {
    const search = query.trim().toLowerCase()
    return vendors.filter((vendor) => (
      (!search || vendor.name.toLowerCase().includes(search) || vendor.email.toLowerCase().includes(search))
      && (!status || vendor.approvalStatus === status)
      && isWithinDateRange(vendor, startDate, endDate)
    ))
  }, [vendors, query, status, startDate, endDate])

  const refresh = () => {
    setQuery('')
    setStatus('')
    setStartDate('')
    setEndDate('')
    loadVendors()
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingVendor(null)
  }

  const openAddModal = () => {
    setEditingVendor(null)
    setModalOpen(true)
  }

  const openEditModal = (vendor) => {
    setEditingVendor(vendor)
    setModalOpen(true)
  }

  const changeApprovalStatus = async (id, nextStatus) => {
    const vendor = vendors.find((item) => item.id === id)
    if (!vendor || statusUpdatingId) return
    if (vendor.approvalStatus === nextStatus) return

    setStatusUpdatingId(id)
    setToastError('')
    try {
      const res = await setVendorApprovalStatusAPI(id, nextStatus)
      setToastSuccess(res?.message || `Vendor marked as ${nextStatus}.`)
      await loadVendors()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Approval update failed.'
      setToastError(msg)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const toggleVendor = async (id) => {
    const vendor = vendors.find((v) => v.id === id)
    if (!vendor) return
    if (statusUpdatingId) return

    const newActive = !vendor.active
    setStatusUpdatingId(id)
    setToastError('')
    try {
      const res = await setVendorStatusAPI({ id, isActive: newActive })
      setToastSuccess(res?.message || (newActive ? 'Vendor activated successfully.' : 'Vendor suspended successfully.'))
      await loadVendors()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Status update failed.'
      setToastError(msg)
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const deleteVendor = (id) => {
    setVendors((current) => current.filter((vendor) => vendor.id !== id))
    setDeletingVendor(null)
  }

  const addVendor = (payload) => {
    const stamp = formatTimestamp()
    setVendors((current) => [
      {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        landmark: payload.landmark,
        street: payload.street,
        pincode: payload.pincode,
        district: payload.district,
        state: payload.state,
        aadharNumber: payload.aadharNumber,
        panNumber: payload.panNumber,
        gstNumber: payload.gstNumber,
        businessName: payload.businessName,
        avatar: getInitials(payload.name),
        color: AVATAR_COLORS[current.length % AVATAR_COLORS.length],
        created: stamp,
        updated: stamp,
        active: payload.active,
      },
      ...current,
    ])
    closeModal()
  }

  const updateVendor = (payload) => {
    const stamp = formatTimestamp()
    setVendors((current) => current.map((vendor) => (
      vendor.id === payload.id
        ? {
          ...vendor,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          location: payload.location,
          landmark: payload.landmark,
          street: payload.street,
          pincode: payload.pincode,
          district: payload.district,
          state: payload.state,
          aadharNumber: payload.aadharNumber,
          panNumber: payload.panNumber,
          gstNumber: payload.gstNumber,
          businessName: payload.businessName,
          avatar: getInitials(payload.name),
          active: payload.active,
          updated: stamp,
        }
        : vendor
    )))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingVendor) updateVendor(payload)
    else addVendor(payload)
  }

  return (
    <section id="page-vendors" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Vendors</h2>
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
          <span>Vendors</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#00A3FF' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Vendors List</h3>
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
              <option value="">Approval status</option>
              {VENDOR_APPROVAL_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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
            <button
              type="button"
              className="btn-add"
              aria-label="Add vendor"
              onClick={openAddModal}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

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
                <th>Approval</th>
                <th>Active</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingVendors ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">Loading vendors...</td>
                </tr>
              ) : (
                filteredVendors.map((vendor, index) => (
                <tr key={vendor.id}>
                  <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                  <td className="text-slate-400">{index + 1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`avatar-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${vendor.color}`}>
                        {vendor.avatar}
                      </div>
                      <span className="font-semibold text-slate-200">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">{vendor.email}</td>
                  <td className="text-slate-400">{vendor.phone}</td>
                  <td>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-silver-300">
                      Vendor
                    </span>
                  </td>
                  <td>
                    <div className="flex min-w-[160px] flex-col gap-2">
                      <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold ${APPROVAL_BADGE[vendor.approvalStatus] || APPROVAL_BADGE.pending}`}>
                        {capitalizeStatus(vendor.approvalStatus) || 'Pending'}
                      </span>
                      <select
                        value={vendor.approvalStatus || 'pending'}
                        disabled={loadingVendors || statusUpdatingId === vendor.id}
                        onChange={(event) => changeApprovalStatus(vendor.id, event.target.value)}
                        className="glass-input rounded-lg px-2 py-1 text-xs"
                        aria-label={`Approval status for ${vendor.name}`}
                      >
                        {VENDOR_APPROVAL_STATUSES.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      {vendor.approvalStatus === 'pending' ? (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={statusUpdatingId === vendor.id}
                            onClick={() => changeApprovalStatus(vendor.id, 'approved')}
                            className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={statusUpdatingId === vendor.id}
                            onClick={() => changeApprovalStatus(vendor.id, 'rejected')}
                            className="rounded-lg bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/30 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={vendor.active}
                          disabled={loadingVendors || statusUpdatingId === vendor.id}
                          onChange={() => toggleVendor(vendor.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`vendor-status-label text-xs font-semibold ${vendor.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {vendor.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{vendor.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{vendor.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${vendor.name}`}
                        onClick={() => onNavigate?.('user-insights', { ...vendor, role: 'Vendor' })}
                      >
                        <Icon path={paths.view} />
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${vendor.name}`}
                        onClick={() => openEditModal(vendor)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingVendor(vendor)}
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${vendor.name}`}
                      >
                        <Icon path={paths.delete} />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VendorModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        vendor={editingVendor}
      />
      <DeleteConfirmModal
        open={Boolean(deletingVendor)}
        onClose={() => setDeletingVendor(null)}
        onConfirm={() => deleteVendor(deletingVendor.id)}
        itemName={deletingVendor?.name || ''}
        title="Delete Vendor"
      />
    </section>
  )
}
