import { useMemo, useRef, useState } from 'react'
import { PAGE_CONFIGS } from '../data/pages'
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

const brands = ['Select brand', 'SheildX', 'Urban Core', 'Street Lab', 'box', 'Jikra']
const tags = ['New Arrival', 'Best Seller', 'Limited', 'Sale']
const stockStatuses = ['In Stock', 'Out of Stock', 'On Backorder']
const productStatuses = ['Draft', 'Pending', 'Approved', 'Online']
const visibilities = ['Visible', 'Catalog', 'Search', 'Hidden']
const approvalStatuses = ['Pending', 'Approved', 'Rejected']

const categoryRows = (PAGE_CONFIGS.category?.rows || []).filter((row) => row.active !== false)
const subCategoryRows = (PAGE_CONFIGS['sub-category']?.rows || []).filter((row) => row.active !== false)

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

function RichEditor({ label }) {
  const [mode, setMode] = useState('visual')
  const [value, setValue] = useState('')

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
          onChange={(event) => setValue(event.target.value)}
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
  const coverInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [downloadable, setDownloadable] = useState(false)
  const [virtual, setVirtual] = useState(false)
  const [category, setCategory] = useState(categoryRows[0]?.name || '')
  const [subCategory, setSubCategory] = useState('')
  const [price, setPrice] = useState('0.00')
  const [discountedPrice, setDiscountedPrice] = useState('0.00')
  const [brand, setBrand] = useState('Select brand')
  const [selectedTags, setSelectedTags] = useState([])
  const [sku, setSku] = useState('')
  const [stockStatus, setStockStatus] = useState('In Stock')
  const [manageStock, setManageStock] = useState(false)
  const [soldIndividually, setSoldIndividually] = useState(false)
  const [productStatus, setProductStatus] = useState('Draft')
  const [approvalStatus, setApprovalStatus] = useState('Pending')
  const [visibility, setVisibility] = useState('Visible')
  const [purchaseNote, setPurchaseNote] = useState('')
  const [enableReviews, setEnableReviews] = useState(true)
  const [coverPreview, setCoverPreview] = useState(null)
  const [gallery, setGallery] = useState([])
  const [inventoryOpen, setInventoryOpen] = useState(true)
  const [otherOpen, setOtherOpen] = useState(true)
  const [saved, setSaved] = useState(false)

  const subCategoryOptions = useMemo(
    () => subCategoryRows.filter((row) => row.parent === category).map((row) => row.name),
    [category],
  )

  const activeSubCategory = subCategoryOptions.includes(subCategory)
    ? subCategory
    : subCategoryOptions[0] || ''

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
      Boolean(category),
      Boolean(activeSubCategory),
      Number.parseFloat(price) > 0,
      brand !== 'Select brand',
      Boolean(coverPreview),
      Boolean(sku.trim()),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [title, category, activeSubCategory, price, brand, coverPreview, sku])

  const handleCategoryChange = (value) => {
    setCategory(value)
    const next = subCategoryRows
      .filter((row) => row.parent === value)
      .map((row) => row.name)
    setSubCategory(next[0] || '')
  }

  const onCoverChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
  }

  const onGalleryChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setGallery((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    ])
  }

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="page-view">
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
            <span>Create</span>
          </nav>
          <h2 className="title-xl !text-2xl">Add New Product</h2>
          <p className="mt-1 text-sm text-slate-400">
            Build a catalog listing with media, pricing, inventory, and storefront options.
          </p>
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

      {saved ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
          Product saved (frontend only)
        </div>
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
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setVirtual(false)
                  setDownloadable(false)
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  !virtual && !downloadable
                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Physical Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setVirtual(true)
                  setDownloadable(true)
                }}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  virtual || downloadable
                    ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Digital Product
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Category</FieldLabel>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(event) => handleCategoryChange(event.target.value)}
                    className="glass-input vendor-field-input appearance-none pr-10"
                  >
                    <option value="">- Select Category -</option>
                    {categoryRows.map((item) => (
                      <option key={item.id} value={item.name}>
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
                <FieldLabel>Sub-category</FieldLabel>
                <div className="relative">
                  <select
                    value={activeSubCategory}
                    onChange={(event) => setSubCategory(event.target.value)}
                    disabled={!category || subCategoryOptions.length === 0}
                    className="glass-input vendor-field-input appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!category ? (
                      <option value="">Select category first</option>
                    ) : subCategoryOptions.length === 0 ? (
                      <option value="">No sub-categories</option>
                    ) : (
                      subCategoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
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
              >
                {brands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <FieldLabel>Tags</FieldLabel>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedTags.length === 0 ? (
                    <span className="text-sm text-slate-500">Select product tags</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-medium text-brand-300"
                      >
                        {tag} ×
                      </button>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition ${
                        selectedTags.includes(tag)
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-white/10 text-slate-400 hover:border-brand-500/40 hover:text-brand-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="neo-card glass-card space-y-4 p-5 md:p-6">
            <span className="card-accent" aria-hidden="true" />
            <RichEditor label="Short Description" />
            <RichEditor label="Description" />
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
                />
              </div>
              <div>
                <FieldLabel>Stock Status</FieldLabel>
                <select
                  value={stockStatus}
                  onChange={(event) => setStockStatus(event.target.value)}
                  className="glass-input vendor-field-input"
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
                />
                Track stock quantity
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={soldIndividually}
                  onChange={(event) => setSoldIndividually(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
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
                  >
                    {approvalStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
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
                />
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={enableReviews}
                  onChange={(event) => setEnableReviews(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                Enable product reviews
              </label>
            </CollapsibleSection>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-2">
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400"
            >
              Save Product
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('products')}
              className="btn-glass rounded-xl px-4 py-3 text-sm font-medium"
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
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="vendor-upload-zone flex min-h-[220px] w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center"
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
              />
              <div className="flex flex-wrap gap-2">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="h-16 w-16 overflow-hidden rounded-xl border border-white/10"
                  >
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-slate-400 transition hover:border-brand-500/50 hover:text-brand-300"
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
                {activeSubCategory || 'Subcategory'} | {category || 'Category'}
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
              <h3 className="text-sm font-bold text-slate-100">SEO</h3>
              <span className="text-xs text-slate-500">Search preview</span>
            </div>
            <p className="text-sm font-semibold text-sky-400">
              {title.trim() || 'Untitled product'} — ShieldX Kart
            </p>
            <p className="mt-1 text-xs text-emerald-500/80">
              shieldxkart.com/product/{(title.trim() || 'untitled-product').toLowerCase().replace(/\s+/g, '-')}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Add a strong title and description so this product ranks better in search results.
            </p>
          </section>
        </aside>
      </div>
    </form>
  )
}
