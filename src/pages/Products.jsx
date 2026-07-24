import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import {
  APPROVAL_STATUS_OPTIONS,
  PRODUCTS_DATA,
  VENDOR_STATUS_OPTIONS,
} from '../data/products'

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
  upload: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
}

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const emptyForm = {
  name: '',
  brand: '',
  categoryPath: '',
  subCategory: '',
  variants: '1',
  price: '',
  mrp: '',
  stock: '',
  adminActive: true,
  active: true,
  vendorStatus: 'Active',
  approvalStatus: 'Approved',
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
  return `₹${amount.toLocaleString('en-IN')}`
}

function parseProductDate(value) {
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

function isWithinDateRange(product, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseProductDate(product.created)
  const updated = parseProductDate(product.updated)
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

function ProductModal({ open, onClose, onSubmit, product = null }) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    if (product) {
      setForm({
        name: product.name || '',
        brand: product.brand || '',
        categoryPath: product.categoryPath || '',
        subCategory: product.subCategory || '',
        variants: String(product.variants ?? 1),
        price: String(product.price ?? ''),
        mrp: String(product.mrp ?? ''),
        stock: String(product.stock ?? ''),
        adminActive: Boolean(product.adminActive),
        active: Boolean(product.active),
        vendorStatus: product.vendorStatus || 'Active',
        approvalStatus: product.approvalStatus || 'Approved',
      })
      setImagePreview(product.imageUrl || '')
    } else {
      setForm(emptyForm)
      setImagePreview('')
    }

    setImageFile(null)
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
  }, [open, onClose, product])

  if (!open) return null

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const selectImage = (file) => {
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
    setImageFile(file)
    setImagePreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.brand.trim() || !form.categoryPath.trim()) {
      setError('Please fill in product name, brand, and category.')
      return
    }
    if (!form.price || Number(form.price) < 0) {
      setError('Please enter a valid price.')
      return
    }

    onSubmit({
      id: product?.id,
      name: form.name.trim(),
      brand: form.brand.trim(),
      categoryPath: form.categoryPath.trim(),
      subCategory: form.subCategory.trim(),
      variants: Number(form.variants) || 1,
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      adminActive: form.adminActive,
      active: form.active,
      vendorStatus: form.vendorStatus,
      approvalStatus: form.approvalStatus,
      image: imageFile,
      imageUrl: imageFile ? undefined : (product?.imageUrl || imagePreview || ''),
      keepImage: isEdit && !imageFile && Boolean(product?.imageUrl),
    })
  }

  const fieldPrefix = isEdit ? 'edit-product' : 'add-product'

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
            <span className="vendor-modal-title-accent">Product</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label htmlFor={`${fieldPrefix}-name`} className="vendor-field-label">Product Name</label>
                <input
                  id={`${fieldPrefix}-name`}
                  type="text"
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder="Enter product name"
                  className="glass-input vendor-field-input"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-brand`} className="vendor-field-label">Brand</label>
                <input
                  id={`${fieldPrefix}-brand`}
                  type="text"
                  value={form.brand}
                  onChange={updateField('brand')}
                  placeholder="Brand"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`${fieldPrefix}-category`} className="vendor-field-label">Category Path</label>
                <input
                  id={`${fieldPrefix}-category`}
                  type="text"
                  value={form.categoryPath}
                  onChange={updateField('categoryPath')}
                  placeholder="School Shoes | Men Clothing"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-subcategory`} className="vendor-field-label">Sub Category</label>
                <input
                  id={`${fieldPrefix}-subcategory`}
                  type="text"
                  value={form.subCategory}
                  onChange={updateField('subCategory')}
                  placeholder="T-Shirts"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-price`} className="vendor-field-label">Price</label>
                <input
                  id={`${fieldPrefix}-price`}
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={updateField('price')}
                  placeholder="500"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-mrp`} className="vendor-field-label">MRP</label>
                <input
                  id={`${fieldPrefix}-mrp`}
                  type="number"
                  min="0"
                  value={form.mrp}
                  onChange={updateField('mrp')}
                  placeholder="750"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-stock`} className="vendor-field-label">Stock</label>
                <input
                  id={`${fieldPrefix}-stock`}
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={updateField('stock')}
                  placeholder="20"
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-variants`} className="vendor-field-label">Variants</label>
                <input
                  id={`${fieldPrefix}-variants`}
                  type="number"
                  min="1"
                  value={form.variants}
                  onChange={updateField('variants')}
                  className="glass-input vendor-field-input"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-vendor-status`} className="vendor-field-label">Vendor Status</label>
                <select
                  id={`${fieldPrefix}-vendor-status`}
                  value={form.vendorStatus}
                  onChange={updateField('vendorStatus')}
                  className="glass-input vendor-field-input"
                >
                  {VENDOR_STATUS_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-approval`} className="vendor-field-label">Approval Status</label>
                <select
                  id={`${fieldPrefix}-approval`}
                  value={form.approvalStatus}
                  onChange={updateField('approvalStatus')}
                  className="glass-input vendor-field-input"
                >
                  {APPROVAL_STATUS_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-6 md:col-span-3">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.adminActive} onChange={updateField('adminActive')} className="rounded border-white/20 bg-white/5" />
                  Admin Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.active} onChange={updateField('active')} className="rounded border-white/20 bg-white/5" />
                  Status Active
                </label>
              </div>
              <div className="md:col-span-3">
                <label htmlFor={`${fieldPrefix}-image`} className="vendor-field-label">Image</label>
                <label
                  htmlFor={`${fieldPrefix}-image`}
                  className={`vendor-upload-zone${imagePreview ? ' has-preview' : ''}`}
                >
                  <input
                    id={`${fieldPrefix}-image`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => selectImage(event.target.files?.[0] || null)}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" />
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

            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>

          <div className="vendor-modal-footer grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductViewModal({ open, onClose, product }) {
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

  if (!open || !product) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-product-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-product-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Product</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="product-view-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <span className="text-sm text-slate-500">No image</span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Name</p>
              <p className="text-sm font-semibold text-slate-200">{product.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Brand</p>
              <p className="text-sm text-slate-300">{product.brand}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Category</p>
              <p className="text-sm text-slate-300">{product.categoryPath}</p>
              {product.subCategory ? <p className="text-xs text-slate-500">{product.subCategory}</p> : null}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-200">{formatRupee(product.price)}</p>
              <p className="text-xs text-slate-500 line-through">{formatRupee(product.mrp)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Stock</p>
              <p className="text-sm text-slate-300">{product.stock}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Variants</p>
              <p className="text-sm text-brand-300">{product.variants}</p>
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

export default function Products({ onNavigate }) {
  const [products, setProducts] = useState(() => PRODUCTS_DATA.map((product) => ({ ...product })))
  const [query, setQuery] = useState('')
  const [vendorStatus, setVendorStatus] = useState('')
  const [approvalStatus, setApprovalStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.filter((product) => (
      (!search || product.name.toLowerCase().includes(search) || product.brand.toLowerCase().includes(search))
      && (!vendorStatus || product.vendorStatus === vendorStatus)
      && (!approvalStatus || product.approvalStatus === approvalStatus)
      && isWithinDateRange(product, startDate, endDate)
    ))
  }, [products, query, vendorStatus, approvalStatus, startDate, endDate])

  const refresh = () => {
    setQuery('')
    setVendorStatus('')
    setApprovalStatus('')
    setStartDate('')
    setEndDate('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const toggleAdminStatus = (id) => {
    setProducts((current) => current.map((product) => (
      product.id === id ? { ...product, adminActive: !product.adminActive } : product
    )))
  }

  const toggleStatus = (id) => {
    setProducts((current) => current.map((product) => (
      product.id === id ? { ...product, active: !product.active } : product
    )))
  }

  const deleteProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id))
    setDeletingProduct(null)
  }

  const addProduct = (payload) => {
    const stamp = formatTimestamp()
    const imageUrl = payload.image ? URL.createObjectURL(payload.image) : (payload.imageUrl || '')
    setProducts((current) => [
      {
        id: Date.now(),
        name: payload.name,
        imageUrl,
        variants: payload.variants,
        categoryPath: payload.categoryPath,
        subCategory: payload.subCategory,
        brand: payload.brand,
        price: payload.price,
        mrp: payload.mrp,
        stock: payload.stock,
        adminActive: payload.adminActive,
        active: payload.active,
        vendorStatus: payload.vendorStatus,
        approvalStatus: payload.approvalStatus,
        created: stamp,
        updated: stamp,
      },
      ...current,
    ])
    closeModal()
  }

  const updateProduct = (payload) => {
    const stamp = formatTimestamp()
    setProducts((current) => current.map((product) => {
      if (product.id !== payload.id) return product
      const imageUrl = payload.image
        ? URL.createObjectURL(payload.image)
        : (payload.keepImage ? product.imageUrl : (payload.imageUrl || product.imageUrl))
      return {
        ...product,
        name: payload.name,
        imageUrl,
        variants: payload.variants,
        categoryPath: payload.categoryPath,
        subCategory: payload.subCategory,
        brand: payload.brand,
        price: payload.price,
        mrp: payload.mrp,
        stock: payload.stock,
        adminActive: payload.adminActive,
        active: payload.active,
        vendorStatus: payload.vendorStatus,
        approvalStatus: payload.approvalStatus,
        updated: stamp,
      }
    }))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingProduct) updateProduct(payload)
    else addProduct(payload)
  }

  return (
    <section id="page-products" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Products</h2>
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
          <span>Products</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#34d399' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Products List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search products by name..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>
            <select
              value={vendorStatus}
              onChange={(event) => setVendorStatus(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Vendor Status</option>
              {VENDOR_STATUS_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              value={approvalStatus}
              onChange={(event) => setApprovalStatus(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Approval Status</option>
              {APPROVAL_STATUS_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
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
              aria-label="Add product"
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
                <th>Image</th>
                <th>Product Name</th>
                <th>Variant</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Admin Status</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-sm text-slate-400">
                    No products found for the selected filters.
                  </td>
                </tr>
              ) : filteredProducts.map((product, index) => (
                <tr key={product.id}>
                  <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                  <td className="text-slate-400">{index + 1}</td>
                  <td>
                    <div className="product-thumb">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="font-semibold text-slate-200">{product.name}</td>
                  <td>
                    <button type="button" className="product-variant-link">
                      {product.variants}
                    </button>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-200">{product.categoryPath}</p>
                      {product.subCategory ? (
                        <p className="text-xs text-slate-500">{product.subCategory}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="text-slate-400">{product.brand}</td>
                  <td>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{formatRupee(product.price)}</p>
                      <p className="text-xs text-slate-500 line-through">{formatRupee(product.mrp)}</p>
                    </div>
                  </td>
                  <td className="text-slate-300">{product.stock}</td>
                  <td>
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={product.adminActive}
                          onChange={() => toggleAdminStatus(product.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`product-status-pill ${product.adminActive ? 'is-active' : 'is-admin-inactive'}`}>
                        {product.adminActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={product.active}
                          onChange={() => toggleStatus(product.id)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`product-status-pill ${product.active ? 'is-active' : 'is-inactive'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{product.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{product.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View ${product.name}`}
                        onClick={() => setViewingProduct(product)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => openEditModal(product)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(product)}
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${product.name}`}
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

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        product={editingProduct}
      />
      <ProductViewModal
        open={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
      />
      <DeleteConfirmModal
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deleteProduct(deletingProduct.id)}
        itemName={deletingProduct?.name || ''}
        title="Delete Item"
      />
    </section>
  )
}
