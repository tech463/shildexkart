import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { PAYMENT_PAGE_TYPES, PAYMENTS_DATA } from '../data/payments'

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
  refresh: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 12H16.02',
  close: 'M6 18 18 6M6 6l12 12',
  card: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  refund: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0 0V9.348',
  alertMark: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  print: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

const PAYMENT_TABS = [
  { id: 'all-payments', label: 'All' },
  { id: 'pending-payments', label: 'Pending' },
  { id: 'completed-payments', label: 'Completed' },
  { id: 'refunded-payments', label: 'Refunded' },
  { id: 'failed-payments', label: 'Failed' },
]

const PAYMENT_METHODS = ['COD', 'UPI', 'Card', 'Wallet']
const PAYMENT_STATUSES = ['Pending', 'Completed', 'Refunded', 'Failed']

function formatRupee(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

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

function parsePaymentDate(value) {
  if (!value || value === '—') return null
  const match = String(value).match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})/)
  if (!match) {
    const fallback = new Date(value)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }
  const [, day, monthName, year] = match
  const parsed = new Date(`${monthName} ${day}, ${year} 00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isWithinDateRange(payment, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parsePaymentDate(payment.created)
  const updated = parsePaymentDate(payment.updated)
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

function statusTone(value) {
  const key = String(value || '').toLowerCase()
  if (key === 'completed' || key === 'paid') return 'success'
  if (key === 'pending') return 'warning'
  if (key === 'failed') return 'danger'
  if (key === 'refunded') return 'info'
  if (key === 'cod' || key === 'upi' || key === 'card' || key === 'wallet') return 'method'
  return 'neutral'
}

function PaymentBadge({ value }) {
  return (
    <span className={`payment-badge payment-badge-${statusTone(value)}`}>
      {String(value || '').toUpperCase()}
    </span>
  )
}

function PaymentViewModal({ open, onClose, payment }) {
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

  if (!open || !payment) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-payment-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-payment-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Payment</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-slate-100">{payment.orderId}</p>
            <PaymentBadge value={payment.status} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Customer</p>
              <p className="text-sm text-slate-200">{payment.customer}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Method</p>
              <PaymentBadge value={payment.method} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Payable</p>
              <p className="text-sm font-semibold text-slate-200">{formatRupee(payment.payable)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Paid</p>
              <p className="text-sm font-semibold text-emerald-400">{formatRupee(payment.paid)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Adjustment</p>
              <p className="text-sm text-slate-300">{formatRupee(payment.adjustment)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{payment.created}</p>
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

function PaymentEditModal({ open, onClose, onSubmit, payment }) {
  const [form, setForm] = useState({
    customer: '',
    method: 'COD',
    status: 'Pending',
    payable: '',
    paid: '',
    adjustment: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (payment) {
      setForm({
        customer: payment.customer || '',
        method: payment.method || 'COD',
        status: payment.status || 'Pending',
        payable: String(payment.payable ?? ''),
        paid: String(payment.paid ?? ''),
        adjustment: String(payment.adjustment ?? ''),
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
  }, [open, onClose, payment])

  if (!open || !payment) return null

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.customer.trim()) {
      setError('Please enter a customer name.')
      return
    }
    if (form.payable === '' || Number(form.payable) < 0) {
      setError('Please enter a valid payable amount.')
      return
    }
    if (form.paid === '' || Number(form.paid) < 0) {
      setError('Please enter a valid paid amount.')
      return
    }
    onSubmit({
      id: payment.id,
      customer: form.customer.trim(),
      method: form.method,
      status: form.status,
      payable: Number(form.payable) || 0,
      paid: Number(form.paid) || 0,
      adjustment: Number(form.adjustment) || 0,
    })
  }

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-payment-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="edit-payment-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">Edit </span>
            <span className="vendor-modal-title-accent">Payment</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div>
              <label htmlFor="edit-payment-customer" className="vendor-field-label">Customer</label>
              <input
                id="edit-payment-customer"
                value={form.customer}
                onChange={updateField('customer')}
                className="glass-input vendor-field-input"
                autoFocus
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-payment-method" className="vendor-field-label">Method</label>
                <select
                  id="edit-payment-method"
                  value={form.method}
                  onChange={updateField('method')}
                  className="glass-input vendor-field-input"
                >
                  {[...new Set([form.method, ...PAYMENT_METHODS])].filter(Boolean).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-payment-status" className="vendor-field-label">Status</label>
                <select
                  id="edit-payment-status"
                  value={form.status}
                  onChange={updateField('status')}
                  className="glass-input vendor-field-input"
                >
                  {[...new Set([form.status, ...PAYMENT_STATUSES])].filter(Boolean).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-payment-payable" className="vendor-field-label">Payable</label>
                <input
                  id="edit-payment-payable"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.payable}
                  onChange={updateField('payable')}
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor="edit-payment-paid" className="vendor-field-label">Paid</label>
                <input
                  id="edit-payment-paid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.paid}
                  onChange={updateField('paid')}
                  className="glass-input vendor-field-input"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-payment-adjustment" className="vendor-field-label">Adjustment</label>
                <input
                  id="edit-payment-adjustment"
                  type="number"
                  step="0.01"
                  value={form.adjustment}
                  onChange={updateField('adjustment')}
                  className="glass-input vendor-field-input"
                />
              </div>
            </div>
            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaymentsPage({ paymentType = 'all-payments', onNavigate }) {
  const config = PAYMENT_PAGE_TYPES[paymentType] || PAYMENT_PAGE_TYPES['all-payments']
  const [payments, setPayments] = useState(() => PAYMENTS_DATA.map((payment) => ({ ...payment })))
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [viewingPayment, setViewingPayment] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [deletingPayment, setDeletingPayment] = useState(null)

  useEffect(() => {
    setQuery('')
    setStartDate('')
    setEndDate('')
    setViewingPayment(null)
    setEditingPayment(null)
    setDeletingPayment(null)
  }, [paymentType])

  const filteredPayments = useMemo(() => {
    const search = query.trim().toLowerCase()
    return payments.filter((payment) => (
      (!config.statusFilter || payment.status === config.statusFilter)
      && (!search
        || payment.orderId.toLowerCase().includes(search)
        || payment.customer.toLowerCase().includes(search)
        || payment.method.toLowerCase().includes(search))
      && isWithinDateRange(payment, startDate, endDate)
    ))
  }, [payments, config.statusFilter, query, startDate, endDate])

  const refresh = () => {
    setQuery('')
    setStartDate('')
    setEndDate('')
  }

  const updatePayment = (payload) => {
    const stamp = formatTimestamp()
    setPayments((current) => current.map((payment) => {
      if (payment.id !== payload.id) return payment
      return {
        ...payment,
        customer: payload.customer,
        method: payload.method,
        status: payload.status,
        payable: payload.payable,
        paid: payload.paid,
        adjustment: payload.adjustment,
        updated: stamp,
      }
    }))
    setEditingPayment(null)
  }

  const deletePayment = (id) => {
    setPayments((current) => current.filter((payment) => payment.id !== id))
    setDeletingPayment(null)
  }

  const printReceipt = (payment) => {
    const content = [
      `Receipt for ${payment.orderId}`,
      `Customer: ${payment.customer}`,
      `Method: ${payment.method}`,
      `Status: ${payment.status}`,
      `Payable: ${formatRupee(payment.payable)}`,
      `Paid: ${formatRupee(payment.paid)}`,
      `Adjustment: ${formatRupee(payment.adjustment)}`,
      `Created: ${payment.created}`,
    ].join('\n')
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=640')
    if (!printWindow) return
    printWindow.document.write(`<pre style="font:14px/1.5 ui-sans-serif,system-ui">${content}</pre>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const profileIcon = paymentType === 'pending-payments'
    ? paths.clock
    : paymentType === 'completed-payments'
      ? paths.check
      : paymentType === 'refunded-payments'
        ? paths.refund
        : paymentType === 'failed-payments'
          ? paths.alertMark
          : paths.card

  return (
    <section id={`page-${paymentType}`} className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">{config.title}</h2>
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
          <span>{config.title}</span>
        </nav>
      </div>

      <div className="payment-profile-card mb-5" style={{ '--accent': config.accent }}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="payment-profile-icon" aria-hidden="true">
            <Icon path={profileIcon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="payment-profile-badge">{config.profileLabel}</span>
            <p className="mt-2 text-sm text-slate-300">{config.profileCopy}</p>
          </div>
        </div>
        <div className="stock-segmented" role="tablist" aria-label="Payment status">
          {PAYMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === paymentType}
              className={`stock-segment${tab.id === paymentType ? ' active' : ''}`}
              onClick={() => onNavigate?.(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': config.accent }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">{config.listTitle}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search payments by Order ID..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-60"
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

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1200px] text-left text-sm">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Status</th>
                <th>Payable</th>
                <th>Paid</th>
                <th>Adjustment</th>
                <th>Receipt</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14">
                    <div className="stock-empty-state">
                      <span className="stock-empty-icon" aria-hidden="true">
                        <Icon path={paths.card} className="h-8 w-8" />
                      </span>
                      <p className="stock-empty-title">{config.emptyTitle}</p>
                      <p className="stock-empty-hint">{config.emptyHint}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.map((payment, index) => (
                <tr key={payment.id}>
                  <td className="text-slate-400">{index + 1}</td>
                  <td className="font-semibold text-slate-100">{payment.orderId}</td>
                  <td className="text-slate-200">{payment.customer}</td>
                  <td><PaymentBadge value={payment.method} /></td>
                  <td><PaymentBadge value={payment.status} /></td>
                  <td className="font-semibold text-slate-100">{formatRupee(payment.payable)}</td>
                  <td className="font-semibold text-emerald-400">{formatRupee(payment.paid)}</td>
                  <td className="text-slate-300">{formatRupee(payment.adjustment)}</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn"
                      aria-label={`Print receipt for ${payment.orderId}`}
                      onClick={() => printReceipt(payment)}
                    >
                      <Icon path={paths.print} />
                    </button>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{payment.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{payment.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${payment.orderId}`}
                        onClick={() => setViewingPayment(payment)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${payment.orderId}`}
                        onClick={() => setEditingPayment(payment)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${payment.orderId}`}
                        onClick={() => setDeletingPayment(payment)}
                      >
                        <Icon path={paths.delete} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentViewModal
        open={Boolean(viewingPayment)}
        onClose={() => setViewingPayment(null)}
        payment={viewingPayment}
      />
      <PaymentEditModal
        open={Boolean(editingPayment)}
        onClose={() => setEditingPayment(null)}
        onSubmit={updatePayment}
        payment={editingPayment}
      />
      <DeleteConfirmModal
        open={Boolean(deletingPayment)}
        onClose={() => setDeletingPayment(null)}
        onConfirm={() => deletePayment(deletingPayment.id)}
        itemName={deletingPayment ? `${deletingPayment.orderId} (${deletingPayment.customer})` : ''}
        title="Delete Item"
      />
    </section>
  )
}
