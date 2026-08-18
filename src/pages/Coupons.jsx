import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { DISCOUNT_TYPES } from '../data/coupons'
import {
  createCoupon,
  deleteCoupon as deleteCouponThunk,
  fetchCoupons,
  updateCoupon,
} from '../store/slices/couponSlice'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const paths = {
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  plus: 'M12 4.5v15m7.5-7.5h-15',
  close: 'M6 18 18 6M6 6l12 12',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

const emptyForm = {
  code: '',
  description: '',
  discountType: 'Percent',
  discountValue: '',
  unlimited: false,
  startDate: '',
  endDate: '',
  expiryDays: '30',
  status: 'Active',
  usage: '0',
  usageLimit: '500',
  minOrder: '',
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(endDate) {
  if (!endDate) return null
  const end = new Date(`${endDate}T23:59:59`)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

function buildDiscountLabel(type, value) {
  if (type === 'Shipping') return 'Shipping'
  if (type === 'Fixed') return `₹${Number(value) || 0}`
  return `${Number(value) || 0}%`
}

/** Dynamic description from API value, with a readable fallback from discount rules. */
function buildDynamicDescription(item, discountType, discountValue) {
  const saved = String(item?.description ?? item?.desc ?? '').trim()
  if (saved) return saved
  if (discountType === 'Shipping') return 'Free shipping on eligible orders'
  if (discountType === 'Fixed') return `Flat ₹${Number(discountValue) || 0} off`
  return `${Number(discountValue) || 0}% off your order`
}

function buildExpiryLabel({ unlimited, status, expiryDays, endDate }) {
  if (unlimited) return 'Unlimited'
  if (status === 'Expired') return 'Expired'
  if (endDate) {
    const remaining = daysUntil(endDate)
    if (remaining == null) return 'Expired'
    if (remaining <= 0) return 'Expired'
    return `${remaining} days`
  }
  if (Number(expiryDays) <= 0) return 'Expired'
  return `${Number(expiryDays)} days`
}

function parseCouponDate(value) {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isWithinDateRange(row, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseCouponDate(row.createdAt)
  const updated = parseCouponDate(row.updatedAt)
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null
  const matches = (date) => {
    if (!date) return false
    if (start && date < start) return false
    if (end && date > end) return false
    return true
  }
  return matches(created) || matches(updated)
}

function usagePercent(usage, usageLimit) {
  const limit = Number(usageLimit) || 0
  if (limit <= 0) return 0
  return Math.min(100, Math.round((Number(usage) / limit) * 100))
}

const AMOUNT_TYPE_LABELS = { percent: 'Percent', fixed: 'Fixed', shipping: 'Shipping' }

function toISODate(value) {
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

/** API row → table row shape. */
function normalizeCouponRows(items = []) {
  return items.map((item, index) => {
    const amountType = String(item?.amount_type ?? item?.amountType ?? item?.discount_type ?? 'percent').toLowerCase()
    const discountType = AMOUNT_TYPE_LABELS[amountType] || 'Percent'
    const discountValue = Number(item?.amount ?? item?.discountValue ?? 0)
    const active = item?.is_active ?? item?.isActive
    const unlimited = Boolean(item?.is_unlimited ?? item?.isUnlimited ?? item?.unlimited)
    const endDate = toISODate(item?.end_date ?? item?.endDate)
    const startDate = toISODate(item?.start_date ?? item?.startDate)
    const status = active === false || active === 0 || active === '0'
      ? 'Inactive'
      : (!unlimited && endDate && daysUntil(endDate) != null && daysUntil(endDate) <= 0)
        ? 'Expired'
        : 'Active'
    const usage = Number(item?.usage_count ?? item?.usageCount ?? item?.usage ?? 0)
    const usageLimit = Number(item?.usage_limit ?? item?.usageLimit ?? 0)
    const description = buildDynamicDescription(item, discountType, discountValue)

    return {
      id: item?.id ?? index,
      code: item?.name ?? item?.code ?? '',
      description,
      descriptionRaw: String(item?.description ?? item?.desc ?? '').trim(),
      discountType,
      discountValue,
      discountLabel: buildDiscountLabel(discountType, discountValue),
      unlimited,
      startDate,
      endDate,
      expiryDays: unlimited ? null : daysUntil(endDate),
      expiryLabel: buildExpiryLabel({
        unlimited,
        status,
        expiryDays: unlimited ? null : daysUntil(endDate),
        endDate: unlimited ? '' : endDate,
      }),
      status,
      usage: Number.isFinite(usage) ? usage : 0,
      usageLimit: Number.isFinite(usageLimit) ? usageLimit : 0,
      minOrder: Number(item?.min_order ?? item?.minOrder ?? 0),
      createdAt: toISODate(item?.created_at ?? item?.createdAt),
      updatedAt: toISODate(item?.updated_at ?? item?.updatedAt),
    }
  })
}

function CouponModal({ open, onClose, onSubmit, coupon = null, submitting = false }) {
  const isEdit = Boolean(coupon)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (coupon) {
      setForm({
        code: coupon.code || '',
        description: coupon.descriptionRaw || coupon.description || '',
        discountType: coupon.discountType || 'Percent',
        discountValue: String(coupon.discountValue ?? ''),
        unlimited: Boolean(coupon.unlimited),
        startDate: coupon.startDate || '',
        endDate: coupon.endDate || '',
        expiryDays: coupon.unlimited ? '' : String(coupon.expiryDays ?? 0),
        status: coupon.status || 'Active',
        usage: String(coupon.usage ?? 0),
        usageLimit: String(coupon.usageLimit ?? 500),
        minOrder: coupon.minOrder != null ? String(coupon.minOrder) : '',
      })
    } else {
      setForm({
        ...emptyForm,
        startDate: todayISO(),
      })
    }
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
  }, [open, onClose, coupon])

  if (!open) return null

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.code.trim()) {
      setError('Please enter coupon code.')
      return
    }
    const discountValue = form.discountType === 'Shipping' ? 0 : Number(form.discountValue)
    if (form.discountType !== 'Shipping' && (!Number.isFinite(discountValue) || discountValue < 0)) {
      setError('Please enter a valid discount value.')
      return
    }
    const usage = isEdit ? Number(form.usage) : 0
    const usageLimit = form.usageLimit === '' ? 0 : Number(form.usageLimit)
    if (form.usageLimit !== '' && (!Number.isFinite(usageLimit) || usageLimit < 0)) {
      setError('Please enter a valid usage limit.')
      return
    }
    if (isEdit && (!Number.isFinite(usage) || usage < 0)) {
      setError('Please enter valid usage.')
      return
    }
    if (!form.unlimited && !form.endDate && !form.expiryDays) {
      setError('Please set an end date or enable unlimited expiry.')
      return
    }
    if (!form.unlimited && form.endDate && form.startDate && form.endDate < form.startDate) {
      setError('End date must be after start date.')
      return
    }

    let expiryDays = form.unlimited ? null : Number(form.expiryDays)
    if (!form.unlimited && form.endDate) {
      const remaining = daysUntil(form.endDate)
      expiryDays = remaining != null && remaining > 0 ? remaining : 0
    }
    if (!form.unlimited && !form.endDate && (!Number.isFinite(expiryDays) || expiryDays < 0)) {
      setError('Please enter valid expiry days or an end date.')
      return
    }

    const status = form.status
    const minOrderRaw = form.minOrder.trim()
    const minOrder = minOrderRaw === '' ? 0 : Number(minOrderRaw)
    if (minOrderRaw !== '' && (!Number.isFinite(minOrder) || minOrder < 0)) {
      setError('Please enter a valid minimum order amount.')
      return
    }

    onSubmit({
      id: coupon?.id,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || buildDynamicDescription({}, form.discountType, discountValue),
      discountType: form.discountType,
      discountValue,
      discountLabel: buildDiscountLabel(form.discountType, discountValue),
      unlimited: form.unlimited,
      startDate: form.startDate || todayISO(),
      endDate: form.unlimited ? '' : (form.endDate || ''),
      expiryDays: form.unlimited ? null : expiryDays,
      expiryLabel: buildExpiryLabel({
        unlimited: form.unlimited,
        status,
        expiryDays: form.unlimited ? null : expiryDays,
        endDate: form.unlimited ? '' : form.endDate,
      }),
      status,
      usage,
      usageLimit,
      minOrder,
    })
  }

  const fieldPrefix = isEdit ? 'edit-coupon' : 'create-coupon'

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category coupon-modal glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldPrefix}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id={`${fieldPrefix}-title`} className="vendor-modal-title">
            <span className="vendor-modal-title-muted">{isEdit ? 'Edit ' : 'Create '}</span>
            <span className="vendor-modal-title-accent">Coupon</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldPrefix}-code`} className="vendor-field-label">Coupon Code</label>
                <input
                  id={`${fieldPrefix}-code`}
                  value={form.code}
                  onChange={updateField('code')}
                  className="glass-input vendor-field-input uppercase"
                  placeholder="e.g. WELCOME20"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-type`} className="vendor-field-label">Discount Type</label>
                <select
                  id={`${fieldPrefix}-type`}
                  value={form.discountType}
                  onChange={updateField('discountType')}
                  className="glass-input vendor-field-input"
                >
                  {DISCOUNT_TYPES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${fieldPrefix}-description`} className="vendor-field-label">Description</label>
                <input
                  id={`${fieldPrefix}-description`}
                  value={form.description}
                  onChange={updateField('description')}
                  className="glass-input vendor-field-input"
                  placeholder="e.g. Welcome Discount"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-value`} className="vendor-field-label">
                  {form.discountType === 'Fixed' ? 'Discount Amount (₹)' : form.discountType === 'Shipping' ? 'Discount Value' : 'Discount Percent (%)'}
                </label>
                <input
                  id={`${fieldPrefix}-value`}
                  type="number"
                  min="0"
                  step="1"
                  value={form.discountValue}
                  onChange={updateField('discountValue')}
                  className="glass-input vendor-field-input"
                  placeholder={form.discountType === 'Fixed' ? '50' : '20'}
                  disabled={form.discountType === 'Shipping'}
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-min`} className="vendor-field-label">Min Order Amount (₹)</label>
                <input
                  id={`${fieldPrefix}-min`}
                  type="number"
                  min="0"
                  step="1"
                  value={form.minOrder}
                  onChange={updateField('minOrder')}
                  className="glass-input vendor-field-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-start`} className="vendor-field-label">Start Date</label>
                <input
                  id={`${fieldPrefix}-start`}
                  type="date"
                  value={form.startDate}
                  max={form.endDate || undefined}
                  onChange={updateField('startDate')}
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-end`} className="vendor-field-label">End Date</label>
                <input
                  id={`${fieldPrefix}-end`}
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={updateField('endDate')}
                  className="glass-input vendor-field-input"
                  disabled={form.unlimited}
                />
              </div>
              {isEdit ? (
                <div>
                  <label htmlFor={`${fieldPrefix}-usage`} className="vendor-field-label">Current Usage</label>
                  <input
                    id={`${fieldPrefix}-usage`}
                    type="number"
                    min="0"
                    value={form.usage}
                    onChange={updateField('usage')}
                    className="glass-input vendor-field-input"
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor={`${fieldPrefix}-limit`} className="vendor-field-label">Usage Limit</label>
                <input
                  id={`${fieldPrefix}-limit`}
                  type="number"
                  min="1"
                  value={form.usageLimit}
                  onChange={updateField('usageLimit')}
                  className="glass-input vendor-field-input"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Unlimited expiry</p>
                <p className="text-xs text-slate-400">Coupon never expires when enabled.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.unlimited} onChange={updateField('unlimited')} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Active status</p>
                <p className="text-xs text-slate-400">Inactive coupons cannot be applied at checkout.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.status === 'Active'}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    status: event.target.checked ? 'Active' : 'Expired',
                  }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button
              type="submit"
              className="btn-glass vendor-btn-submit coupon-modal-submit w-full !min-w-0"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CouponViewModal({ open, onClose, coupon }) {
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

  if (!open || !coupon) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-coupon-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-coupon-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Coupon</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Code</p>
              <span className="coupon-code-badge">{coupon.code}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Discount</p>
              <p className="text-sm font-semibold text-slate-200">{coupon.discountLabel}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Description</p>
              <p className="text-sm text-slate-200">{coupon.description}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Expiry</p>
              <p className={`text-sm ${coupon.expiryLabel === 'Expired' ? 'text-red-400' : 'text-emerald-400'}`}>
                {coupon.expiryLabel}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <span className={`coupon-status-pill ${coupon.status === 'Active' ? 'is-active' : 'is-expired'}`}>
                {coupon.status.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Usage</p>
              <p className="text-sm text-slate-200">
                {coupon.usage}
                {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ' / Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{coupon.createdAt}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Updated</p>
              <p className="text-sm text-slate-300">{coupon.updatedAt}</p>
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

export default function Coupons({ onNavigate }) {
  const dispatch = useDispatch()
  const couponState = useSelector((state) => state.coupon)

  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [viewingCoupon, setViewingCoupon] = useState(null)
  const [deletingCoupon, setDeletingCoupon] = useState(null)
  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  const coupons = useMemo(
    () => normalizeCouponRows(couponState.rows),
    [couponState.rows],
  )
  const submitting = couponState.creating || couponState.updating

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const timer = setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 3000)
    return () => clearTimeout(timer)
  }, [toastSuccess, toastError])

  const loadCoupons = useCallback(async () => {
    try {
      await dispatch(fetchCoupons({ page: 1, limit: 100 })).unwrap()
    } catch (err) {
      setToastError(typeof err === 'string' ? err : 'Failed to load coupons.')
    }
  }, [dispatch])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const filteredCoupons = useMemo(() => {
    const search = query.trim().toLowerCase()
    return coupons.filter((row) => (
      (!search
        || row.code.toLowerCase().includes(search)
        || row.description.toLowerCase().includes(search)
        || row.discountLabel.toLowerCase().includes(search)
        || row.status.toLowerCase().includes(search))
      && isWithinDateRange(row, startDate, endDate)
    ))
  }, [coupons, query, startDate, endDate])

  const closeModal = () => {
    setModalOpen(false)
    setEditingCoupon(null)
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setModalOpen(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setModalOpen(true)
  }

  const deleteCoupon = async (id) => {
    setToastError('')
    try {
      const data = await dispatch(deleteCouponThunk(id)).unwrap()
      setDeletingCoupon(null)
      setToastSuccess(data?.message || 'Coupon deleted successfully.')
      await loadCoupons()
    } catch (err) {
      setDeletingCoupon(null)
      setToastError(typeof err === 'string' ? err : 'Coupon delete failed.')
    }
  }

  const handleModalSubmit = async (payload) => {
    const apiPayload = {
      name: payload.code,
      code: payload.code,
      description: payload.description,
      discountType: payload.discountType,
      amount: payload.discountValue,
      discountValue: payload.discountValue,
      unlimited: payload.unlimited,
      startDate: payload.startDate,
      endDate: payload.endDate,
      usage: payload.usage,
      usageLimit: payload.usageLimit,
      minOrder: payload.minOrder,
      status: payload.status,
      isActive: payload.status === 'Active',
    }

    setToastError('')
    try {
      if (editingCoupon) {
        await dispatch(updateCoupon({ id: editingCoupon.id, payload: apiPayload })).unwrap()
        setToastSuccess('Coupon updated successfully.')
      } else {
        await dispatch(createCoupon(apiPayload)).unwrap()
        setToastSuccess('Coupon created successfully.')
      }
      closeModal()
      await loadCoupons()
    } catch (err) {
      setToastError(typeof err === 'string' ? err : 'Coupon save failed.')
    }
  }

  return (
    <section id="page-coupons" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Coupons & Discounts</h2>
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
          <span>Coupons & Discounts</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#34d399' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Coupon List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search Coupons..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>
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
            <button type="button" className="coupon-create-btn" onClick={openCreateModal}>
              <Icon path={paths.plus} className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        </div>

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

        <div className="overflow-x-auto">
          <table className="vendors-table data-table coupons-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Usage</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {couponState.loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-400">
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-slate-500">
                    No coupons found
                  </td>
                </tr>
              ) : filteredCoupons.map((row) => {
                const percent = usagePercent(row.usage, row.usageLimit)
                const expired = row.expiryLabel === 'Expired' || row.status === 'Expired'
                return (
                  <tr key={row.id}>
                    <td>
                      <span className="coupon-code-badge">{row.code}</span>
                    </td>
                    <td className="max-w-[220px] text-slate-300">
                      <span className="line-clamp-2" title={row.description}>{row.description}</span>
                    </td>
                    <td className="font-semibold text-slate-100">{row.discountLabel}</td>
                    <td>
                      <span className={`coupon-expiry ${expired ? 'is-expired' : 'is-active'}`}>
                        <span className="coupon-expiry-dot" aria-hidden="true" />
                        {row.expiryLabel}
                      </span>
                    </td>
                    <td>
                      <span className={`coupon-status-pill ${row.status === 'Active' ? 'is-active' : 'is-expired'}`}>
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="coupon-usage-track" aria-hidden="true">
                          <div className="coupon-usage-fill" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-300">
                          {row.usage}
                          {row.usageLimit > 0 ? ` / ${row.usageLimit}` : ' / ∞'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-slate-400">{row.createdAt}</td>
                    <td className="whitespace-nowrap text-slate-400">{row.updatedAt}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="action-btn"
                          aria-label={`View ${row.code}`}
                          onClick={() => setViewingCoupon(row)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                            <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          aria-label={`Edit ${row.code}`}
                          onClick={() => openEditModal(row)}
                        >
                          <Icon path={paths.edit} />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn-danger"
                          aria-label={`Delete ${row.code}`}
                          onClick={() => setDeletingCoupon(row)}
                        >
                          <Icon path={paths.delete} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        coupon={editingCoupon}
        submitting={submitting}
      />
      <CouponViewModal
        open={Boolean(viewingCoupon)}
        onClose={() => setViewingCoupon(null)}
        coupon={viewingCoupon}
      />
      <DeleteConfirmModal
        open={Boolean(deletingCoupon)}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={() => deleteCoupon(deletingCoupon.id)}
        itemName={deletingCoupon?.code || ''}
        title="Delete Item"
      />
    </section>
  )
}
