import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BrandIcon,
  ChevronIcon,
  InventoryIcon,
  LayersIcon,
  ListIcon,
  ProductsIcon,
  SettingsIcon,
  TagIcon,
} from '../components/Icons'
import {
  createProductAPI,
  fetchCategoriesByMainAPI,
  fetchProductByIdAPI,
  fetchProductFormOptionsAPI,
  fetchSubCategoriesByMainAPI,
  updateProductAPI,
} from '../services/productService'
import { buildProductFormData } from '../utils/productForm'

const FALLBACK_STOCK_STATUSES = ['In Stock', 'Out of Stock', 'On Backorder']
const FALLBACK_VISIBILITIES = ['Visible', 'Catalog', 'Search', 'Hidden']
const productStatuses = ['Draft', 'Pending', 'Approved', 'Online']
const approvalStatuses = ['Pending', 'Approved', 'Rejected']

function formatRupee(value) {
  const amount = Number(value) || 0
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function FieldLabel({ children, hint, action }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="vendor-field-label !mb-0 flex items-center gap-1.5">
        {children}
        {hint ? (
          <span title={hint} className="text-slate-500">
            ?
          </span>
        ) : null}
      </label>
      {action}
    </div>
  )
}

function RichEditor({ label, value, onChange }) {
  const [mode, setMode] = useState('visual')

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="vendor-field-label !mb-0">{label}</span>
        <div className="flex overflow-hidden rounded-xl border border-white/10 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`px-3 py-1.5 transition ${
              mode === 'visual'
                ? 'bg-brand-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            className={`border-l border-white/10 px-3 py-1.5 transition ${
              mode === 'code'
                ? 'bg-brand-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Code
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {mode === 'visual' && (
          <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.03] px-2 py-1.5 text-slate-500">
            <select className="glass-input rounded-lg px-2 py-1 text-xs">
              <option>Paragraph</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
            </select>
            {['B', 'I', '•', '1.', '❝', '↔'].map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-lg px-2 py-1 text-xs transition hover:bg-white/10 hover:text-slate-200"
              >
                {item}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          rows={label === 'Description' ? 9 : 5}
          placeholder={
            mode === 'code'
              ? '<!-- HTML content -->'
              : `Write your ${label.toLowerCase()}...`
          }
          className="w-full resize-y border-0 bg-transparent px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  )
}

function ChipMultiSelect({ label, options, selected, onToggle, emptyHint }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="text-sm text-slate-500">{emptyHint}</span>
          ) : (
            selected.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300"
              >
                {item} ×
              </button>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
          {options.length === 0 ? (
            <span className="text-xs text-slate-500">No options available</span>
          ) : (
            options.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                  selected.includes(item)
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-white/10 text-slate-400 hover:border-brand-500/40 hover:text-brand-300'
                }`}
              >
                {item}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CollapsibleSection({ icon: Icon, title, subtitle, open, onToggle, children }) {
  return (
    <section className="neo-card glass-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-100">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <ChevronIcon
          className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-white/10 px-5 py-5">{children}</div>
      ) : null}
    </section>
  )
}

export default function AddProduct({ onNavigate }) {
  const { id: editId } = useParams()
  const isEdit = Boolean(editId)

  const coverInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [mainCategories, setMainCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [subCategories, setSubCategories] = useState([])
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false)
  const [brands, setBrands] = useState([])
  const [sizeOptions, setSizeOptions] = useState([])
  const [colorOptions, setColorOptions] = useState([])
  const [tagOptions, setTagOptions] = useState([])
  const [stockStatuses, setStockStatuses] = useState(FALLBACK_STOCK_STATUSES)
  const [visibilities, setVisibilities] = useState(FALLBACK_VISIBILITIES)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [productLoading, setProductLoading] = useState(isEdit)

  const [title, setTitle] = useState('')
  const [downloadable, setDownloadable] = useState(false)
  const [virtual, setVirtual] = useState(false)
  const [mainCategoryId, setMainCategoryId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [price, setPrice] = useState('0.00')
  const [discountedPrice, setDiscountedPrice] = useState('0.00')
  const [brand, setBrand] = useState('Select brand')
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [stockStatus, setStockStatus] = useState('In Stock')
  const [manageStock, setManageStock] = useState(false)
  const [soldIndividually, setSoldIndividually] = useState(false)
  const [productStatus, setProductStatus] = useState('Draft')
  const [approvalStatus, setApprovalStatus] = useState('Pending')
  const [visibility, setVisibility] = useState('Visible')
  const [purchaseNote, setPurchaseNote] = useState('')
  const [enableReviews, setEnableReviews] = useState(true)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [gallery, setGallery] = useState([])
  const [inventoryOpen, setInventoryOpen] = useState(true)
  const [otherOpen, setOtherOpen] = useState(true)
  const [seoOpen, setSeoOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitAction, setSubmitAction] = useState(null)
  const [toastSuccess, setToastSuccess] = useState('')
  const [toastError, setToastError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadOptions = async () => {
      setOptionsLoading(true)
      try {
        const response = await fetchProductFormOptionsAPI()
        const data = response?.data || {}
        if (cancelled) return
        setMainCategories(Array.isArray(data.mainCategories) ? data.mainCategories : [])
        setCategories([])
        setSubCategories([])
        setBrands(Array.isArray(data.brands) ? data.brands : [])
        setSizeOptions(Array.isArray(data.sizes) ? data.sizes : [])
        setColorOptions(Array.isArray(data.colors) ? data.colors : [])
        setTagOptions(Array.isArray(data.tags) ? data.tags : [])
        setStockStatuses(
          Array.isArray(data.stockStatuses) && data.stockStatuses.length
            ? data.stockStatuses
            : FALLBACK_STOCK_STATUSES,
        )
        setVisibilities(
          Array.isArray(data.visibilities) && data.visibilities.length
            ? data.visibilities
            : FALLBACK_VISIBILITIES,
        )
      } catch {
        if (cancelled) return
        setMainCategories([])
        setCategories([])
        setSubCategories([])
        setBrands([])
        setSizeOptions([])
        setColorOptions([])
        setTagOptions([])
        setStockStatuses(FALLBACK_STOCK_STATUSES)
        setVisibilities(FALLBACK_VISIBILITIES)
      } finally {
        if (!cancelled) setOptionsLoading(false)
      }
    }

    loadOptions()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toastSuccess && !toastError) return undefined
    const id = window.setTimeout(() => {
      setToastSuccess('')
      setToastError('')
    }, 3500)
    return () => window.clearTimeout(id)
  }, [toastSuccess, toastError])

  const selectedMainCategory = useMemo(
    () =>
      mainCategories.find((item) => String(item.id) === String(mainCategoryId)) || null,
    [mainCategories, mainCategoryId],
  )

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === String(categoryId)) || null,
    [categories, categoryId],
  )

  const selectedSubCategory = useMemo(
    () =>
      subCategories.find((item) => String(item.id) === String(subCategoryId)) || null,
    [subCategories, subCategoryId],
  )

  const activeSubCategoryId = selectedSubCategory
    ? String(selectedSubCategory.id)
    : ''

  const netTotal = useMemo(() => {
    const sale = Number.parseFloat(discountedPrice)
    const regular = Number.parseFloat(price)
    if (!Number.isNaN(sale) && sale > 0) return sale
    if (!Number.isNaN(regular)) return regular
    return 0
  }, [price, discountedPrice])

  const completeness = useMemo(() => {
    const checks = [
      Boolean(title.trim()),
      Boolean(mainCategoryId),
      Boolean(categoryId),
      Boolean(activeSubCategoryId),
      Number.parseFloat(price) > 0,
      brand !== 'Select brand',
      Boolean(coverFile || coverPreview),
      Boolean(sku.trim()),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [
    title,
    mainCategoryId,
    categoryId,
    activeSubCategoryId,
    price,
    brand,
    coverFile,
    coverPreview,
    sku,
  ])

  const handleMainCategoryChange = async (value) => {
    setMainCategoryId(value)
    setCategoryId('')
    setSubCategoryId('')
    setCategories([])
    setSubCategories([])

    if (!value) return

    setCategoriesLoading(true)
    try {
      const response = await fetchCategoriesByMainAPI(value)
      const rows = Array.isArray(response?.data) ? response.data : []
      setCategories(rows)
      if (rows[0]) {
        const nextCategoryId = String(rows[0].id)
        setCategoryId(nextCategoryId)
        await loadSubCategories(value, nextCategoryId)
      }
    } catch {
      setCategories([])
      setToastError('Could not load categories for this main category.')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const loadSubCategories = async (mainId, catId, preferredSubId = '') => {
    if (!mainId && !catId) {
      setSubCategories([])
      setSubCategoryId('')
      return
    }

    setSubCategoriesLoading(true)
    try {
      const response = await fetchSubCategoriesByMainAPI({
        mainCategoryId: mainId || undefined,
        categoryId: catId || undefined,
      })
      const rows = Array.isArray(response?.data) ? response.data : []
      setSubCategories(rows)
      if (preferredSubId && rows.some((row) => String(row.id) === String(preferredSubId))) {
        setSubCategoryId(String(preferredSubId))
      } else {
        setSubCategoryId(rows[0] ? String(rows[0].id) : '')
      }
    } catch {
      setSubCategories([])
      setSubCategoryId('')
      setToastError('Could not load sub-categories.')
    } finally {
      setSubCategoriesLoading(false)
    }
  }

  const handleCategoryChange = async (value) => {
    setCategoryId(value)
    setSubCategoryId('')
    setSubCategories([])
    if (!value) return
    await loadSubCategories(mainCategoryId, value)
  }

  // Load existing product for edit (after form options are ready)
  useEffect(() => {
    if (!isEdit || optionsLoading) return undefined

    let cancelled = false

    const loadProduct = async () => {
      setProductLoading(true)
      setToastError('')
      try {
        const response = await fetchProductByIdAPI(editId)
        const product = response?.data
        if (cancelled) return
        if (!product) {
          setToastError('Product not found.')
          return
        }

        setTitle(product.title || product.name || '')
        setSku(product.sku || '')
        setBrand(product.brand || 'Select brand')
        setPrice(String(product.price ?? '0.00'))
        setDiscountedPrice(String(product.discounted_price ?? '0.00'))
        setShortDescription(product.short_description || '')
        setDescription(product.description || '')
        setStockStatus(product.stock_status || 'In Stock')
        setManageStock(Boolean(product.manage_stock))
        setSoldIndividually(Boolean(product.allow_backorder))
        setVirtual(product.product_type === 'digital')
        setDownloadable(product.product_type === 'digital')
        setVisibility(product.visibility || 'Visible')
        setPurchaseNote(product.purchase_note || '')
        setEnableReviews(product.enable_reviews !== false)
        setMetaTitle(product.meta_title || '')
        setMetaDescription(product.meta_description || '')
        setMetaKeywords(product.meta_keywords || '')
        setOgTitle(product.og_title || '')
        setOgDescription(product.og_description || '')
        setCanonicalUrl(product.canonical_url || '')
        setSelectedTags(Array.isArray(product.tags) ? product.tags : [])
        setSelectedSizes(Array.isArray(product.sizes) ? product.sizes : [])
        setSelectedColors(Array.isArray(product.colors) ? product.colors : [])
        setCoverPreview(product.cover_image || null)
        setCoverFile(null)
        setGallery(
          Array.isArray(product.gallery)
            ? product.gallery.map((url, index) => ({
                id: `existing-${index}`,
                url,
                name: `gallery-${index + 1}`,
                file: null,
              }))
            : [],
        )

        if (product.status === 'draft') setProductStatus('Draft')
        else if (product.status === 'pending') setProductStatus('Pending')
        else if (product.status === 'published') setProductStatus('Online')
        else setProductStatus('Draft')

        if (product.approval_status === 'approved') setApprovalStatus('Approved')
        else if (product.approval_status === 'rejected') setApprovalStatus('Rejected')
        else setApprovalStatus('Pending')

        const mainId = product.main_category_id ? String(product.main_category_id) : ''
        const catId = product.category_id ? String(product.category_id) : ''
        const subId = product.sub_category_id ? String(product.sub_category_id) : ''

        setMainCategoryId(mainId)
        setCategoryId('')
        setSubCategoryId('')
        setCategories([])
        setSubCategories([])

        if (mainId) {
          setCategoriesLoading(true)
          try {
            const catRes = await fetchCategoriesByMainAPI(mainId)
            if (cancelled) return
            const catRows = Array.isArray(catRes?.data) ? catRes.data : []
            setCategories(catRows)
            const nextCatId =
              catId && catRows.some((row) => String(row.id) === catId)
                ? catId
                : catRows[0]
                  ? String(catRows[0].id)
                  : ''
            setCategoryId(nextCatId)
            if (nextCatId) {
              await loadSubCategories(mainId, nextCatId, subId)
            }
          } catch {
            if (!cancelled) setToastError('Could not load category hierarchy for this product.')
          } finally {
            if (!cancelled) setCategoriesLoading(false)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setToastError(
            err?.response?.data?.message || err?.message || 'Failed to load product.',
          )
        }
      } finally {
        if (!cancelled) setProductLoading(false)
      }
    }

    loadProduct()
    return () => {
      cancelled = true
    }
  }, [isEdit, editId, optionsLoading])

  const onCoverChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const onGalleryChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setGallery((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    ])
    event.target.value = ''
  }

  const removeGalleryItem = (id) => {
    setGallery((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.url?.startsWith('blob:')) URL.revokeObjectURL(target.url)
      return prev.filter((item) => item.id !== id)
    })
  }

  const toggleChip = (setter) => (value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  const buildFields = () => ({
    title: title.trim(),
    sku: sku.trim(),
    brand,
    main_category_id: mainCategoryId || '',
    category_id: categoryId || selectedCategory?.id || '',
    sub_category_id: activeSubCategoryId || '',
    short_description: shortDescription,
    description,
    price,
    discounted_price: discountedPrice,
    stock_status: stockStatus,
    manage_stock: manageStock,
    allow_backorder: soldIndividually,
    product_type: virtual || downloadable ? 'digital' : 'physical',
    visibility,
    purchase_note: purchaseNote,
    enable_reviews: enableReviews,
    meta_title: metaTitle,
    meta_description: metaDescription,
    meta_keywords: metaKeywords,
    og_title: ogTitle,
    og_description: ogDescription,
    canonical_url: canonicalUrl,
    sizes: selectedSizes,
    colors: selectedColors,
    tags: selectedTags,
  })

  const handleSubmit = async (action) => {
    if (submitting) return

    if (!title.trim()) {
      setToastError('Product title is required.')
      setToastSuccess('')
      return
    }

    setSubmitting(true)
    setSubmitAction(action)
    setToastError('')
    setToastSuccess('')

    try {
      const formData = buildProductFormData(buildFields(), {
        action,
        coverFile,
        galleryFiles: gallery.map((item) => item.file).filter(Boolean),
      })
      const response = isEdit
        ? await updateProductAPI(editId, formData)
        : await createProductAPI(formData)
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to save product.')
      }
      setToastSuccess(
        response.message ||
          (isEdit
            ? 'Product updated successfully.'
            : action === 'publish'
              ? 'Product published successfully.'
              : 'Draft saved successfully.'),
      )
      window.setTimeout(() => onNavigate?.('products'), 900)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save product. Please try again.'
      setToastError(msg)
    } finally {
      setSubmitting(false)
      setSubmitAction(null)
    }
  }

  const categoryLabel = selectedMainCategory?.name || ''
  const middleCategoryLabel = selectedCategory?.name || ''
  const subCategoryLabel = selectedSubCategory?.name || ''

  if (productLoading) {
    return (
      <section className="page-view">
        <div className="neo-card glass-card p-8 text-sm text-slate-400">
          Loading product…
        </div>
      </section>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit('draft')
      }}
      className="page-view"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav className="breadcrumb mb-2" aria-label="Breadcrumb">
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
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault()
                onNavigate?.('products')
              }}
            >
              Products
            </a>
            <span className="mx-2 text-slate-600">›</span>
            <span>{isEdit ? 'Edit' : 'Create'}</span>
          </nav>
          <h2 className="title-xl !text-2xl">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {isEdit
              ? 'Update listing details, media, pricing, inventory, and storefront options.'
              : 'Build a catalog listing with media, pricing, inventory, and storefront options.'}
          </p>
          {!isEdit ? (
            <button
              type="button"
              onClick={() => onNavigate?.('bulk-upload-products')}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/20"
            >
              Prefer Excel? Upload products in bulk →
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Total progress</p>
            <p className="text-lg font-bold text-slate-100">{completeness}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Net total</p>
            <p className="text-lg font-bold text-slate-100">{formatRupee(netTotal)}</p>
          </div>
        </div>
      </div>

      {toastSuccess ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
          {toastSuccess}
        </div>
      ) : null}
      {toastError ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
          {toastError}
        </div>
      ) : null}
      {optionsLoading ? (
        <div className="mb-4 text-xs text-slate-500">Loading form options…</div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-5">
          <section className="neo-card glass-card p-5 md:p-6" style={{ '--accent': '#34d399' }}>
            <span className="card-accent" aria-hidden="true" />
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TagIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">General Information</h3>
                <p className="text-xs text-slate-500">Title, type, and catalog placement</p>
              </div>
            </div>

            <FieldLabel>Title</FieldLabel>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Product name.."
              className="glass-input vendor-field-input"
              disabled={submitting}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setVirtual(false)
                  setDownloadable(false)
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${
                  !virtual && !downloadable
                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Physical Product
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setVirtual(true)
                  setDownloadable(true)
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${
                  virtual || downloadable
                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Digital Product
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel>Main Category</FieldLabel>
                <div className="relative">
                  <select
                    value={mainCategoryId}
                    onChange={(event) => handleMainCategoryChange(event.target.value)}
                    className="glass-input vendor-field-input appearance-none pr-10"
                    disabled={submitting || optionsLoading}
                  >
                    <option value="">- Select Main Category -</option>
                    {mainCategories.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <ListIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    disabled={
                      submitting
                      || !mainCategoryId
                      || categoriesLoading
                      || categories.length === 0
                    }
                    className="glass-input vendor-field-input appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!mainCategoryId ? (
                      <option value="">Select main category first</option>
                    ) : categoriesLoading ? (
                      <option value="">Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="">No categories</option>
                    ) : (
                      <>
                        <option value="">- Select Category -</option>
                        {categories.map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <ListIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div>
                <FieldLabel>Sub-category</FieldLabel>
                <div className="relative">
                  <select
                    value={activeSubCategoryId}
                    onChange={(event) => setSubCategoryId(event.target.value)}
                    disabled={
                      submitting
                      || !categoryId
                      || subCategoriesLoading
                      || subCategories.length === 0
                    }
                    className="glass-input vendor-field-input appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!categoryId ? (
                      <option value="">Select category first</option>
                    ) : subCategoriesLoading ? (
                      <option value="">Loading sub-categories...</option>
                    ) : subCategories.length === 0 ? (
                      <option value="">No sub-categories</option>
                    ) : (
                      <>
                        <option value="">- Select Sub-category -</option>
                        {subCategories.map((item) => (
                          <option key={item.id} value={String(item.id)}>
                            {item.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <LayersIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="neo-card glass-card p-5 md:p-6" style={{ '--accent': '#00A3FF' }}>
            <span className="card-accent" aria-hidden="true" />
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                <BrandIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Pricing & Brand</h3>
                <p className="text-xs text-slate-500">Set sell price, discounts, and brand tags</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Price</FieldLabel>
                <div className="flex overflow-hidden rounded-xl border border-white/10 focus-within:border-brand-500/50">
                  <span className="bg-white/5 px-3 py-2.5 text-sm text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-slate-200 outline-none"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <FieldLabel
                  action={
                    <button type="button" className="text-sm font-medium text-brand-400 hover:underline">
                      Schedule
                    </button>
                  }
                >
                  Discounted Price
                </FieldLabel>
                <div className="flex overflow-hidden rounded-xl border border-white/10 focus-within:border-brand-500/50">
                  <span className="bg-white/5 px-3 py-2.5 text-sm text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(event) => setDiscountedPrice(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-slate-200 outline-none"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Brand</FieldLabel>
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="glass-input vendor-field-input"
                disabled={submitting}
              >
                <option value="Select brand">Select brand</option>
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <ChipMultiSelect
                label="Tags"
                options={tagOptions}
                selected={selectedTags}
                onToggle={toggleChip(setSelectedTags)}
                emptyHint="Select product tags"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ChipMultiSelect
                label="Sizes"
                options={sizeOptions}
                selected={selectedSizes}
                onToggle={toggleChip(setSelectedSizes)}
                emptyHint="Select sizes"
              />
              <ChipMultiSelect
                label="Colors"
                options={colorOptions}
                selected={selectedColors}
                onToggle={toggleChip(setSelectedColors)}
                emptyHint="Select colors"
              />
            </div>
          </section>

          <section className="neo-card glass-card space-y-4 p-5 md:p-6">
            <span className="card-accent" aria-hidden="true" />
            <RichEditor
              label="Short Description"
              value={shortDescription}
              onChange={setShortDescription}
            />
            <RichEditor
              label="Description"
              value={description}
              onChange={setDescription}
            />
          </section>

          <div className="space-y-4">
            <CollapsibleSection
              icon={InventoryIcon}
              title="Inventory"
              subtitle="Manage inventory for this product."
              open={inventoryOpen}
              onToggle={() => setInventoryOpen((value) => !value)}
            >
              <div>
                <FieldLabel>SKU (Stock Keeping Unit)</FieldLabel>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  className="glass-input vendor-field-input"
                  placeholder="e.g. SX-TEE-001"
                  disabled={submitting}
                />
              </div>
              <div>
                <FieldLabel>Stock Status</FieldLabel>
                <select
                  value={stockStatus}
                  onChange={(event) => setStockStatus(event.target.value)}
                  className="glass-input vendor-field-input"
                  disabled={submitting}
                >
                  {stockStatuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={manageStock}
                  onChange={(event) => setManageStock(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                  disabled={submitting}
                />
                Track stock quantity
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={soldIndividually}
                  onChange={(event) => setSoldIndividually(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                  disabled={submitting}
                />
                Allow customers to buy product even when out of stock
              </label>
            </CollapsibleSection>

            <CollapsibleSection
              icon={SettingsIcon}
              title="Other Settings"
              subtitle="Set your extra product options"
              open={otherOpen}
              onToggle={() => setOtherOpen((value) => !value)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Product Status</FieldLabel>
                  <select
                    value={productStatus}
                    onChange={(event) => setProductStatus(event.target.value)}
                    className="glass-input vendor-field-input"
                    disabled={submitting}
                  >
                    {productStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Visibility</FieldLabel>
                  <select
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value)}
                    className="glass-input vendor-field-input"
                    disabled={submitting}
                  >
                    {visibilities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Approval Status</FieldLabel>
                  <select
                    value={approvalStatus}
                    onChange={(event) => setApprovalStatus(event.target.value)}
                    className="glass-input vendor-field-input"
                    disabled={submitting}
                  >
                    {approvalStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Publish sets approval to approved + active; draft keeps it pending.
                  </p>
                </div>
              </div>

              <div>
                <FieldLabel>Purchase Note</FieldLabel>
                <textarea
                  value={purchaseNote}
                  onChange={(event) => setPurchaseNote(event.target.value)}
                  rows={4}
                  placeholder="Customer will get this info in their order email"
                  className="glass-input vendor-field-input resize-y"
                  disabled={submitting}
                />
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enableReviews}
                  onChange={(event) => setEnableReviews(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                  disabled={submitting}
                />
                Enable product reviews
              </label>
            </CollapsibleSection>

            <CollapsibleSection
              icon={TagIcon}
              title="SEO"
              subtitle="Meta tags and social preview fields"
              open={seoOpen}
              onToggle={() => setSeoOpen((value) => !value)}
            >
              <div>
                <FieldLabel>Meta Title</FieldLabel>
                <input
                  value={metaTitle}
                  onChange={(event) => setMetaTitle(event.target.value)}
                  placeholder={title.trim() || 'SEO title'}
                  className="glass-input vendor-field-input"
                  disabled={submitting}
                />
              </div>
              <div>
                <FieldLabel>Meta Description</FieldLabel>
                <textarea
                  value={metaDescription}
                  onChange={(event) => setMetaDescription(event.target.value)}
                  rows={3}
                  placeholder="Short description for search engines"
                  className="glass-input vendor-field-input resize-y"
                  disabled={submitting}
                />
              </div>
              <div>
                <FieldLabel>Meta Keywords</FieldLabel>
                <input
                  value={metaKeywords}
                  onChange={(event) => setMetaKeywords(event.target.value)}
                  placeholder="keyword, another keyword"
                  className="glass-input vendor-field-input"
                  disabled={submitting}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>OG Title</FieldLabel>
                  <input
                    value={ogTitle}
                    onChange={(event) => setOgTitle(event.target.value)}
                    placeholder={metaTitle || title.trim() || 'Social title'}
                    className="glass-input vendor-field-input"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <FieldLabel>Canonical URL</FieldLabel>
                  <input
                    value={canonicalUrl}
                    onChange={(event) => setCanonicalUrl(event.target.value)}
                    placeholder="https://shieldxkart.com/product/…"
                    className="glass-input vendor-field-input"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>OG Description</FieldLabel>
                <textarea
                  value={ogDescription}
                  onChange={(event) => setOgDescription(event.target.value)}
                  rows={3}
                  placeholder="Social share description"
                  className="glass-input vendor-field-input resize-y"
                  disabled={submitting}
                />
              </div>
            </CollapsibleSection>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('draft')}
              className="btn-glass rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && submitAction === 'draft'
                ? 'Saving…'
                : isEdit
                  ? 'Save Changes'
                  : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit('publish')}
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && submitAction === 'publish'
                ? 'Publishing…'
                : isEdit
                  ? 'Update & Publish'
                  : 'Publish'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => onNavigate?.('products')}
              className="btn-glass rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="neo-card glass-card overflow-hidden">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <ProductsIcon className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-bold text-slate-100">Media</h3>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCoverChange}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={submitting}
                className="vendor-upload-zone flex min-h-[220px] w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center disabled:opacity-50"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="max-h-52 w-full rounded-xl object-cover"
                  />
                ) : (
                  <>
                    <ProductsIcon className="h-9 w-9 text-slate-500" />
                    <span className="text-sm font-medium text-brand-400">
                      Upload Product Main Image
                    </span>
                  </>
                )}
              </button>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onGalleryChange}
                disabled={submitting}
              />
              <div className="flex flex-wrap gap-2">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-xl border border-white/10"
                  >
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(item.id)}
                      disabled={submitting}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={submitting}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-slate-400 transition hover:border-brand-500/50 hover:text-brand-300 disabled:opacity-50"
                  aria-label="Add gallery image"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          <section className="neo-card glass-card overflow-hidden">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 px-5 py-5">
              <div className="mb-3 text-xs uppercase tracking-wide text-slate-400">
                Product preview
              </div>
              <div className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center text-slate-600">
                    <ProductsIcon className="h-9 w-9" />
                  </div>
                )}
              </div>
              <p className="mt-4 truncate text-lg font-bold text-white">
                {title.trim() || 'Untitled product'}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {[subCategoryLabel, middleCategoryLabel, categoryLabel]
                  .filter(Boolean)
                  .join(' | ') || 'Category'}
              </p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xl font-bold text-white">{formatRupee(netTotal)}</p>
                  {Number.parseFloat(discountedPrice) > 0 && Number.parseFloat(price) > 0 ? (
                    <p className="text-xs text-slate-500 line-through">
                      {formatRupee(Number.parseFloat(price))}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                  {productStatus}
                </span>
              </div>
            </div>
            <div className="space-y-2 p-4 text-sm text-slate-400">
              <p>
                <span className="text-slate-500">SKU:</span> {sku || 'Not set'}
              </p>
              <p>
                <span className="text-slate-500">Stock:</span> {stockStatus}
              </p>
              <p>
                <span className="text-slate-500">Approval:</span> {approvalStatus}
              </p>
              {selectedSizes.length > 0 ? (
                <p>
                  <span className="text-slate-500">Sizes:</span> {selectedSizes.join(', ')}
                </p>
              ) : null}
              {selectedColors.length > 0 ? (
                <p>
                  <span className="text-slate-500">Colors:</span> {selectedColors.join(', ')}
                </p>
              ) : null}
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="neo-card glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">SEO preview</h3>
              <span className="text-xs text-slate-500">Search preview</span>
            </div>
            <p className="text-sm font-semibold text-sky-400">
              {(metaTitle.trim() || title.trim() || 'Untitled product')} — ShieldX Kart
            </p>
            <p className="mt-1 text-xs text-emerald-500/80">
              {canonicalUrl.trim() ||
                `shieldxkart.com/product/${(title.trim() || 'untitled-product').toLowerCase().replace(/\s+/g, '-')}`}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {metaDescription.trim() ||
                shortDescription.trim() ||
                'Add a strong title and description so this product ranks better in search results.'}
            </p>
          </section>
        </aside>
      </div>
    </form>
  )
}
