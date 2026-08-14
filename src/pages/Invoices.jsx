import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  deleteInvoiceAPI,
  errMsg,
  fetchInvoiceByIdAPI,
  fetchInvoicesAPI,
  syncInvoicesAPI,
  updateInvoiceAPI,
} from '../services/invoiceService'

const INVOICE_STATUSES = ['Unpaid', 'Paid', 'Partial', 'Cancelled']

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
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  print: 'M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z',
}

function formatRupee(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '₹ 0'
  return `₹ ${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  if (key.includes('delivered')) return 'invoice-order-delivered'
  if (key.includes('processing') || key.includes('shipped') || key.includes('packed')) return 'invoice-order-processing'
  if (key.includes('cancelled')) return 'invoice-order-cancelled'
  return 'invoice-order-pending'
}

function InvoiceViewModal({ open, onClose, invoice, onNavigateOrder, onNavigatePayment }) {
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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 className="vendor-modal-title">
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
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Order</p>
              <button type="button" className="text-sm font-semibold text-sky-400 hover:underline" onClick={onNavigateOrder}>
                {invoice.order_number || `Order #${invoice.order_id}`}
              </button>
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
              <button type="button" className="text-sm text-sky-400 hover:underline" onClick={onNavigatePayment}>
                {invoice.paymentMode}
              </button>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total Amount</p>
              <p className="text-sm text-slate-200">{formatRupee(invoice.totalAmount)}</p>
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
          </div>

          {(invoice.items || []).length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Line items</p>
              <div className="space-y-2 text-sm text-slate-300">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>{item.product_title} ×{item.qty}</span>
                    <span>{formatRupee(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="vendor-modal-footer flex flex-wrap gap-2">
          <button type="button" onClick={onNavigateOrder} className="vendor-btn-cancel flex-1">Open Order</button>
          <button type="button" onClick={onNavigatePayment} className="vendor-btn-cancel flex-1">Open Payment</button>
          <button type="button" onClick={onClose} className="vendor-btn-cancel flex-1">Close</button>
        </div>
      </div>
    </div>
  )
}

function InvoiceEditModal({ open, onClose, invoice, onSubmit, saving }) {
  const [status, setStatus] = useState('Unpaid')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !invoice) return
    setStatus(invoice.invoiceStatus || 'Unpaid')
    setNotes(invoice.notes || '')
    setError('')
  }, [open, invoice])

  if (!open || !invoice) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div className="vendor-modal vendor-modal-category glass-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="vendor-modal-header">
          <h3 className="vendor-modal-title">
            <span className="vendor-modal-title-muted">Edit </span>
            <span className="vendor-modal-title-accent">Invoice</span>
          </h3>
          <button type="button" className="action-btn" onClick={onClose} aria-label="Close"><Icon path={paths.close} /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ status: String(status).toLowerCase(), notes })
          }}
        >
          <div className="vendor-modal-body space-y-4">
            <p className="text-sm text-slate-400">
              Invoice <span className="font-semibold text-emerald-400">{invoice.invoiceId}</span> is linked to order{' '}
              <span className="text-sky-400">{invoice.order_number}</span>. Amounts come from the order.
            </p>
            <label className="vendor-field-label">
              Invoice status
              <select className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                {INVOICE_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="vendor-field-label">
              Notes
              <textarea
                className="glass-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer flex gap-2">
            <button type="button" onClick={onClose} className="vendor-btn-cancel flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-add btn-add-text flex-1 justify-center">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Invoices({ onNavigate }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [deletingInvoice, setDeletingInvoice] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchInvoicesAPI({
        page: 1,
        limit: 100,
        search: query.trim() || undefined,
        status: statusFilter ? statusFilter.toLowerCase() : undefined,
        date_from: startDate || undefined,
        date_to: endDate || undefined,
      })
      setInvoices(res?.data || [])
    } catch (err) {
      setError(errMsg(err, 'Failed to load invoices.'))
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [query, statusFilter, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId')
    const orderId = searchParams.get('orderId')
    if (!invoiceId && !orderId) return
    ;(async () => {
      try {
        if (invoiceId) {
          const res = await fetchInvoiceByIdAPI(invoiceId)
          if (res?.data) setViewingInvoice(res.data)
          return
        }
        if (orderId) {
          const res = await fetchInvoicesAPI({ order_id: orderId, limit: 1 })
          if (res?.data?.[0]) setViewingInvoice(res.data[0])
        }
      } catch (err) {
        setError(errMsg(err, 'Invoice not found.'))
      }
    })()
  }, [searchParams])

  const filteredInvoices = useMemo(() => invoices, [invoices])

  const allVisibleSelected = filteredInvoices.length > 0
    && filteredInvoices.every((row) => selectedIds.includes(row.id))

  const goOrder = (invoice) => {
    if (!invoice?.order_id) return
    navigate(`/orders?orderId=${invoice.order_id}`)
  }

  const goPayment = (invoice) => {
    if (!invoice?.order_id) return
    navigate(`/payments/all?orderId=${invoice.order_id}`)
  }

  const printInvoice = (invoice) => {
    const rows = [
      ['Invoice', invoice.invoiceId],
      ['Order', invoice.order_number || invoice.order_id],
      ['Client', invoice.clientName],
      ['Email', invoice.clientEmail],
      ['Phone', invoice.phone],
      ['Payment Mode', invoice.paymentMode],
      ['Issued', invoice.issuedDate],
      ['Invoice Status', invoice.invoiceStatus],
      ['Order Status', invoice.orderStatus],
    ]

    const itemRows = (invoice.items || []).map((item) => `
      <tr>
        <td>${escapeHtml(item.product_title)}</td>
        <td class="num">${escapeHtml(item.qty)}</td>
        <td class="num">${escapeHtml(formatRupee(item.line_total))}</td>
      </tr>`).join('')

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(invoice.invoiceId || 'Invoice')}</title>
    <style>
      body { font: 14px/1.6 ui-sans-serif, system-ui, sans-serif; color: #111; margin: 32px; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .muted { color: #666; font-size: 12px; margin: 0 0 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #ddd; }
      th { background: #f4f4f5; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
      td.num, th.num { text-align: right; }
      .meta td:first-child { width: 180px; color: #666; }
      .total { font-size: 16px; font-weight: 700; text-align: right; }
      @media print { body { margin: 12px; } }
    </style>
  </head>
  <body>
    <h1>Invoice ${escapeHtml(invoice.invoiceId || '')}</h1>
    <p class="muted">ShieldX Ecommerce</p>

    <table class="meta">
      ${rows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value ?? '-')}</td></tr>`).join('')}
    </table>

    ${itemRows ? `
    <table>
      <thead>
        <tr><th>Item</th><th class="num">Qty</th><th class="num">Amount</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>` : ''}

    <p class="total">Total: ${escapeHtml(formatRupee(invoice.totalAmount))}</p>

    <script>
      setTimeout(function () {
        window.focus()
        window.print()
      }, 200)
    <\/script>
  </body>
</html>`

    const printWindow = window.open('', '_blank', 'width=820,height=720')
    if (!printWindow) {
      setError('Please allow pop-ups for this site to print the invoice.')
      return
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleSync = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await syncInvoicesAPI()
      setMessage(res.message || 'Invoices synced from orders.')
      await load()
    } catch (err) {
      setError(errMsg(err, 'Sync failed.'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (payload) => {
    if (!editingInvoice) return
    setSaving(true)
    try {
      const res = await updateInvoiceAPI(editingInvoice.id, payload)
      setMessage(res.message || 'Invoice updated.')
      setEditingInvoice(null)
      await load()
    } catch (err) {
      setError(errMsg(err, 'Update failed.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingInvoice) return
    setSaving(true)
    try {
      await deleteInvoiceAPI(deletingInvoice.id)
      setMessage('Invoice deleted.')
      setDeletingInvoice(null)
      setSelectedIds((ids) => ids.filter((id) => id !== deletingInvoice.id))
      await load()
    } catch (err) {
      setError(errMsg(err, 'Delete failed.'))
    } finally {
      setSaving(false)
    }
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

      {error ? <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div> : null}

      <div className="neo-card glass-card p-5" style={{ '--accent': '#c084fc' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide text-shield">Invoices List</h3>
            <p className="mt-1 text-xs text-slate-500">Auto-linked to Orders and Payments. Sync keeps invoices up to date.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <div className="relative w-full sm:w-auto">
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
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="glass-input date-filter-input rounded-xl px-3 py-2 text-sm sm:w-40"
              aria-label="Start date"
            />
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="glass-input date-filter-input rounded-xl px-3 py-2 text-sm sm:w-40"
              aria-label="End date"
            />
            <button type="button" onClick={load} className="btn-glass flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" aria-label="Refresh">
              <Icon path={paths.refresh} />
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSync}
              className="btn-add btn-add-text btn-add-full"
              title="Create/update invoices from existing orders"
            >
              <Icon path={paths.refresh} />
              <span>{saving ? 'Syncing...' : 'Sync from Orders'}</span>
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
                    onChange={() => {
                      if (allVisibleSelected) {
                        setSelectedIds((current) => current.filter((id) => !filteredInvoices.some((row) => row.id === id)))
                        return
                      }
                      setSelectedIds((current) => [...new Set([...current, ...filteredInvoices.map((row) => row.id)])])
                    }}
                    aria-label="Select all invoices"
                  />
                </th>
                <th>S.No</th>
                <th>Invoice ID</th>
                <th>Order</th>
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
              {loading ? (
                <tr><td colSpan={13} className="py-10 text-center text-sm text-slate-500">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-sm text-slate-500">
                    No invoices yet. Place an order or click Sync from Orders.
                  </td>
                </tr>
              ) : filteredInvoices.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => setSelectedIds((current) => (
                        current.includes(row.id) ? current.filter((value) => value !== row.id) : [...current, row.id]
                      ))}
                      aria-label={`Select ${row.invoiceId}`}
                    />
                  </td>
                  <td className="whitespace-nowrap text-slate-400">{index + 1}</td>
                  <td className="whitespace-nowrap">
                    <button
                      type="button"
                      className="font-semibold text-emerald-400 hover:underline"
                      onClick={() => {
                        setViewingInvoice(row)
                        setSearchParams({ invoiceId: String(row.id) })
                      }}
                    >
                      {row.invoiceId}
                    </button>
                  </td>
                  <td className="whitespace-nowrap">
                    <Link to={`/orders?orderId=${row.order_id}`} className="font-semibold text-sky-400 hover:underline">
                      {row.order_number || `#${row.order_id}`}
                    </Link>
                  </td>
                  <td className="min-w-[180px]">
                    <p className="font-medium text-slate-200">{row.clientName}</p>
                    <p className="text-xs uppercase text-slate-500">{row.clientEmail}</p>
                  </td>
                  <td className="whitespace-nowrap text-slate-300">{row.phone}</td>
                  <td className="whitespace-nowrap font-medium text-slate-200">{formatRupee(row.totalAmount)}</td>
                  <td className="whitespace-nowrap">
                    <Link to={`/payments/all?orderId=${row.order_id}`} className="text-slate-300 hover:text-sky-400 hover:underline">
                      {row.paymentMode}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap text-slate-300">{row.issuedDate}</td>
                  <td className="whitespace-nowrap">
                    <span className={`invoice-status-pill ${invoiceStatusClass(row.invoiceStatus)}`}>
                      {String(row.invoiceStatus).toUpperCase()}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    <Link to={`/orders?orderId=${row.order_id}`} className={`invoice-status-pill ${orderStatusClass(row.orderStatus)}`}>
                      {String(row.orderStatus).toUpperCase()}
                    </Link>
                  </td>
                  <td className="min-w-[220px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="whitespace-nowrap"><span className="ts-badge ts-created">CREATED</span>{row.created}</div>
                      <div className="whitespace-nowrap"><span className="ts-badge ts-updated">UPDATED</span>{row.updated}</div>
                    </div>
                  </td>
                  <td className="min-w-[160px]">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <button type="button" className="action-btn" aria-label={`View ${row.invoiceId}`} onClick={() => setViewingInvoice(row)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button type="button" className="action-btn" aria-label={`Print ${row.invoiceId}`} onClick={() => printInvoice(row)}>
                        <Icon path={paths.print} />
                      </button>
                      <button type="button" className="action-btn" aria-label={`Edit ${row.invoiceId}`} onClick={() => setEditingInvoice(row)}>
                        <Icon path={paths.edit} />
                      </button>
                      <button type="button" className="action-btn action-btn-danger" aria-label={`Delete ${row.invoiceId}`} onClick={() => setDeletingInvoice(row)}>
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

      <InvoiceViewModal
        open={Boolean(viewingInvoice)}
        onClose={() => {
          setViewingInvoice(null)
          if (searchParams.get('invoiceId')) {
            searchParams.delete('invoiceId')
            setSearchParams(searchParams)
          }
        }}
        invoice={viewingInvoice}
        onNavigateOrder={() => goOrder(viewingInvoice)}
        onNavigatePayment={() => goPayment(viewingInvoice)}
      />
      <InvoiceEditModal
        open={Boolean(editingInvoice)}
        onClose={() => setEditingInvoice(null)}
        invoice={editingInvoice}
        onSubmit={handleUpdate}
        saving={saving}
      />
      <DeleteConfirmModal
        open={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={handleDelete}
        itemName={deletingInvoice ? `${deletingInvoice.invoiceId} (${deletingInvoice.clientName})` : ''}
        title="Delete Invoice"
      />
    </section>
  )
}
