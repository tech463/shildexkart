import { useCallback, useEffect, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { STOCK_PAGE_TYPES } from '../data/stockInventory'
import {
  deleteProductAPI,
  fetchProductsAPI,
  updateProductInventoryAPI,
} from '../services/productService'

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
  check: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  trendDown: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22M2.25 18h1.5m16.5 0h1.5m-16.5 0v-1.5m16.5 1.5v-1.5',
  alert: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
  alertMark: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  emptyDoc: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
}

const STOCK_TABS = [
  { id: 'in-stock', label: 'In Stock' },
  { id: 'low-stock', label: 'Low Stock' },
  { id: 'out-of-stock', label: 'Out of Stock' },
]

const UNIT_OPTIONS = ['pcs', 'box', 'roll', 'day', 'kg', 'ltr']
const LOW_STOCK_MAX = 10

function formatRupee(value) {
  return `₹${(Number(value) || 0).toLocaleString('en-IN')}`
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

function formatApiDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : formatTimestamp(date)
}

function deriveStockType(stock) {
  const qty = Number(stock) || 0
  if (qty <= 0) return 'out-of-stock'
  if (qty <= LOW_STOCK_MAX) return 'low-stock'
  return 'in-stock'
}

function apiErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
}

function mapInventoryProduct(row) {
  if (!row) return null
  const stock = Number(row.stock_qty ?? row.stock ?? 0)
  const listPrice = Number(row.price ?? row.mrp ?? 0)
  const salePrice = Number(row.discounted_price ?? row.sale_price ?? 0)
  const selling = salePrice > 0 ? salePrice : listPrice

  return {
    id: row.id,
    name: row.title || row.name || '',
    imageUrl: row.cover_image || '',
    price: selling,
    mrp: listPrice,
    stock,
    unit: row.stock_unit || row.unit || 'pcs',
    stockType: deriveStockType(stock),
    stockStatus: row.stock_status || '',
    active: Boolean(row.is_active),
    sku: row.sku || '',
    created: formatApiDate(row.created_at),
    updated: formatApiDate(row.updated_at),
  }
}

function getStockFill(item) {
  if (item.stockType === 'out-of-stock' || item.stock <= 0) return 0
  if (item.stockType === 'low-stock') return Math.max(12, Math.min(40, (item.stock / 20) * 40))
  return Math.max(55, Math.min(100, (item.stock / 150) * 100))
}

function StockViewModal({ open, onClose, item }) {
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
        aria-labelledby="view-stock-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-stock-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Inventory</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="product-view-image">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span className="text-sm text-slate-500">No image</span>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Product</p>
              <p className="text-sm font-semibold text-slate-200">{item.name}</p>
              <p className="text-xs text-slate-500">ID: {item.id}</p>
              {item.sku ? <p className="text-xs text-slate-500">SKU: {item.sku}</p> : null}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-200">{formatRupee(item.price)}</p>
              <p className="text-xs text-slate-500 line-through">{formatRupee(item.mrp)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Stock</p>
              <p className="text-sm text-slate-300">{item.stock} {item.unit}</p>
              {item.stockStatus ? <p className="text-xs text-slate-500">{item.stockStatus}</p> : null}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <p className={`text-sm font-semibold ${item.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Timestamps</p>
              <p className="text-xs text-slate-400">Created: {item.created || '—'}</p>
              <p className="text-xs text-slate-400">Updated: {item.updated || '—'}</p>
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

function StockEditModal({ open, onClose, onSubmit, item, saving }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    mrp: '',
    stock: '',
    unit: 'pcs',
    active: 'Active',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (item) {
      setForm({
        name: item.name || '',
        price: String(item.price ?? ''),
        mrp: String(item.mrp ?? ''),
        stock: String(item.stock ?? ''),
        unit: item.unit || 'pcs',
        active: item.active ? 'Active' : 'Inactive',
      })
    }
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

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    if (!form.name.trim()) {
      setError('Please enter a product name.')
      return
    }
    if (form.price === '' || Number(form.price) < 0) {
      setError('Please enter a valid price.')
      return
    }
    if (form.mrp === '' || Number(form.mrp) < 0) {
      setError('Please enter a valid MRP.')
      return
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      setError('Please enter a valid stock quantity.')
      return
    }
    setError('')
    try {
      await onSubmit({
        id: item.id,
        name: form.name.trim(),
        price: Number(form.price) || 0,
        mrp: Number(form.mrp) || 0,
        stock: Number(form.stock) || 0,
        unit: form.unit,
        active: form.active === 'Active',
      })
    } catch (err) {
      setError(apiErrorMessage(err, 'Failed to update inventory.'))
    }
  }

  return (
    <div className="vendor-modal-overlay" onClick={saving ? undefined : onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-stock-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="edit-stock-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">Edit </span>
            <span className="vendor-modal-title-accent">Inventory</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose} disabled={saving}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div>
              <label htmlFor="edit-stock-name" className="vendor-field-label">Name</label>
              <input
                id="edit-stock-name"
                value={form.name}
                onChange={updateField('name')}
                className="glass-input vendor-field-input"
                autoFocus
                disabled={saving}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-stock-price" className="vendor-field-label">Price</label>
                <input
                  id="edit-stock-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={updateField('price')}
                  className="glass-input vendor-field-input"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="edit-stock-mrp" className="vendor-field-label">MRP</label>
                <input
                  id="edit-stock-mrp"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mrp}
                  onChange={updateField('mrp')}
                  className="glass-input vendor-field-input"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="edit-stock-qty" className="vendor-field-label">Stock</label>
                <input
                  id="edit-stock-qty"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={updateField('stock')}
                  className="glass-input vendor-field-input"
                  disabled={saving}
                />
              </div>
              <div>
                <label htmlFor="edit-stock-unit" className="vendor-field-label">Unit</label>
                <select
                  id="edit-stock-unit"
                  value={form.unit}
                  onChange={updateField('unit')}
                  className="glass-input vendor-field-input"
                  disabled={saving}
                >
                  {[...new Set([form.unit, ...UNIT_OPTIONS])].filter(Boolean).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="edit-stock-active" className="vendor-field-label">Status</label>
              <select
                id="edit-stock-active"
                value={form.active}
                onChange={updateField('active')}
                className="glass-input vendor-field-input"
                disabled={saving}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StockInventoryPage({ stockType = 'in-stock', onNavigate }) {
  const config = STOCK_PAGE_TYPES[stockType] || STOCK_PAGE_TYPES['in-stock']
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [viewingItem, setViewingItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const timer = setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 3000)
    return () => clearTimeout(timer)
  }, [toastSuccess, toastError])

  const loadInventory = useCallback(async (overrides = {}) => {
    const searchValue = overrides.query !== undefined ? overrides.query : debouncedQuery
    const fromValue = overrides.startDate !== undefined ? overrides.startDate : startDate
    const toValue = overrides.endDate !== undefined ? overrides.endDate : endDate
    const bandValue = overrides.stockType || stockType

    setLoading(true)
    setToastError('')
    try {
      const params = {
        page: 1,
        limit: 100,
        stock_band: bandValue,
        low_stock_max: LOW_STOCK_MAX,
        sort: 'stock-desc',
      }
      const search = String(searchValue || '').trim()
      if (search) params.search = search
      if (fromValue) params.date_from = fromValue
      if (toValue) params.date_to = toValue

      const res = await fetchProductsAPI(params)
      const rows = Array.isArray(res?.data) ? res.data : []
      setItems(rows.map(mapInventoryProduct).filter(Boolean))
    } catch (err) {
      setItems([])
      setToastError(apiErrorMessage(err, 'Failed to load inventory.'))
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, startDate, endDate, stockType])

  useEffect(() => {
    setQuery('')
    setDebouncedQuery('')
    setStartDate('')
    setEndDate('')
    setViewingItem(null)
    setEditingItem(null)
    setDeletingItem(null)
  }, [stockType])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const refresh = () => {
    setQuery('')
    setDebouncedQuery('')
    setStartDate('')
    setEndDate('')
    loadInventory({ query: '', startDate: '', endDate: '' })
  }

  const updateItem = async (payload) => {
    setSaving(true)
    setToastError('')
    try {
      const res = await updateProductInventoryAPI(payload.id, {
        title: payload.name,
        price: payload.mrp,
        discounted_price: payload.price,
        stock_qty: payload.stock,
        stock_unit: payload.unit,
        is_active: payload.active,
      })

      const mapped = mapInventoryProduct(res?.data)
      if (mapped) {
        // Item may move to another stock band after qty change
        if (mapped.stockType === stockType) {
          setItems((current) => current.map((item) => (item.id === mapped.id ? mapped : item)))
        } else {
          setItems((current) => current.filter((item) => item.id !== mapped.id))
        }
      } else {
        await loadInventory()
      }

      setEditingItem(null)
      setToastSuccess(res?.message || 'Inventory updated.')
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id) => {
    if (!id || deletingId) return
    setDeletingId(id)
    setToastError('')
    try {
      const res = await deleteProductAPI(id)
      setItems((current) => current.filter((item) => item.id !== id))
      setDeletingItem(null)
      setToastSuccess(res?.message || 'Product deleted.')
    } catch (err) {
      setToastError(apiErrorMessage(err, 'Failed to delete product.'))
    } finally {
      setDeletingId(null)
    }
  }

  const profileIcon = config.tone === 'warning'
    ? paths.trendDown
    : config.tone === 'danger'
      ? paths.alertMark
      : paths.check

  return (
    <section id={`page-${stockType}`} className="page-view">
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

      <div className={`stock-profile-card stock-profile-${config.tone} mb-5`} style={{ '--accent': config.accent }}>
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="stock-profile-icon" aria-hidden="true">
            <Icon path={profileIcon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <span className="stock-profile-badge">{config.profileLabel}</span>
            <p className="mt-2 text-sm text-slate-300">{config.profileCopy}</p>
          </div>
        </div>
        <div className="stock-segmented" role="tablist" aria-label="Stock status">
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === stockType}
              className={`stock-segment${tab.id === stockType ? ' active' : ''}`}
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
                placeholder="Search products by title..."
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
              disabled={loading}
            >
              <Icon path={paths.refresh} />
            </button>
          </div>
        </div>

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product Details</th>
                <th>Pricing</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14">
                    <div className="stock-empty-state">
                      <span className="stock-empty-icon" aria-hidden="true">
                        <Icon path={paths.emptyDoc} className="h-8 w-8" />
                      </span>
                      <p className="stock-empty-title">{toastError ? 'Could not load inventory.' : config.emptyTitle}</p>
                      <p className="stock-empty-hint">{config.emptyHint}</p>
                    </div>
                  </td>
                </tr>
              ) : items.map((item, index) => {
                const fill = getStockFill(item)
                return (
                  <tr key={item.id}>
                    <td className="text-slate-400">{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="product-thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">N/A</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <p className="text-xs text-slate-500">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">{formatRupee(item.price)}</p>
                        <p className="text-xs text-slate-500 line-through">{formatRupee(item.mrp)}</p>
                      </div>
                    </td>
                    <td className="min-w-[140px]">
                      <p className="mb-1.5 text-sm text-slate-300">
                        {item.stock} {item.unit}
                      </p>
                      <div className={`stock-level-track stock-level-${config.tone}`}>
                        <span className="stock-level-fill" style={{ width: `${fill}%` }} />
                      </div>
                    </td>
                    <td>
                      <span className={`stock-active-pill${item.active ? '' : ' is-inactive'}`}>
                        <span className="stock-active-dot" aria-hidden="true" />
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="min-w-[200px]">
                      <div className="space-y-1 text-xs text-slate-400">
                        <div><span className="ts-badge ts-created">CREATED</span>{item.created}</div>
                        <div><span className="ts-badge ts-updated">UPDATED</span>{item.updated}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="action-btn"
                          aria-label={`View ${item.name}`}
                          onClick={() => setViewingItem(item)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                            <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => setEditingItem(item)}
                        >
                          <Icon path={paths.edit} />
                        </button>
                        <button
                          type="button"
                          className="action-btn action-btn-danger"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => setDeletingItem(item)}
                          disabled={deletingId === item.id}
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

      <StockViewModal
        open={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
      />
      <StockEditModal
        open={Boolean(editingItem)}
        onClose={() => (!saving ? setEditingItem(null) : null)}
        onSubmit={updateItem}
        item={editingItem}
        saving={saving}
      />
      <DeleteConfirmModal
        open={Boolean(deletingItem)}
        onClose={() => (!deletingId ? setDeletingItem(null) : null)}
        onConfirm={() => deleteItem(deletingItem.id)}
        itemName={deletingItem?.name || ''}
        title="Delete Item"
      />
    </section>
  )
}
