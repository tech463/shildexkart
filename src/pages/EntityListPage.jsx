import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import MainCategoryModal from '../components/MainCategoryModal'
import { useRowSelection } from '../hooks/useRowSelection'
import TablePagination from '../components/TablePagination'
import usePagination from '../hooks/usePagination'
import { PAGE_CONFIGS } from '../data/pages'
import {
  createMainCategory,
  deleteMainCategory,
  fetchMainCategories,
  toggleMainCategoryStatus,
  updateMainCategory,
} from '../store/slices/mainCategorySlice'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  toggleCategoryStatus,
  updateCategory,
} from '../store/slices/categorySlice'
import {
  createSubCategory,
  deleteSubCategory,
  fetchSubCategories,
  toggleSubCategoryStatus,
  updateSubCategory,
} from '../store/slices/subCategorySlice'
import {
  createUnit,
  deleteUnit,
  fetchUnits,
  toggleUnitStatus,
  updateUnit,
} from '../store/slices/unitSlice'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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
}

const COLUMN_LABELS = {
  name: 'Name',
  slug: 'Slug',
  items: 'Items',
  parent: 'Parent',
  products: 'Products',
  country: 'Country',
  symbol: 'Symbol',
  type: 'Type',
  color: 'Color',
  position: 'Position',
  clicks: 'Clicks',
  category: 'Category',
  price: 'Price',
  stock: 'Stock',
  sku: 'SKU',
  orderId: 'Order ID',
  amount: 'Amount',
  orderStatus: 'Order Status',
  txnId: 'Txn ID',
  method: 'Method',
  city: 'City',
  invoiceNo: 'Invoice No',
  discount: 'Discount',
  usage: 'Usage',
  channel: 'Channel',
  audience: 'Audience',
  value: 'Value',
  visibility: 'Visibility',
  statusLabel: 'Status',
  scope: 'Scope',
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

function parseDate(value) {
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
  const created = parseDate(row.created)
  const updated = parseDate(row.updated)
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

function EntityModal({ open, onClose, onSubmit, config, item = null }) {
  const isEdit = Boolean(item)
  const extraColumns = (config?.columns || []).filter((column) => column !== 'name')
  const [fields, setFields] = useState({})
  const [active, setActive] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const nextFields = { name: item?.name || '' }
    extraColumns.forEach((column) => {
      const value = item?.[column]
      nextFields[column] = value == null ? '' : String(value)
    })
    setFields(nextFields)
    setActive(item ? Boolean(item.active) : true)
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
  }, [open, onClose, item, config])

  if (!open) return null

  const setField = (key, value) => {
    setFields((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!String(fields.name || '').trim()) {
      setError(`Please enter a ${config.nameLabel.toLowerCase()}.`)
      return
    }

    // Units page ke liye extra required validation
    // (Backend "Unit Name and Symbol are required." type error bhej raha hai.)
    if (config?.entityLabel === 'Unit') {
      const symbolRaw = fields?.symbol
      const typeRaw = fields?.type
      if (!String(symbolRaw ?? '').trim()) {
        setError('Please enter symbol.')
        return
      }
      if (!String(typeRaw ?? '').trim()) {
        setError('Please enter type.')
        return
      }
    }

    const payload = {
      id: item?.id,
      name: String(fields.name || '').trim(),
      active,
      fields: {},
    }
    extraColumns.forEach((column) => {
      const raw = fields[column]
      const templateValue = item?.[column] ?? config.rows?.[0]?.[column]
      if (typeof templateValue === 'number') {
        const parsed = Number(raw)
        payload.fields[column] = Number.isFinite(parsed) ? parsed : 0
      } else {
        const cleaned = String(raw ?? '').trim()
        if (config?.entityLabel === 'Unit') {
          payload.fields[column] = cleaned // Units me empty ko '' bhejenge; slice validation reject karega
        } else {
          payload.fields[column] = cleaned || '—'
        }
      }
    })
    onSubmit(payload)
  }

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div className="vendor-modal glass-card p-6" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold tracking-wide text-shield">
              {isEdit ? 'Edit' : 'Add'} {config.entityLabel}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {isEdit ? `Update this ${config.entityLabel.toLowerCase()} entry.` : `Create a new ${config.entityLabel.toLowerCase()} entry.`}
            </p>
          </div>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">{config.nameLabel}</label>
            <input
              type="text"
              value={fields.name || ''}
              onChange={(event) => setField('name', event.target.value)}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
              placeholder={`Enter ${config.nameLabel.toLowerCase()}`}
              autoFocus
            />
          </div>
          {extraColumns.map((column) => (
            <div key={column}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                {COLUMN_LABELS[column] || column}
              </label>
              <input
                type="text"
                value={fields[column] || ''}
                onChange={(event) => setField(column, event.target.value)}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
                placeholder={`Enter ${COLUMN_LABELS[column] || column}`}
              />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Active status</p>
              <p className="text-xs text-slate-400">Inactive items are hidden from storefronts.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
          {error ? <p className="vendor-form-error mt-3">{error}</p> : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</button>
            <button type="submit" className="btn-glass rounded-xl px-4 py-2 text-sm font-semibold">
              {isEdit ? 'Save Changes' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EntityViewModal({ open, onClose, item, config }) {
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

  if (!open || !item || !config) return null

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
            <span className="vendor-modal-title-accent">{config.entityLabel}</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {config.columns.map((column) => (
              <div key={column}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {COLUMN_LABELS[column] || column}
                </p>
                <p className="text-sm text-slate-200">{item[column] ?? '—'}</p>
              </div>
            ))}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-sm text-slate-200">{item.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{item.created || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Updated</p>
              <p className="text-sm text-slate-300">{item.updated || '—'}</p>
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

export default function EntityListPage({ pageId, onNavigate }) {
  const config = PAGE_CONFIGS[pageId]
  const dispatch = useDispatch()
  const mainCategoryState = useSelector((state) => state.mainCategory)
  const categoryState = useSelector((state) => state.category)
  const isMainCategoryPage = pageId === 'main-category'
  const isCategoryPage = pageId === 'category'
  const subCategoryState = useSelector((state) => state.subCategory)
  const isSubCategoryPage = pageId === 'sub-category'
  const unitState = useSelector((state) => state.unit)
  const isUnitsPage = pageId === 'units'

  const [rows, setRows] = useState(() => (config?.rows || []).map((row) => ({ ...row })))
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [viewingRow, setViewingRow] = useState(null)
  const [deletingRow, setDeletingRow] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

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

  const normalizeMainCategoryRows = (items = []) => (
    items.map((item) => {
      const name = item?.name ?? ''
      const slug =
        item?.slug ??
        String(name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const createdRaw = item?.created_at ?? item?.created ?? item?.createdAt
      const updatedRaw = item?.updated_at ?? item?.updated ?? item?.updatedAt

      const created = createdRaw ? formatTimestamp(new Date(createdRaw)) : ''
      const updated = updatedRaw ? formatTimestamp(new Date(updatedRaw)) : ''

      return {
        id: item?.id ?? item?._id ?? Date.now(),
        name,
        slug,
        items: item?.items ?? 0,
        icon: item?.icon ? { id: item.icon, label: item.icon, color: '#22c55e', size: 18 } : null,
        sort_order: item?.sort_order ?? item?.sortOrder ?? 0,
        active: item?.is_active ?? item?.active ?? false,
        created,
        updated,
      }
    })
  )

  const nameById = (list = []) => {
    const map = new Map()
    list.forEach((row) => {
      if (row?.id == null) return
      const label = row?.name ?? row?.label
      if (label) map.set(String(row.id), label)
    })
    return map
  }

  const resolveParentName = (item, {
    nestedKeys = [],
    idKeys = [],
    lookup = new Map(),
  } = {}) => {
    for (const key of nestedKeys) {
      const nested = item?.[key]
      const name = typeof nested === 'object' ? nested?.name : null
      if (name) return name
    }

    for (const key of idKeys) {
      const raw = item?.[key]
      if (raw == null || raw === '') continue
      if (typeof raw === 'object' && raw?.name) return raw.name
      const asString = String(raw)
      if (lookup.has(asString)) return lookup.get(asString)
      // Avoid showing bare numeric ids in the Parent column
      if (!/^\d+$/.test(asString)) return asString
    }

    return '—'
  }

  const normalizeCategoryRows = (items = [], mainLookup = new Map()) => (
    items.map((item) => {
      const name = item?.name ?? ''
      const createdRaw = item?.created_at ?? item?.created ?? item?.createdAt
      const updatedRaw = item?.updated_at ?? item?.updated ?? item?.updatedAt

      const created = createdRaw ? formatTimestamp(new Date(createdRaw)) : ''
      const updated = updatedRaw ? formatTimestamp(new Date(updatedRaw)) : ''

      const parentName = resolveParentName(item, {
        nestedKeys: ['mainCategory', 'main_category'],
        idKeys: ['main_category_id', 'mainCategoryId', 'parent', 'parent_id'],
        lookup: mainLookup,
      })

      return {
        id: item?.id ?? item?._id ?? Date.now(),
        name,
        parent: parentName,
        parentId: item?.main_category_id ?? item?.mainCategoryId ?? item?.mainCategory?.id ?? null,
        items: item?.items ?? 0,
        icon: item?.icon ? { id: item.icon, label: item.icon, color: '#22c55e', size: 18 } : null,
        sort_order: item?.sort_order ?? item?.sortOrder ?? 0,
        active: item?.is_active ?? item?.active ?? false,
        created,
        updated,
      }
    })
  )

  const normalizeSubCategoryRows = (items = [], categoryLookup = new Map()) => (
    items.map((item) => {
      const name = item?.name ?? ''
      const createdRaw = item?.created_at ?? item?.created ?? item?.createdAt
      const updatedRaw = item?.updated_at ?? item?.updated ?? item?.updatedAt

      const created = createdRaw ? formatTimestamp(new Date(createdRaw)) : ''
      const updated = updatedRaw ? formatTimestamp(new Date(updatedRaw)) : ''

      const parentName = resolveParentName(item, {
        nestedKeys: ['category'],
        idKeys: ['category_id', 'categoryId', 'category_name', 'parent', 'parent_id'],
        lookup: categoryLookup,
      })

      return {
        id: item?.id ?? item?._id ?? Date.now(),
        name,
        parent: parentName,
        parentId: item?.category_id ?? item?.categoryId ?? item?.category?.id ?? null,
        items: item?.items ?? 0,
        icon: item?.icon ? { id: item.icon, label: item.icon, color: '#22c55e', size: 18 } : null,
        sort_order: item?.sort_order ?? item?.sortOrder ?? 0,
        active: item?.is_active ?? item?.active ?? false,
        created,
        updated,
      }
    })
  )

  const normalizeUnitRows = (items = []) => (
    items.map((item) => {
      const name = item?.name ?? ''
      const createdRaw = item?.created_at ?? item?.created ?? item?.createdAt
      const updatedRaw = item?.updated_at ?? item?.updated ?? item?.updatedAt

      const created = createdRaw ? formatTimestamp(new Date(createdRaw)) : ''
      const updated = updatedRaw ? formatTimestamp(new Date(updatedRaw)) : ''

      return {
        id: item?.id ?? item?._id ?? Date.now(),
        name,
        symbol: item?.symbol ?? '—',
        type: item?.type ?? '—',
        active: item?.is_active ?? item?.active ?? false,
        sort_order: item?.sort_order ?? item?.sortOrder ?? 0,
        created,
        updated,
      }
    })
  )

  useEffect(() => {
    if (!isMainCategoryPage && !isCategoryPage && !isSubCategoryPage && !isUnitsPage) {
      setRows((config?.rows || []).map((row) => ({ ...row })))
    }
    setQuery('')
    setStatus('')
    setStartDate('')
    setEndDate('')
    setModalOpen(false)
    setEditingRow(null)
    setViewingRow(null)
    setDeletingRow(null)
  }, [pageId, config, isMainCategoryPage, isCategoryPage, isSubCategoryPage, isUnitsPage])

  useEffect(() => {
    if (!isMainCategoryPage && !isCategoryPage) return
    dispatch(fetchMainCategories({ page: 1, limit: 500 }))
  }, [dispatch, isMainCategoryPage, isCategoryPage])

  useEffect(() => {
    if (!isMainCategoryPage) return
    setRows(normalizeMainCategoryRows(mainCategoryState?.rows || []))
  }, [isMainCategoryPage, mainCategoryState?.rows])

  useEffect(() => {
    if (!isCategoryPage && !isSubCategoryPage) return
    dispatch(fetchCategories({ page: 1, limit: 500 }))
  }, [dispatch, isCategoryPage, isSubCategoryPage])

  useEffect(() => {
    if (!isCategoryPage) return
    const mainLookup = nameById(mainCategoryState?.rows || [])
    setRows(normalizeCategoryRows(categoryState?.rows || [], mainLookup))
  }, [isCategoryPage, categoryState?.rows, mainCategoryState?.rows])

  useEffect(() => {
    if (!isSubCategoryPage) return
    dispatch(fetchSubCategories({ page: 1, limit: 500 }))
  }, [dispatch, isSubCategoryPage])

  useEffect(() => {
    if (!isSubCategoryPage) return
    const categoryLookup = nameById(categoryState?.rows || [])
    setRows(normalizeSubCategoryRows(subCategoryState?.rows || [], categoryLookup))
  }, [isSubCategoryPage, subCategoryState?.rows, categoryState?.rows])

  useEffect(() => {
    if (!isUnitsPage) return
    dispatch(fetchUnits({ page: 1, limit: 10 }))
  }, [dispatch, isUnitsPage])

  useEffect(() => {
    if (!isUnitsPage) return
    setRows(normalizeUnitRows(unitState?.rows || []))
  }, [isUnitsPage, unitState?.rows])

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase()
    return rows.filter((row) => (
      (!search || Object.values(row).some((value) => String(value).toLowerCase().includes(search)))
      && (!status || (status === 'Active') === row.active)
      && isWithinDateRange(row, startDate, endDate)
    ))
  }, [rows, query, status, startDate, endDate])

  const {
    selectedVisibleIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
  } = useRowSelection(filteredRows)
  const pagination = usePagination(filteredRows)

  // Hooks must be called unconditionally; these memos are used by category modal below.
  const mainCategoryOptions = useMemo(
    () => PAGE_CONFIGS['main-category']?.rows?.map((row) => row.name) || [],
    [],
  )
  const categoryOptions = useMemo(
    () => PAGE_CONFIGS.category?.rows?.map((row) => row.name) || [],
    [],
  )

  if (!config) {
    return (
      <section className="page-view">
        <div className="neo-card glass-card p-8">
          <p className="text-sm text-slate-400">Page configuration not found.</p>
        </div>
      </section>
    )
  }

  const refresh = () => {
    clearSelection()
    setQuery('')
    setStatus('')
    setStartDate('')
    setEndDate('')
    if (isMainCategoryPage) {
      dispatch(fetchMainCategories({ page: 1, limit: 10 }))
    }
    if (isCategoryPage) {
      dispatch(fetchCategories({ page: 1, limit: 10 }))
    }
    if (isSubCategoryPage) {
      dispatch(fetchSubCategories({ page: 1, limit: 10 }))
    }
    if (isUnitsPage) {
      dispatch(fetchUnits({ page: 1, limit: 10 }))
    }
  }

  const reloadEntityRows = async () => {
    if (isMainCategoryPage) {
      await dispatch(fetchMainCategories({ page: 1, limit: 10 }))
    } else if (isCategoryPage) {
      await dispatch(fetchCategories({ page: 1, limit: 10 }))
    } else if (isSubCategoryPage) {
      await dispatch(fetchSubCategories({ page: 1, limit: 10 }))
    } else if (isUnitsPage) {
      await dispatch(fetchUnits({ page: 1, limit: 10 }))
    }
  }

  const performDelete = async (id) => {
    if (!isMainCategoryPage && !isCategoryPage && !isSubCategoryPage && !isUnitsPage) {
      setRows((current) => current.filter((row) => row.id !== id))
      return
    }

    if (isMainCategoryPage) {
      await dispatch(deleteMainCategory(id)).unwrap()
    } else if (isCategoryPage) {
      await dispatch(deleteCategory(id)).unwrap()
    } else if (isSubCategoryPage) {
      await dispatch(deleteSubCategory(id)).unwrap()
    } else if (isUnitsPage) {
      await dispatch(deleteUnit(id)).unwrap()
    }
  }

  const toggleRow = async (id, currentActive) => {
    if (!isMainCategoryPage && !isCategoryPage && !isSubCategoryPage && !isUnitsPage) {
      setRows((current) => current.map((row) => (row.id === id ? { ...row, active: !row.active } : row)))
      return
    }

    try {
      if (isMainCategoryPage) {
        await dispatch(toggleMainCategoryStatus({ id, isActive: !currentActive })).unwrap()
        setToastSuccess('Main Category status updated.')
        await dispatch(fetchMainCategories({ page: 1, limit: 10 }))
      } else if (isCategoryPage) {
        await dispatch(toggleCategoryStatus({ id, isActive: !currentActive })).unwrap()
        setToastSuccess('Category status updated.')
        await dispatch(fetchCategories({ page: 1, limit: 10 }))
      } else if (isSubCategoryPage) {
        await dispatch(toggleSubCategoryStatus({ id, isActive: !currentActive })).unwrap()
        setToastSuccess('Sub Category status updated.')
        await dispatch(fetchSubCategories({ page: 1, limit: 10 }))
      } else if (isUnitsPage) {
        await dispatch(toggleUnitStatus({ id, isActive: !currentActive })).unwrap()
        setToastSuccess('Unit status updated.')
        await dispatch(fetchUnits({ page: 1, limit: 10 }))
      }
    } catch (error) {
      setToastError(error || 'Failed to update status.')
    }
  }

  const deleteRow = async (id) => {
    try {
      await performDelete(id)
      if (isMainCategoryPage) {
        setToastSuccess('Main Category deleted successfully.')
      } else if (isCategoryPage) {
        setToastSuccess('Category deleted successfully.')
      } else if (isSubCategoryPage) {
        setToastSuccess('Sub Category deleted successfully.')
      } else if (isUnitsPage) {
        setToastSuccess('Unit deleted successfully.')
      } else {
        setToastSuccess('Item deleted successfully.')
      }
      setDeletingRow(null)
      await reloadEntityRows()
    } catch (error) {
      setToastError(error || 'Failed to delete item.')
    }
  }

  const bulkDeleteRows = async () => {
    const ids = selectedVisibleIds
    if (!ids.length || bulkDeleting) return

    setBulkDeleting(true)
    setToastError('')
    try {
      for (const id of ids) {
        await performDelete(id)
      }
      clearSelection()
      setBulkDeleteOpen(false)
      setToastSuccess(`${ids.length} item(s) deleted successfully.`)
      await reloadEntityRows()
    } catch (error) {
      setToastError(error || 'Failed to delete selected items.')
    } finally {
      setBulkDeleting(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRow(null)
  }

  const openAddModal = () => {
    setEditingRow(null)
    setModalOpen(true)
  }

  const openEditModal = (row) => {
    setEditingRow(row)
    setModalOpen(true)
  }

  const addRow = (payload) => {
    const stamp = formatTimestamp()
    const template = config.rows[0] || {}
    const imageUrl = payload.image ? URL.createObjectURL(payload.image) : null
    const fieldValues = payload.fields || {}
    const next = {
      id: Date.now(),
      name: payload.name,
      created: stamp,
      updated: stamp,
      active: payload.active,
      icon: payload.icon || null,
      image: payload.image || null,
      imageUrl,
    }
    config.columns.forEach((column) => {
      if (column === 'name') return
      if (fieldValues[column] !== undefined) next[column] = fieldValues[column]
      else if (column === 'parent' && payload.parent) next[column] = payload.parent
      else if (typeof template[column] === 'number') next[column] = 0
      else if (column === 'slug') next[column] = payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      else if (column === 'orderStatus') next[column] = 'Pending'
      else if (column === 'statusLabel') next[column] = payload.active ? 'Enabled' : 'Disabled'
      else if (column === 'parent') next[column] = payload.parent || '—'
      else next[column] = '—'
    })
    setRows((current) => [next, ...current])
    closeModal()
  }

  const updateRow = (payload) => {
    const stamp = formatTimestamp()
    const fieldValues = payload.fields || {}
    setRows((current) => current.map((row) => {
      if (row.id !== payload.id) return row
      const nextImage = payload.image || (payload.keepImage ? row.image : null)
      const nextImageUrl = payload.image
        ? URL.createObjectURL(payload.image)
        : (payload.keepImage ? row.imageUrl : null)
      const next = {
        ...row,
        name: payload.name,
        active: payload.active,
        icon: payload.icon || null,
        image: nextImage,
        imageUrl: nextImageUrl,
        updated: stamp,
        ...fieldValues,
      }
      if (payload.parent !== undefined) next.parent = payload.parent
      if (Object.prototype.hasOwnProperty.call(row, 'slug') && fieldValues.slug === undefined) {
        next.slug = payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      if (Object.prototype.hasOwnProperty.call(row, 'statusLabel') && fieldValues.statusLabel === undefined) {
        next.statusLabel = payload.active ? 'Enabled' : 'Disabled'
      }
      return next
    }))
    closeModal()
  }

  const handleCategorySubmit = async (payload) => {
    // Sub Category (MASTER) API
    if (isSubCategoryPage) {
      try {
        if (!payload?.parent) {
          setToastError('Please select a Category.')
          return
        }

        if (!payload?.icon) {
          setToastError('Please select an icon.')
          return
        }

        const hasImage = payload?.image instanceof File || payload?.keepImage === true
        if (!hasImage) {
          setToastError('Please upload an image.')
          return
        }

        const category = categoryState?.rows?.find((c) => c?.name === payload.parent)
        if (!category?.id) {
          setToastError('Selected Category not found.')
          return
        }

        const existing = rows.find((r) => r.id === payload.id)
        const sortOrder = existing?.sort_order ?? 0

        if (payload.id) {
          await dispatch(
            updateSubCategory({
              id: payload.id,
              payload: {
                categoryId: category.id,
                name: payload.name,
                icon: payload.icon,
                sortOrder,
                image: payload.image || null,
                keepImage: payload.keepImage,
              },
            })
          ).unwrap()
          setToastSuccess('Sub Category updated successfully.')
        } else {
          await dispatch(
            createSubCategory({
              categoryId: category.id,
              name: payload.name,
              icon: payload.icon,
              sortOrder: sortOrder || 0,
              image: payload.image || null,
            })
          ).unwrap()
          setToastSuccess('Sub Category created successfully.')
        }

        closeModal()
        await dispatch(fetchSubCategories({ page: 1, limit: 10 }))
      } catch (error) {
        setToastError(error || 'Failed to submit Sub Category.')
      }
      return
    }

    // Category (MASTER) API
    if (isCategoryPage) {
      try {
        if (!payload?.parent) {
          setToastError('Please select a Main Category.')
          return
        }

        if (!payload?.icon) {
          setToastError('Please select an icon.')
          return
        }

        const hasImage = payload?.image instanceof File || payload?.keepImage === true
        if (!hasImage) {
          setToastError('Please upload an image.')
          return
        }

        const mainCat = mainCategoryState?.rows?.find((c) => c?.name === payload.parent)
        if (!mainCat?.id) {
          setToastError('Selected Main Category not found.')
          return
        }

        const existing = rows.find((r) => r.id === payload.id)
        const sortOrder = existing?.sort_order ?? 0

        if (payload.id) {
          await dispatch(
            updateCategory({
              id: payload.id,
              payload: {
                mainCategoryId: mainCat.id,
                name: payload.name,
                icon: payload.icon,
                sortOrder,
                image: payload.image || null,
                keepImage: payload.keepImage,
              },
            })
          ).unwrap()
          setToastSuccess('Category updated successfully.')
        } else {
          await dispatch(
            createCategory({
              mainCategoryId: mainCat.id,
              name: payload.name,
              icon: payload.icon,
              sortOrder: sortOrder || 0,
              image: payload.image || null,
            })
          ).unwrap()
          setToastSuccess('Category created successfully.')
        }

        closeModal()
        await dispatch(fetchCategories({ page: 1, limit: 10 }))
      } catch (error) {
        setToastError(error || 'Failed to submit Category.')
      }
      return
    }

    // Main Category (MASTER) API
    if (isMainCategoryPage) {
      try {
        if (!payload?.icon) {
          setToastError('Please select an icon.')
          return
        }

        const hasImage = payload?.image instanceof File || payload?.keepImage === true
        if (!hasImage) {
          setToastError('Please upload an image.')
          return
        }

        const existing = rows.find((r) => r.id === payload.id)
        const sortOrder = existing?.sort_order ?? 0

        if (payload.id) {
          await dispatch(
            updateMainCategory({
              id: payload.id,
              payload: {
                name: payload.name,
                icon: payload.icon,
                sortOrder,
                image: payload.image || null,
                keepImage: payload.keepImage,
                active: payload.active,
                status: payload.status,
              },
            })
          ).unwrap()
          setToastSuccess('Main Category updated successfully.')
        } else {
          await dispatch(
            createMainCategory({
              name: payload.name,
              icon: payload.icon,
              sortOrder: sortOrder || 0,
              image: payload.image || null,
              active: payload.active,
              status: payload.status,
            })
          ).unwrap()
          setToastSuccess('Main Category created successfully.')
        }

        closeModal()
        await dispatch(fetchMainCategories({ page: 1, limit: 10 }))
      } catch (error) {
        setToastError(error || 'Failed to submit Main Category.')
      }
      return
    }

    // Other pages: existing mock CRUD
    if (payload.id) updateRow(payload)
    else addRow(payload)
  }

  const handleEntitySubmit = async (payload) => {
    if (isUnitsPage) {
      try {
        const symbolRaw = payload?.fields?.symbol
        const typeRaw = payload?.fields?.type
        const symbol = String(symbolRaw ?? '').trim()
        const type = String(typeRaw ?? '').trim()

        const existing = rows.find((r) => r.id === payload.id)
        const sortOrder = existing?.sort_order ?? 0

        if (!symbol || symbol === '—') {
          setToastError('Please enter symbol.')
          return
        }
        if (!type || type === '—') {
          setToastError('Please enter type.')
          return
        }

        if (payload.id) {
          await dispatch(
            updateUnit({
              id: payload.id,
              payload: {
                name: payload.name,
                symbol: payload.fields.symbol,
                type: payload.fields.type,
                sortOrder,
              },
            }),
          ).unwrap()
          setToastSuccess('Unit updated successfully.')
        } else {
          await dispatch(
            createUnit({
              name: payload.name,
              symbol: payload.fields.symbol,
              type: payload.fields.type,
              sortOrder: 0,
            }),
          ).unwrap()
          setToastSuccess('Unit created successfully.')
        }

        closeModal()
        await dispatch(fetchUnits({ page: 1, limit: 10 }))
      } catch (error) {
        setToastError(error || 'Failed to submit Unit.')
      }
      return
    }

    if (payload.id) updateRow(payload)
    else addRow(payload)
  }
  const useCategoryModal = pageId === 'main-category' || pageId === 'category' || pageId === 'sub-category'

  const categoryModalProps = (() => {
    if (pageId === 'category') {
      const mainCategoryOptionsForModal = mainCategoryState?.rows?.length
        ? mainCategoryState.rows.map((row) => row?.name).filter(Boolean)
        : mainCategoryOptions
      return { title: 'Category', parentLabel: 'Main Category', parentOptions: mainCategoryOptionsForModal }
    }
    if (pageId === 'sub-category') {
      const categoryOptionsForModal = categoryState?.rows?.length
        ? categoryState.rows.map((row) => row?.name).filter(Boolean)
        : categoryOptions
      return { title: 'Sub Category', parentLabel: 'Category', parentOptions: categoryOptionsForModal }
    }
    return { title: 'Main Category', parentLabel: 'Main Category', parentOptions: null }
  })()

  return (
    <section className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">{config.title}</h2>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="#" onClick={(event) => { event.preventDefault(); onNavigate?.('dashboard') }}>Home</a>
          <span className="mx-2 text-slate-600">›</span>
          <span>{config.title}</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': config.accent }}>
        <span className="card-accent" aria-hidden="true" />
        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}
        {pageId === 'product-tags' ? (
          <p className="mb-4 text-sm text-amber-300">
            Product tags are not connected to the catalog API yet. Added tags stay in this browser session only and do not appear on products.
          </p>
        ) : null}

        {selectedCount > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
            <span className="text-sm font-medium text-slate-200">
              {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="vendor-btn-cancel px-4 py-2 text-xs"
                disabled={bulkDeleting}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="delete-confirm-btn px-4 py-2 text-xs"
                disabled={bulkDeleting}
              >
                Delete selected
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">{config.listTitle}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input"><Icon path={paths.search} /></span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search..." className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56" />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="glass-input rounded-xl px-3 py-2 text-sm">
              <option value="">Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input"><Icon path={paths.calendar} /></span>
                <input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="glass-input date-filter-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-40" aria-label="Start date" />
              </div>
              <span className="text-xs text-slate-500">→</span>
              <div className="relative">
                <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input"><Icon path={paths.calendar} /></span>
                <input type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="glass-input date-filter-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-40" aria-label="End date" />
              </div>
            </div>
            <button type="button" onClick={refresh} className="btn-glass flex h-10 w-10 items-center justify-center rounded-xl" aria-label="Refresh"><Icon path={paths.refresh} /></button>
            <button type="button" className="btn-add" aria-label={`Add ${config.entityLabel}`} onClick={openAddModal}><Icon path={paths.plus} className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/5"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    aria-label="Select all items on this page"
                    disabled={filteredRows.length === 0}
                  />
                </th>
                <th>S.No</th>
                {config.columns.map((column) => <th key={column}>{COLUMN_LABELS[column] || column}</th>)}
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 5} className="py-10 text-center text-sm text-slate-400">
                    No records found for the selected filters.
                  </td>
                </tr>
              ) : pagination.pageItems.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-white/5"
                      checked={isSelected(row.id)}
                      onChange={() => toggleOne(row.id)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="text-slate-400">{pagination.rangeStart + index}</td>
                  {config.columns.map((column) => (
                    <td key={column} className={column === 'name' ? 'font-semibold text-slate-200' : 'text-slate-400'}>
                      {row[column] ?? '—'}
                    </td>
                  ))}
                  <td>
                    <div className="flex items-center gap-2">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={row.active} onChange={() => toggleRow(row.id, row.active)} />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`text-xs font-semibold ${row.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {row.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{row.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{row.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${row.name}`}
                        onClick={() => setViewingRow(row)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${row.name}`}
                        onClick={() => openEditModal(row)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button type="button" onClick={() => setDeletingRow(row)} className="action-btn action-btn-danger" aria-label={`Delete ${row.name}`}><Icon path={paths.delete} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length > 0 ? (
          <TablePagination
            {...pagination}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
            itemLabel="records"
          />
        ) : null}
      </div>

      {useCategoryModal ? (
        <MainCategoryModal
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleCategorySubmit}
          item={editingRow}
          title={categoryModalProps.title}
          parentLabel={categoryModalProps.parentLabel}
          parentOptions={categoryModalProps.parentOptions}
        />
      ) : (
        <EntityModal
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleEntitySubmit}
          config={config}
          item={editingRow}
        />
      )}
      <EntityViewModal
        open={Boolean(viewingRow)}
        onClose={() => setViewingRow(null)}
        item={viewingRow}
        config={config}
      />
      <DeleteConfirmModal
        open={Boolean(deletingRow)}
        onClose={() => setDeletingRow(null)}
        onConfirm={() => deleteRow(deletingRow.id)}
        itemName={deletingRow?.name || ''}
        title="Delete Item"
      />
      <DeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
        onConfirm={bulkDeleteRows}
        title="Delete Selected Items"
        count={selectedCount}
        confirming={bulkDeleting}
      />
    </section>
  )
}
