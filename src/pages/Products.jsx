import { useCallback, useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import ProductExcelUploadModal from '../components/ProductExcelUploadModal'
import { useRowSelection } from '../hooks/useRowSelection'
import TablePagination from '../components/TablePagination'
import usePagination from '../hooks/usePagination'
import {
  APPROVAL_STATUS_OPTIONS,
  VENDOR_STATUS_OPTIONS,
} from '../data/products'
import { PAGE_CONFIGS } from '../data/pages'
import {
  bulkDeleteProductsAPI,
  deleteProductAPI,
  fetchProductByIdAPI,
  fetchProductsAPI,
  repairProductImagesAPI,
  setProductApprovalAPI,
  setProductStatusAPI,
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

function capitalizeStatus(value) {
  if (!value) return ''
  const text = String(value)
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

function formatApiDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : formatTimestamp(date)
}

function mapApiProduct(row) {
  if (!row) return null
  const isActive = Boolean(row.is_active)
  const sizes = Array.isArray(row.sizes) ? row.sizes : []
  return {
    id: row.id,
    name: row.title || row.name || '',
    brand: row.brand || '',
    categoryPath: row.category_path || '',
    subCategory: row.sub_category_name || '',
    price: Number(row.effective_price ?? row.discounted_price ?? 0),
    mrp: Number(row.price ?? row.mrp ?? 0),
    stock: Number(row.stock_qty ?? 0),
    imageUrl: row.cover_image || '',
    adminActive: isActive,
    active: isActive,
    vendorStatus: row.vendor?.name || row.vendor?.shop_name || row.created_by_type || '',
    approvalStatus: capitalizeStatus(row.approval_status),
    status: row.status || '',
    variants: sizes.length > 0 ? sizes.length : (Number(row.variants) || 1),
    created: formatApiDate(row.created_at),
    updated: formatApiDate(row.updated_at),
  }
}

function apiErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback
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
                <label htmlFor={`${fieldPrefix}-category`} className="vendor-field-label">Category</label>
                <select
                  id={`${fieldPrefix}-category`}
                  value={form.categoryPath}
                  onChange={updateField('categoryPath')}
                  className="glass-input vendor-field-input"
                >
                  <option value="">- Select Category -</option>
                  {(PAGE_CONFIGS.category?.rows || []).map((row) => (
                    <option key={row.id} value={row.name}>
                      {row.name}
                    </option>
                  ))}
                  {form.categoryPath && !(PAGE_CONFIGS.category?.rows || []).some((row) => row.name === form.categoryPath) ? (
                    <option value={form.categoryPath}>{form.categoryPath}</option>
                  ) : null}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-subcategory`} className="vendor-field-label">Sub-category</label>
                <select
                  id={`${fieldPrefix}-subcategory`}
                  value={form.subCategory}
                  onChange={updateField('subCategory')}
                  className="glass-input vendor-field-input"
                >
                  <option value="">- Select Sub-category -</option>
                  {(PAGE_CONFIGS['sub-category']?.rows || [])
                    .filter((row) => !form.categoryPath || row.parent === form.categoryPath)
                    .map((row) => (
                      <option key={row.id} value={row.name}>
                        {row.name}
                      </option>
                    ))}
                  {form.subCategory && !(PAGE_CONFIGS['sub-category']?.rows || []).some((row) => row.name === form.subCategory) ? (
                    <option value={form.subCategory}>{form.subCategory}</option>
                  ) : null}
                </select>
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

function ViewField({ label, children, full = false }) {
  if (children == null || children === '') return null
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm text-slate-300 whitespace-pre-wrap break-words">{children}</div>
    </div>
  )
}

function ViewChipList({ label, items }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <div className="sm:col-span-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={String(item)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300"
          >
            {String(item)}
          </span>
        ))}
      </div>
    </div>
  )
}

function ViewSection({ title, children }) {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function ProductViewModal({ open, onClose, productId }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!open || !productId) {
      setDetail(null)
      setError('')
      return undefined
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchProductByIdAPI(productId)
        if (cancelled) return
        if (!response?.success || !response?.data) {
          throw new Error(response?.message || 'Product not found.')
        }
        setDetail(response.data)
      } catch (err) {
        if (!cancelled) {
          setDetail(null)
          setError(apiErrorMessage(err, 'Failed to load product details.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, productId])

  if (!open) return null

  const salePrice = Number(detail?.discounted_price ?? 0)
  const mrp = Number(detail?.price ?? 0)
  const effective = salePrice > 0 ? salePrice : mrp
  const gallery = Array.isArray(detail?.gallery) ? detail.gallery.filter(Boolean) : []
  const sizes = Array.isArray(detail?.sizes) ? detail.sizes : []
  const colors = Array.isArray(detail?.colors) ? detail.colors : []
  const tags = Array.isArray(detail?.tags) ? detail.tags : []
  const vendorName =
    detail?.vendor?.shop_name || detail?.vendor?.name || detail?.created_by_type || ''

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-wide glass-card"
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
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading product details…</p>
          ) : null}

          {!loading && error ? (
            <p className="py-8 text-center text-sm text-rose-400">{error}</p>
          ) : null}

          {!loading && !error && detail ? (
            <>
              <div className="product-view-image">
                {detail.cover_image ? (
                  <img src={detail.cover_image} alt={detail.title || detail.name || 'Product'} />
                ) : (
                  <span className="text-sm text-slate-500">No cover image</span>
                )}
              </div>

              {gallery.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {gallery.map((url) => (
                    <div
                      key={url}
                      className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-white/5"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}

              <ViewSection title="Basic info">
                <ViewField label="Name">{detail.title || detail.name}</ViewField>
                <ViewField label="SKU">{detail.sku || '—'}</ViewField>
                <ViewField label="Brand">{detail.brand || '—'}</ViewField>
                <ViewField label="Product type">{capitalizeStatus(detail.product_type) || '—'}</ViewField>
                <ViewField label="Main category" full>
                  {detail.main_category_name || '—'}
                </ViewField>
                <ViewField label="Category">{detail.category_name || '—'}</ViewField>
                <ViewField label="Sub-category">{detail.sub_category_name || '—'}</ViewField>
                {detail.category_path ? (
                  <ViewField label="Category path" full>{detail.category_path}</ViewField>
                ) : null}
              </ViewSection>

              <ViewSection title="Pricing & stock">
                <ViewField label="Selling price">{formatRupee(effective)}</ViewField>
                <ViewField label="MRP">{formatRupee(mrp)}</ViewField>
                <ViewField label="Stock qty">{detail.stock_qty ?? 0}</ViewField>
                <ViewField label="Stock status">{detail.stock_status || '—'}</ViewField>
                <ViewField label="Manage stock">{detail.manage_stock ? 'Yes' : 'No'}</ViewField>
                <ViewField label="Allow backorder">{detail.allow_backorder ? 'Yes' : 'No'}</ViewField>
                <ViewField label="Visibility">{detail.visibility || '—'}</ViewField>
                <ViewField label="Enable reviews">{detail.enable_reviews !== false ? 'Yes' : 'No'}</ViewField>
                <ViewChipList label="Sizes" items={sizes} />
                <ViewChipList label="Colors" items={colors} />
                <ViewChipList label="Tags" items={tags} />
              </ViewSection>

              <ViewSection title="Status">
                <ViewField label="Publish status">{capitalizeStatus(detail.status) || '—'}</ViewField>
                <ViewField label="Approval">{capitalizeStatus(detail.approval_status) || '—'}</ViewField>
                <ViewField label="Active">{detail.is_active ? 'Active' : 'Inactive'}</ViewField>
                <ViewField label="Vendor / creator">{vendorName || '—'}</ViewField>
                {detail.rejection_reason ? (
                  <ViewField label="Rejection reason" full>{detail.rejection_reason}</ViewField>
                ) : null}
                <ViewField label="Created">{formatApiDate(detail.created_at) || '—'}</ViewField>
                <ViewField label="Updated">{formatApiDate(detail.updated_at) || '—'}</ViewField>
                {detail.published_at ? (
                  <ViewField label="Published">{formatApiDate(detail.published_at)}</ViewField>
                ) : null}
              </ViewSection>

              <ViewSection title="Description">
                <ViewField label="Short description" full>
                  {detail.short_description || '—'}
                </ViewField>
                <ViewField label="Full description" full>
                  {detail.description || '—'}
                </ViewField>
                {detail.purchase_note ? (
                  <ViewField label="Purchase note" full>{detail.purchase_note}</ViewField>
                ) : null}
              </ViewSection>

              <ViewSection title="SEO">
                <ViewField label="Meta title" full>{detail.meta_title || '—'}</ViewField>
                <ViewField label="Meta description" full>{detail.meta_description || '—'}</ViewField>
                <ViewField label="Meta keywords" full>{detail.meta_keywords || '—'}</ViewField>
                <ViewField label="OG title" full>{detail.og_title || '—'}</ViewField>
                <ViewField label="OG description" full>{detail.og_description || '—'}</ViewField>
                <ViewField label="Canonical URL" full>{detail.canonical_url || '—'}</ViewField>
                <ViewField label="Slug" full>{detail.slug || '—'}</ViewField>
              </ViewSection>
            </>
          ) : null}
        </div>

        <div className="vendor-modal-footer">
          <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function Products({ onNavigate }) {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [vendorStatus, setVendorStatus] = useState('')
  const [approvalStatus, setApprovalStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [excelModalOpen, setExcelModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [approvalUpdatingId, setApprovalUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
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

  const loadProducts = useCallback(async (overrides = {}) => {
    const searchValue = overrides.query !== undefined ? overrides.query : query
    const approvalValue = overrides.approvalStatus !== undefined ? overrides.approvalStatus : approvalStatus

    setLoadingProducts(true)
    setToastError('')
    try {
      const params = { page: 1, limit: 100 }
      const search = String(searchValue || '').trim()
      if (search) params.search = search
      if (approvalValue) params.approval_status = String(approvalValue).toLowerCase()

      const res = await fetchProductsAPI(params)
      const rows = Array.isArray(res?.data) ? res.data : []
      setProducts(rows.map(mapApiProduct).filter(Boolean))
    } catch (err) {
      setProducts([])
      setToastError(apiErrorMessage(err, 'Failed to load products.'))
    } finally {
      setLoadingProducts(false)
    }
  }, [query, approvalStatus])

  useEffect(() => {
    let alive = true

    const boot = async () => {
      loadProducts()

      const repairKey = 'shieldx-product-image-repair-v1'
      try {
        if (!sessionStorage.getItem(repairKey)) {
          sessionStorage.setItem(repairKey, '1')
          const res = await repairProductImagesAPI(150)
          if (!alive) return
          if (res?.data?.repairedCount > 0) {
            await loadProducts()
            setToastSuccess(`Repaired ${res.data.repairedCount} product image(s).`)
          }
        }
      } catch {
        // Non-fatal — list already loaded
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [approvalStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.filter((product) => (
      (!search || product.name.toLowerCase().includes(search) || product.brand.toLowerCase().includes(search))
      && (!vendorStatus || product.vendorStatus === vendorStatus)
      && (!approvalStatus || product.approvalStatus === approvalStatus)
      && isWithinDateRange(product, startDate, endDate)
    ))
  }, [products, query, vendorStatus, approvalStatus, startDate, endDate])

  const {
    selectedVisibleIds,
    selectedCount,
    allSelected,
    someSelected,
    isSelected,
    toggleOne,
    toggleAll,
    clearSelection,
  } = useRowSelection(filteredProducts)
  const pagination = usePagination(filteredProducts)

  const refresh = () => {
    clearSelection()
    setQuery('')
    setVendorStatus('')
    setApprovalStatus('')
    setStartDate('')
    setEndDate('')
    loadProducts({ query: '', approvalStatus: '' })
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const openAddModal = () => {
    onNavigate?.('add-product')
  }

  const openEditModal = (product) => {
    onNavigate?.('edit-product', { id: product.id })
  }

  const upsertProductRow = (row) => {
    const mapped = mapApiProduct(row)
    if (!mapped) return
    setProducts((current) => {
      const exists = current.some((product) => product.id === mapped.id)
      if (!exists) return [mapped, ...current]
      return current.map((product) => (product.id === mapped.id ? mapped : product))
    })
  }

  const toggleAdminStatus = async (id) => {
    const product = products.find((item) => item.id === id)
    if (!product || statusUpdatingId) return

    const nextActive = !product.adminActive
    setStatusUpdatingId(id)
    setToastError('')
    try {
      const res = await setProductStatusAPI(id, nextActive)
      if (res?.data) {
        upsertProductRow(res.data)
      } else {
        setProducts((current) => current.map((item) => (
          item.id === id ? { ...item, adminActive: nextActive, active: nextActive } : item
        )))
      }
      setToastSuccess(res?.message || (nextActive ? 'Product activated.' : 'Product deactivated.'))
    } catch (err) {
      setToastError(apiErrorMessage(err, 'Status update failed.'))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const toggleStatus = (id) => {
    toggleAdminStatus(id)
  }

  const changeApproval = async (id, nextApproval) => {
    const product = products.find((item) => item.id === id)
    if (!product || approvalUpdatingId) return

    const approvalValue = String(nextApproval || '').toLowerCase()
    if (!approvalValue || capitalizeStatus(approvalValue) === product.approvalStatus) return

    setApprovalUpdatingId(id)
    setToastError('')
    try {
      const res = await setProductApprovalAPI(id, approvalValue)
      const isApproved = approvalValue === 'approved'
      if (res?.data) {
        upsertProductRow(res.data)
      } else {
        setProducts((current) => current.map((item) => (
          item.id === id
            ? {
              ...item,
              approvalStatus: capitalizeStatus(approvalValue),
              adminActive: isApproved,
              active: isApproved,
            }
            : item
        )))
      }
      setToastSuccess(res?.message || `Product marked as ${approvalValue}.`)
    } catch (err) {
      setToastError(apiErrorMessage(err, 'Approval update failed.'))
    } finally {
      setApprovalUpdatingId(null)
    }
  }

  const deleteProduct = async (id) => {
    if (!id || deletingId) return
    setDeletingId(id)
    setToastError('')
    try {
      const res = await deleteProductAPI(id)
      setProducts((current) => current.filter((product) => product.id !== id))
      setDeletingProduct(null)
      setToastSuccess(res?.message || 'Product deleted.')
    } catch (err) {
      setToastError(apiErrorMessage(err, 'Failed to delete product.'))
    } finally {
      setDeletingId(null)
    }
  }

  const bulkDeleteProducts = async () => {
    const ids = selectedVisibleIds
    if (!ids.length || bulkDeleting) return

    setBulkDeleting(true)
    setToastError('')
    try {
      const res = await bulkDeleteProductsAPI(ids)
      const deletedIds = Array.isArray(res?.deletedIds) && res.deletedIds.length
        ? res.deletedIds
        : ids
      setProducts((current) => current.filter((product) => !deletedIds.includes(product.id)))
      clearSelection()
      setBulkDeleteOpen(false)
      setToastSuccess(res?.message || `${deletedIds.length} product(s) deleted.`)
    } catch (err) {
      setToastError(apiErrorMessage(err, 'Failed to delete selected products.'))
    } finally {
      setBulkDeleting(false)
    }
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
              disabled={loadingProducts}
            >
              <Icon path={paths.refresh} />
            </button>
            <button
              type="button"
              className="btn-glass flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold"
              aria-label="Upload Excel"
              onClick={() => setExcelModalOpen(true)}
            >
              <Icon path={paths.upload} className="h-4 w-4" />
              <span className="hidden sm:inline">Upload Excel</span>
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

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

        {selectedCount > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
            <span className="text-sm font-medium text-slate-200">
              {selectedCount} product{selectedCount === 1 ? '' : 's'} selected
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

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1400px] text-left text-sm">
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
                    aria-label="Select all products on this page"
                    disabled={loadingProducts || filteredProducts.length === 0}
                  />
                </th>
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
              {loadingProducts ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-sm text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-sm text-slate-400">
                    {toastError ? 'Could not load products.' : 'No products found for the selected filters.'}
                  </td>
                </tr>
              ) : pagination.pageItems.map((product, index) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-white/5"
                      checked={isSelected(product.id)}
                      onChange={() => toggleOne(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="text-slate-400">{pagination.rangeStart + index}</td>
                  <td>
                    <div className="product-thumb">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                            const fallback = event.currentTarget.nextElementSibling
                            if (fallback) fallback.hidden = false
                          }}
                        />
                      ) : null}
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                        hidden={Boolean(product.imageUrl)}
                      >
                        N/A
                      </span>
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
                          disabled={loadingProducts || statusUpdatingId === product.id}
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
                          disabled={loadingProducts || statusUpdatingId === product.id}
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
                    <div className="flex flex-col items-stretch gap-1.5">
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
                          disabled={deletingId === product.id}
                        >
                          <Icon path={paths.delete} />
                        </button>
                      </div>
                      <select
                        value={product.approvalStatus || 'Pending'}
                        onChange={(event) => changeApproval(product.id, event.target.value)}
                        disabled={approvalUpdatingId === product.id || loadingProducts}
                        className="glass-input rounded-lg px-2 py-1 text-xs"
                        aria-label={`Approval status for ${product.name}`}
                      >
                        {APPROVAL_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loadingProducts && filteredProducts.length > 0 ? (
          <TablePagination
            {...pagination}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.changePageSize}
            itemLabel="products"
          />
        ) : null}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        product={editingProduct}
      />
      <ProductExcelUploadModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={() => {
          loadProducts()
          setToastSuccess('Excel products uploaded successfully.')
        }}
        onOpenFullPage={() => {
          setExcelModalOpen(false)
          onNavigate?.('bulk-upload-products')
        }}
      />
      <ProductViewModal
        open={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        productId={viewingProduct?.id}
      />
      <DeleteConfirmModal
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deleteProduct(deletingProduct.id)}
        itemName={deletingProduct?.name || ''}
        title="Delete Item"
        confirming={Boolean(deletingId)}
      />
      <DeleteConfirmModal
        open={bulkDeleteOpen}
        onClose={() => !bulkDeleting && setBulkDeleteOpen(false)}
        onConfirm={bulkDeleteProducts}
        title="Delete Selected Products"
        count={selectedCount}
        confirming={bulkDeleting}
      />
    </section>
  )
}
