import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  ORDER_STATUSES,
  ORDERS_DATA,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '../data/orders'

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
  filter: 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.03L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  print: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

const emptyForm = {
  customer: '',
  addressName: '',
  addressLine: '',
  phone: '',
  itemSummary: '',
  itemCount: '1',
  itemQty: '1',
  paymentMethod: 'COD',
  paymentStatus: 'Pending',
  price: '',
  lastStatus: 'Pending',
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

function formatRupee(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function parseOrderDate(value) {
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

function isWithinDateRange(order, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseOrderDate(order.created)
  const updated = parseOrderDate(order.updated)
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
  if (key === 'delivered' || key === 'paid') return 'success'
  if (key === 'pending' || key === 'processing') return 'warning'
  if (key === 'cancelled' || key === 'failed') return 'danger'
  if (key === 'cod' || key === 'upi' || key === 'card' || key === 'wallet') return 'info'
  return 'neutral'
}

function StatusBadge({ value, className = '' }) {
  return (
    <span className={`order-badge order-badge-${statusTone(value)} ${className}`.trim()}>
      {String(value || '').toUpperCase()}
    </span>
  )
}

function OrderModal({ open, onClose, onSubmit, order = null }) {
  const isEdit = Boolean(order)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (order) {
      setForm({
        customer: order.customer || '',
        addressName: order.addressName || order.customer || '',
        addressLine: order.addressLine || '',
        phone: order.phone || '',
        itemSummary: order.itemSummary || '',
        itemCount: String(order.itemCount ?? 1),
        itemQty: String(order.itemQty ?? 1),
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: order.paymentStatus || 'Pending',
        price: String(order.price ?? ''),
        lastStatus: order.lastStatus || 'Pending',
      })
    } else {
      setForm(emptyForm)
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
  }, [open, onClose, order])

  if (!open) return null

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.customer.trim() || !form.addressLine.trim() || !form.phone.trim()) {
      setError('Please fill in customer, address, and phone.')
      return
    }
    if (!form.price || Number(form.price) < 0) {
      setError('Please enter a valid price.')
      return
    }
    onSubmit({
      id: order?.id,
      orderId: order?.orderId,
      customer: form.customer.trim(),
      addressName: form.addressName.trim() || form.customer.trim(),
      addressLine: form.addressLine.trim(),
      phone: form.phone.trim(),
      itemSummary: form.itemSummary.trim() || 'Custom item x 1',
      itemCount: Number(form.itemCount) || 1,
      itemQty: Number(form.itemQty) || 1,
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      price: Number(form.price) || 0,
      lastStatus: form.lastStatus,
    })
  }

  const fieldPrefix = isEdit ? 'edit-order' : 'add-order'

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
            <span className="vendor-modal-title-accent">Order</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor={`${fieldPrefix}-customer`} className="vendor-field-label">Customer</label>
                <input id={`${fieldPrefix}-customer`} value={form.customer} onChange={updateField('customer')} className="glass-input vendor-field-input" autoFocus />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-phone`} className="vendor-field-label">Phone</label>
                <input id={`${fieldPrefix}-phone`} value={form.phone} onChange={updateField('phone')} className="glass-input vendor-field-input" />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-price`} className="vendor-field-label">Price</label>
                <input id={`${fieldPrefix}-price`} type="number" min="0" step="0.01" value={form.price} onChange={updateField('price')} className="glass-input vendor-field-input" />
              </div>
              <div className="md:col-span-3">
                <label htmlFor={`${fieldPrefix}-address`} className="vendor-field-label">Address</label>
                <input id={`${fieldPrefix}-address`} value={form.addressLine} onChange={updateField('addressLine')} className="glass-input vendor-field-input" placeholder="Street, city, state, pincode" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`${fieldPrefix}-items`} className="vendor-field-label">Items Summary</label>
                <input id={`${fieldPrefix}-items`} value={form.itemSummary} onChange={updateField('itemSummary')} className="glass-input vendor-field-input" placeholder="Product (variant) x qty" />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-qty`} className="vendor-field-label">Qty</label>
                <input id={`${fieldPrefix}-qty`} type="number" min="1" value={form.itemQty} onChange={updateField('itemQty')} className="glass-input vendor-field-input" />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-method`} className="vendor-field-label">Payment Method</label>
                <select id={`${fieldPrefix}-method`} value={form.paymentMethod} onChange={updateField('paymentMethod')} className="glass-input vendor-field-input">
                  {PAYMENT_METHODS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-pay-status`} className="vendor-field-label">Payment Status</label>
                <select id={`${fieldPrefix}-pay-status`} value={form.paymentStatus} onChange={updateField('paymentStatus')} className="glass-input vendor-field-input">
                  {PAYMENT_STATUSES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-status`} className="vendor-field-label">Last Status</label>
                <select id={`${fieldPrefix}-status`} value={form.lastStatus} onChange={updateField('lastStatus')} className="glass-input vendor-field-input">
                  {ORDER_STATUSES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
            </div>
            {error ? <p className="vendor-form-error mt-4">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">
              {isEdit ? 'Save Changes' : 'Add Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderViewModal({ open, onClose, order }) {
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

  if (!open || !order) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-order-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-order-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Order</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-slate-100">{order.orderId}</p>
            <StatusBadge value={order.lastStatus} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Customer</p>
              <p className="text-sm text-slate-200">{order.customer}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-200">{formatRupee(order.price)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Address</p>
              <p className="text-sm text-slate-300">{order.addressName}</p>
              <p className="text-xs text-slate-400">{order.addressLine}</p>
              <p className="text-xs text-slate-400">{order.phone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Items</p>
              <p className="text-sm text-slate-300">
                {order.itemCount} Item{order.itemCount === 1 ? '' : 's'} ({order.itemQty} QTY)
              </p>
              <p className="text-xs text-slate-400">{order.itemSummary}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <StatusBadge value={order.paymentMethod} />
              <StatusBadge value={order.paymentStatus} />
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

export default function Orders({ onNavigate }) {
  const [orders, setOrders] = useState(() => ORDERS_DATA.map((order) => ({ ...order })))
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [deletingOrder, setDeletingOrder] = useState(null)

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase()
    return orders.filter((order) => (
      (!search
        || order.orderId.toLowerCase().includes(search)
        || order.customer.toLowerCase().includes(search)
        || order.phone.toLowerCase().includes(search)
        || order.itemSummary.toLowerCase().includes(search)
        || order.addressLine.toLowerCase().includes(search))
      && (!statusFilter || order.lastStatus === statusFilter)
      && (!paymentFilter || order.paymentMethod === paymentFilter)
      && isWithinDateRange(order, startDate, endDate)
    ))
  }, [orders, query, statusFilter, paymentFilter, startDate, endDate])

  const refresh = () => {
    setQuery('')
    setStartDate('')
    setEndDate('')
    setStatusFilter('')
    setPaymentFilter('')
    setFilterOpen(false)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingOrder(null)
  }

  const openAddModal = () => {
    setEditingOrder(null)
    setModalOpen(true)
  }

  const openEditModal = (order) => {
    setEditingOrder(order)
    setModalOpen(true)
  }

  const deleteOrder = (id) => {
    setOrders((current) => current.filter((order) => order.id !== id))
    setDeletingOrder(null)
  }

  const addOrder = (payload) => {
    const stamp = formatTimestamp()
    const token = Math.random().toString(36).slice(2, 6).toUpperCase()
    setOrders((current) => [
      {
        id: Date.now(),
        orderId: `#ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${token}`,
        ...payload,
        created: stamp,
        updated: stamp,
      },
      ...current,
    ])
    closeModal()
  }

  const updateOrder = (payload) => {
    const stamp = formatTimestamp()
    setOrders((current) => current.map((order) => (
      order.id === payload.id
        ? {
          ...order,
          ...payload,
          orderId: order.orderId,
          updated: stamp,
        }
        : order
    )))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingOrder) updateOrder(payload)
    else addOrder(payload)
  }

  const printOrder = (order) => {
    const content = [
      `Order: ${order.orderId}`,
      `Customer: ${order.customer}`,
      `Phone: ${order.phone}`,
      `Address: ${order.addressLine}`,
      `Items: ${order.itemSummary}`,
      `Payment: ${order.paymentMethod} / ${order.paymentStatus}`,
      `Total: ${formatRupee(order.price)}`,
      `Status: ${order.lastStatus}`,
    ].join('\n')
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=640')
    if (!printWindow) return
    printWindow.document.write(`<pre style="font:14px/1.5 ui-sans-serif,system-ui">${content}</pre>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <section id="page-orders" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Orders</h2>
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
          <span>Orders</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#a78bfa' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Orders List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Universal search..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                className={`order-filter-btn${filterOpen || statusFilter || paymentFilter ? ' active' : ''}`}
                onClick={() => setFilterOpen((value) => !value)}
              >
                <Icon path={paths.filter} className="h-4 w-4" />
                Filter
              </button>
              {filterOpen ? (
                <div className="order-filter-panel">
                  <label className="vendor-field-label" htmlFor="order-status-filter">Last Status</label>
                  <select
                    id="order-status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="glass-input vendor-field-input mb-3"
                  >
                    <option value="">All</option>
                    {ORDER_STATUSES.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <label className="vendor-field-label" htmlFor="order-payment-filter">Payment Method</label>
                  <select
                    id="order-payment-filter"
                    value={paymentFilter}
                    onChange={(event) => setPaymentFilter(event.target.value)}
                    className="glass-input vendor-field-input"
                  >
                    <option value="">All</option>
                    {PAYMENT_METHODS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
              ) : null}
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
            <button
              type="button"
              className="btn-add"
              aria-label="Add order"
              onClick={openAddModal}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1400px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="rounded border-white/20 bg-white/5" /></th>
                <th>S.No</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Price</th>
                <th>Last Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-sm text-slate-400">
                    No orders found for the selected filters.
                  </td>
                </tr>
              ) : filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                  <td className="text-slate-400">{index + 1}</td>
                  <td className="font-semibold text-slate-100">{order.orderId}</td>
                  <td className="font-medium text-slate-200">{order.customer}</td>
                  <td className="min-w-[220px]">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-200">{order.addressName}</p>
                      <p className="text-xs text-slate-400">{order.addressLine}</p>
                      <p className="text-xs text-slate-500">{order.phone}</p>
                    </div>
                  </td>
                  <td className="min-w-[180px]">
                    <p className="text-sm text-slate-200">
                      {order.itemCount} Item{order.itemCount === 1 ? '' : 's'} ({order.itemQty} QTY)
                    </p>
                    <p className="max-w-[220px] truncate text-xs text-slate-400" title={order.itemSummary}>
                      {order.itemSummary}
                    </p>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge value={order.paymentMethod} />
                      <StatusBadge value={order.paymentStatus} />
                    </div>
                  </td>
                  <td className="font-semibold text-slate-100">{formatRupee(order.price)}</td>
                  <td><StatusBadge value={order.lastStatus} /></td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{order.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{order.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${order.orderId}`}
                        onClick={() => setViewingOrder(order)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${order.orderId}`}
                        onClick={() => openEditModal(order)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Print ${order.orderId}`}
                        onClick={() => printOrder(order)}
                      >
                        <Icon path={paths.print} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${order.orderId}`}
                        onClick={() => setDeletingOrder(order)}
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

      <OrderModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        order={editingOrder}
      />
      <OrderViewModal
        open={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
      />
      <DeleteConfirmModal
        open={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={() => deleteOrder(deletingOrder.id)}
        itemName={deletingOrder?.orderId || ''}
        title="Delete Item"
      />
    </section>
  )
}
