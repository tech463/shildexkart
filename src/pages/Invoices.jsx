import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  INVOICES_DATA,
  INVOICE_STATUSES,
  ORDER_STATUSES,
  PAYMENT_MODES,
} from '../data/invoices'

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
  plus: 'M12 4.5v15m7.5-7.5h-15',
  close: 'M6 18 18 6M6 6l12 12',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  print: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z',
}

const emptyForm = {
  invoiceId: '',
  clientName: '',
  clientEmail: '',
  phone: '',
  totalAmount: '',
  paymentMode: 'Not available',
  issuedDate: '',
  invoiceStatus: 'Unpaid',
  orderStatus: 'Pending',
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

function formatIssuedDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRupee(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '₹ 0'
  return `₹ ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function parseInvoiceDate(value) {
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

function isWithinDateRange(row, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseInvoiceDate(row.created)
  const updated = parseInvoiceDate(row.updated)
  const issued = row.issuedDate ? new Date(row.issuedDate) : null
  const start = startDate ? new Date(`${startDate}T00:00:00`) : null
  const end = endDate ? new Date(`${endDate}T23:59:59`) : null
  const matches = (date) => {
    if (!date || Number.isNaN(date.getTime())) return false
    if (start && date < start) return false
    if (end && date > end) return false
    return true
  }
  return matches(created) || matches(updated) || matches(issued)
}

function invoiceStatusClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'paid') return 'invoice-status-paid'
  if (key === 'partial') return 'invoice-status-partial'
  if (key === 'cancelled') return 'invoice-status-cancelled'
  return 'invoice-status-unpaid'
}

function orderStatusClass(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'delivered') return 'invoice-order-delivered'
  if (key === 'processing' || key === 'shipped') return 'invoice-order-processing'
  if (key === 'cancelled') return 'invoice-order-cancelled'
  return 'invoice-order-pending'
}

function InvoiceModal({ open, onClose, onSubmit, invoice = null }) {
  const isEdit = Boolean(invoice)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (invoice) {
      setForm({
        invoiceId: invoice.invoiceId || '',
        clientName: invoice.clientName || '',
        clientEmail: invoice.clientEmail || '',
        phone: invoice.phone || '',
        totalAmount: String(invoice.totalAmount ?? ''),
        paymentMode: invoice.paymentMode || 'Not available',
        issuedDate: invoice.issuedDate || '',
        invoiceStatus: invoice.invoiceStatus || 'Unpaid',
        orderStatus: invoice.orderStatus || 'Pending',
      })
    } else {
      setForm({ ...emptyForm, issuedDate: formatIssuedDate() })
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
  }, [open, onClose, invoice])

  if (!open) return null

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.clientName.trim() || !form.clientEmail.trim() || !form.phone.trim()) {
      setError('Please fill in client name, email, and phone.')
      return
    }
    const amount = Number(form.totalAmount)
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Please enter a valid total amount.')
      return
    }
    onSubmit({
      id: invoice?.id,
      invoiceId: form.invoiceId.trim(),
      clientName: form.clientName.trim(),
      clientEmail: form.clientEmail.trim(),
      phone: form.phone.trim(),
      totalAmount: amount,
      paymentMode: form.paymentMode,
      issuedDate: form.issuedDate.trim() || formatIssuedDate(),
      invoiceStatus: form.invoiceStatus,
      orderStatus: form.orderStatus,
    })
  }

  const fieldPrefix = isEdit ? 'edit-invoice' : 'add-invoice'

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldPrefix}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id={`${fieldPrefix}-title`} className="vendor-modal-title">
            <span className="vendor-modal-title-muted">{isEdit ? 'Edit ' : 'Add '}</span>
            <span className="vendor-modal-title-accent">Invoice</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldPrefix}-id`} className="vendor-field-label">Invoice ID</label>
                <input
                  id={`${fieldPrefix}-id`}
                  value={form.invoiceId}
                  onChange={updateField('invoiceId')}
                  className="glass-input vendor-field-input"
                  placeholder="e.g. 5576-992"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-amount`} className="vendor-field-label">Total Amount</label>
                <input
                  id={`${fieldPrefix}-amount`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={updateField('totalAmount')}
                  className="glass-input vendor-field-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-client`} className="vendor-field-label">Client Name</label>
                <input
                  id={`${fieldPrefix}-client`}
                  value={form.clientName}
                  onChange={updateField('clientName')}
                  className="glass-input vendor-field-input"
                  placeholder="Client name"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-email`} className="vendor-field-label">Client Email</label>
                <input
                  id={`${fieldPrefix}-email`}
                  type="email"
                  value={form.clientEmail}
                  onChange={updateField('clientEmail')}
                  className="glass-input vendor-field-input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-phone`} className="vendor-field-label">Phone</label>
                <input
                  id={`${fieldPrefix}-phone`}
                  value={form.phone}
                  onChange={updateField('phone')}
                  className="glass-input vendor-field-input"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-mode`} className="vendor-field-label">Payment Mode</label>
                <select
                  id={`${fieldPrefix}-mode`}
                  value={form.paymentMode}
                  onChange={updateField('paymentMode')}
                  className="glass-input vendor-field-input"
                >
                  {PAYMENT_MODES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-issued`} className="vendor-field-label">Issued Date</label>
                <input
                  id={`${fieldPrefix}-issued`}
                  value={form.issuedDate}
                  onChange={updateField('issuedDate')}
                  className="glass-input vendor-field-input"
                  placeholder="Jul 15, 2026"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-inv-status`} className="vendor-field-label">Invoice Status</label>
                <select
                  id={`${fieldPrefix}-inv-status`}
                  value={form.invoiceStatus}
                  onChange={updateField('invoiceStatus')}
                  className="glass-input vendor-field-input"
                >
                  {INVOICE_STATUSES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-order-status`} className="vendor-field-label">Order Status</label>
                <select
                  id={`${fieldPrefix}-order-status`}
                  value={form.orderStatus}
                  onChange={updateField('orderStatus')}
                  className="glass-input vendor-field-input"
                >
                  {ORDER_STATUSES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
            </div>
            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">
              {isEdit ? 'Save Changes' : 'Add Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InvoiceViewModal({ open, onClose, invoice }) {
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

  if (!open || !invoice) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-invoice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-invoice-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Invoice</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Invoice ID</p>
              <p className="text-sm font-semibold text-emerald-400">{invoice.invoiceId}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total Amount</p>
              <p className="text-sm text-slate-200">{formatRupee(invoice.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Client</p>
              <p className="text-sm text-slate-200">{invoice.clientName}</p>
              <p className="text-xs text-slate-400">{invoice.clientEmail}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Phone</p>
              <p className="text-sm text-slate-200">{invoice.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment Mode</p>
              <p className="text-sm text-slate-200">{invoice.paymentMode}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Issued Date</p>
              <p className="text-sm text-slate-200">{invoice.issuedDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Invoice Status</p>
              <span className={`invoice-status-pill ${invoiceStatusClass(invoice.invoiceStatus)}`}>
                {String(invoice.invoiceStatus).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Order Status</p>
              <span className={`invoice-status-pill ${orderStatusClass(invoice.orderStatus)}`}>
                {String(invoice.orderStatus).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{invoice.created}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Updated</p>
              <p className="text-sm text-slate-300">{invoice.updated}</p>
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

export default function Invoices({ onNavigate }) {
  const [invoices, setInvoices] = useState(() => INVOICES_DATA.map((row) => ({ ...row })))
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [deletingInvoice, setDeletingInvoice] = useState(null)

  const filteredInvoices = useMemo(() => {
    const search = query.trim().toLowerCase()
    return invoices.filter((row) => (
      (!search
        || row.invoiceId.toLowerCase().includes(search)
        || row.clientName.toLowerCase().includes(search)
        || row.clientEmail.toLowerCase().includes(search)
        || row.phone.toLowerCase().includes(search))
      && (!statusFilter || row.invoiceStatus === statusFilter)
      && isWithinDateRange(row, startDate, endDate)
    ))
  }, [invoices, query, statusFilter, startDate, endDate])

  const allVisibleSelected = filteredInvoices.length > 0
    && filteredInvoices.every((row) => selectedIds.includes(row.id))

  const refresh = () => {
    setQuery('')
    setStatusFilter('')
    setStartDate('')
    setEndDate('')
    setSelectedIds([])
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingInvoice(null)
  }

  const openAddModal = () => {
    setEditingInvoice(null)
    setModalOpen(true)
  }

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice)
    setModalOpen(true)
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredInvoices.some((row) => row.id === id)))
      return
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...filteredInvoices.map((row) => row.id)]),
    ])
  }

  const toggleSelect = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    ))
  }

  const deleteInvoice = (id) => {
    setInvoices((current) => current.filter((row) => row.id !== id))
    setSelectedIds((current) => current.filter((value) => value !== id))
    setDeletingInvoice(null)
  }

  const addInvoice = (payload) => {
    const stamp = formatTimestamp()
    const token = Math.floor(100 + Math.random() * 900)
    setInvoices((current) => [
      {
        id: Date.now(),
        ...payload,
        invoiceId: payload.invoiceId || `5576-${token}`,
        created: stamp,
        updated: stamp,
      },
      ...current,
    ])
    closeModal()
  }

  const updateInvoice = (payload) => {
    const stamp = formatTimestamp()
    setInvoices((current) => current.map((row) => (
      row.id === payload.id
        ? { ...row, ...payload, invoiceId: payload.invoiceId || row.invoiceId, updated: stamp }
        : row
    )))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingInvoice) updateInvoice(payload)
    else addInvoice(payload)
  }

  const printInvoice = (invoice) => {
    const content = [
      `Invoice: ${invoice.invoiceId}`,
      `Client: ${invoice.clientName}`,
      `Email: ${invoice.clientEmail}`,
      `Phone: ${invoice.phone}`,
      `Total: ${formatRupee(invoice.totalAmount)}`,
      `Payment Mode: ${invoice.paymentMode}`,
      `Issued: ${invoice.issuedDate}`,
      `Invoice Status: ${invoice.invoiceStatus}`,
      `Order Status: ${invoice.orderStatus}`,
    ].join('\n')
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=640')
    if (!printWindow) return
    printWindow.document.write(`<pre style="font:14px/1.5 ui-sans-serif,system-ui">${content}</pre>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <section id="page-invoices" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Invoices</h2>
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
          <span>Invoices</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#c084fc' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Invoices List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search Invoices..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm sm:w-36"
              aria-label="Invoice status"
            >
              <option value="">Status</option>
              {INVOICE_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
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
              aria-label="Add invoice"
              onClick={openAddModal}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="vendors-table data-table invoices-table w-full min-w-[1500px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all invoices"
                  />
                </th>
                <th>S.No</th>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Phone</th>
                <th>Total Amount</th>
                <th>Payment Mode</th>
                <th>Issued Date</th>
                <th>Invoice Status</th>
                <th>Order Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-sm text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : filteredInvoices.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      aria-label={`Select ${row.invoiceId}`}
                    />
                  </td>
                  <td className="whitespace-nowrap text-slate-400">{index + 1}</td>
                  <td className="whitespace-nowrap font-semibold text-emerald-400">{row.invoiceId}</td>
                  <td className="min-w-[180px]">
                    <p className="font-medium text-slate-200">{row.clientName}</p>
                    <p className="text-xs uppercase text-slate-500">{row.clientEmail}</p>
                  </td>
                  <td className="whitespace-nowrap text-slate-300">{row.phone}</td>
                  <td className="whitespace-nowrap font-medium text-slate-200">{formatRupee(row.totalAmount)}</td>
                  <td className="whitespace-nowrap text-slate-400">{row.paymentMode}</td>
                  <td className="whitespace-nowrap text-slate-300">{row.issuedDate}</td>
                  <td className="whitespace-nowrap">
                    <span className={`invoice-status-pill ${invoiceStatusClass(row.invoiceStatus)}`}>
                      {String(row.invoiceStatus).toUpperCase()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className={`invoice-status-pill ${orderStatusClass(row.orderStatus)}`}>
                      {String(row.orderStatus).toUpperCase()}
                    </span>
                  </td>
                  <td className="min-w-[220px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="whitespace-nowrap"><span className="ts-badge ts-created">CREATED</span>{row.created}</div>
                      <div className="whitespace-nowrap"><span className="ts-badge ts-updated">UPDATED</span>{row.updated}</div>
                    </div>
                  </td>
                  <td className="min-w-[160px]">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${row.invoiceId}`}
                        onClick={() => setViewingInvoice(row)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Print ${row.invoiceId}`}
                        onClick={() => printInvoice(row)}
                      >
                        <Icon path={paths.print} />
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${row.invoiceId}`}
                        onClick={() => openEditModal(row)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${row.invoiceId}`}
                        onClick={() => setDeletingInvoice(row)}
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

      <InvoiceModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        invoice={editingInvoice}
      />
      <InvoiceViewModal
        open={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
      />
      <DeleteConfirmModal
        open={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={() => deleteInvoice(deletingInvoice.id)}
        itemName={deletingInvoice ? `${deletingInvoice.invoiceId} (${deletingInvoice.clientName})` : ''}
        title="Delete Item"
      />
    </section>
  )
}
