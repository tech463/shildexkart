import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { BANNER_POSITIONS, BANNERS_DATA } from '../data/banners'
import { PAGE_CONFIGS } from '../data/pages'

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

const MAIN_CATEGORY_OPTIONS = [
  ...new Set([
    'School Shoes',
    ...(PAGE_CONFIGS['main-category']?.rows?.map((row) => row.name) || []),
  ]),
]

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

function parseBannerDate(value) {
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

function isWithinDateRange(banner, startDate, endDate) {
  if (!startDate && !endDate) return true
  const created = parseBannerDate(banner.created)
  const updated = parseBannerDate(banner.updated)
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

function needsCategoryContext(position) {
  return position === 'Main Category' || position === 'Category'
}

function buildCategoryContext(position, mainCategory) {
  if (!needsCategoryContext(position) || !mainCategory) return 'None'
  return `Main Category: ${mainCategory}`
}

function parseMainCategory(categoryContext = '') {
  const match = String(categoryContext).match(/^Main Category:\s*(.+)$/i)
  return match?.[1]?.trim() || MAIN_CATEGORY_OPTIONS[0] || ''
}

function BannerViewModal({ open, onClose, banner }) {
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

  if (!open || !banner) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-banner-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-banner-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Banner</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="product-view-image">
            {banner.imageUrl ? (
              <img src={banner.imageUrl} alt={`${banner.position} banner`} />
            ) : (
              <span className="text-sm text-slate-500">No image</span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Position</p>
              <p className="text-sm font-semibold text-slate-200">{banner.position}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <p className={`text-sm font-semibold ${banner.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                {banner.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Category Context</p>
              <p className="text-sm text-slate-300">{banner.categoryContext}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{banner.created}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Updated</p>
              <p className="text-sm text-slate-300">{banner.updated}</p>
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

function BannerModal({ open, onClose, onSubmit, banner = null }) {
  const isEdit = Boolean(banner)
  const [position, setPosition] = useState(BANNER_POSITIONS[0])
  const [mainCategory, setMainCategory] = useState(MAIN_CATEGORY_OPTIONS[0] || '')
  const [status, setStatus] = useState('Active')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    if (banner) {
      setPosition(banner.position || BANNER_POSITIONS[0])
      setMainCategory(parseMainCategory(banner.categoryContext))
      setStatus(banner.active ? 'Active' : 'Inactive')
      setImageFile(null)
      setImagePreview(banner.imageUrl || '')
    } else {
      setPosition(BANNER_POSITIONS[0])
      setMainCategory(MAIN_CATEGORY_OPTIONS[0] || '')
      setStatus('Active')
      setImageFile(null)
      setImagePreview('')
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
  }, [open, onClose, banner])

  if (!open) return null

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
    if (!isEdit && !imageFile && !imagePreview) {
      setError('Please upload a banner image.')
      return
    }
    if (!position) {
      setError('Please select a position.')
      return
    }
    if (needsCategoryContext(position) && !mainCategory) {
      setError('Please select a main category.')
      return
    }

    onSubmit({
      id: banner?.id,
      position,
      categoryContext: buildCategoryContext(position, mainCategory),
      active: status === 'Active',
      image: imageFile,
      imageUrl: imageFile ? undefined : (banner?.imageUrl || imagePreview || ''),
      keepImage: isEdit && !imageFile && Boolean(banner?.imageUrl),
    })
  }

  const fieldPrefix = isEdit ? 'edit-banner' : 'add-banner'
  const showCategory = needsCategoryContext(position)

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
            <span className="vendor-modal-title-accent">Banner</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-5">
            <div>
              <label htmlFor={`${fieldPrefix}-image`} className="vendor-field-label">Image</label>
              <label
                htmlFor={`${fieldPrefix}-image`}
                className={`vendor-upload-zone category-upload-zone${imagePreview ? ' has-preview' : ''}`}
              >
                <input
                  id={`${fieldPrefix}-image`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => selectImage(event.target.files?.[0] || null)}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Banner preview" />
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

            <div className={`grid gap-4 ${showCategory ? 'sm:grid-cols-2' : ''}`}>
              <div>
                <label htmlFor={`${fieldPrefix}-position`} className="vendor-field-label">Position</label>
                <select
                  id={`${fieldPrefix}-position`}
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  className="glass-input vendor-field-input"
                >
                  {BANNER_POSITIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {showCategory ? (
                <div>
                  <label htmlFor={`${fieldPrefix}-category`} className="vendor-field-label">Main Category</label>
                  <select
                    id={`${fieldPrefix}-category`}
                    value={mainCategory}
                    onChange={(event) => setMainCategory(event.target.value)}
                    className="glass-input vendor-field-input"
                  >
                    {MAIN_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor={`${fieldPrefix}-status`} className="vendor-field-label">Status</label>
              <select
                id={`${fieldPrefix}-status`}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="glass-input vendor-field-input"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>

          <div className="vendor-modal-footer !justify-stretch gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-glass vendor-btn-submit flex-1">
              {isEdit ? 'Save Changes' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Banners({ onNavigate }) {
  const [banners, setBanners] = useState(() => BANNERS_DATA.map((banner) => ({ ...banner })))
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [viewingBanner, setViewingBanner] = useState(null)
  const [deletingBanner, setDeletingBanner] = useState(null)

  const filteredBanners = useMemo(() => {
    const search = query.trim().toLowerCase()
    return banners.filter((banner) => (
      (!search
        || banner.position.toLowerCase().includes(search)
        || banner.categoryContext.toLowerCase().includes(search))
      && (!position || banner.position === position)
      && (!status || (status === 'Active') === banner.active)
      && isWithinDateRange(banner, startDate, endDate)
    ))
  }, [banners, query, position, status, startDate, endDate])

  const refresh = () => {
    setQuery('')
    setPosition('')
    setStatus('')
    setStartDate('')
    setEndDate('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBanner(null)
  }

  const openAddModal = () => {
    setEditingBanner(null)
    setModalOpen(true)
  }

  const openEditModal = (banner) => {
    setEditingBanner(banner)
    setModalOpen(true)
  }

  const toggleBanner = (id) => {
    setBanners((current) => current.map((banner) => (
      banner.id === id ? { ...banner, active: !banner.active } : banner
    )))
  }

  const deleteBanner = (id) => {
    setBanners((current) => current.filter((banner) => banner.id !== id))
    setDeletingBanner(null)
  }

  const addBanner = (payload) => {
    const stamp = formatTimestamp()
    const imageUrl = payload.image ? URL.createObjectURL(payload.image) : (payload.imageUrl || '')
    setBanners((current) => [
      {
        id: Date.now(),
        imageUrl,
        position: payload.position,
        categoryContext: payload.categoryContext,
        created: stamp,
        updated: stamp,
        active: payload.active,
      },
      ...current,
    ])
    closeModal()
  }

  const updateBanner = (payload) => {
    const stamp = formatTimestamp()
    setBanners((current) => current.map((banner) => {
      if (banner.id !== payload.id) return banner
      const imageUrl = payload.image
        ? URL.createObjectURL(payload.image)
        : (payload.keepImage ? banner.imageUrl : (payload.imageUrl || banner.imageUrl))
      return {
        ...banner,
        imageUrl,
        position: payload.position,
        categoryContext: payload.categoryContext,
        active: payload.active,
        updated: stamp,
      }
    }))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingBanner) updateBanner(payload)
    else addBanner(payload)
  }

  return (
    <section id="page-banners" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Banners</h2>
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
          <span>Banners</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#00A3FF' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Banners List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-48"
              />
            </div>
            <select
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Position</option>
              {BANNER_POSITIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
              aria-label="Add banner"
              onClick={openAddModal}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="rounded border-white/20 bg-white/5" /></th>
                <th>S.No</th>
                <th>Image</th>
                <th>Position</th>
                <th>Category Context</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No banners found for the selected filters.
                  </td>
                </tr>
              ) : filteredBanners.map((banner, index) => (
                <tr key={banner.id}>
                  <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                  <td className="text-slate-400">{index + 1}</td>
                  <td>
                    <div className="banner-thumb">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={`${banner.position} banner`} />
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">No image</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="banner-position-badge">{banner.position}</span>
                  </td>
                  <td className="text-slate-400">{banner.categoryContext}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <label className="toggle-switch">
                        <input type="checkbox" checked={banner.active} onChange={() => toggleBanner(banner.id)} />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`text-xs font-semibold ${banner.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[200px]">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div><span className="ts-badge ts-created">CREATED</span>{banner.created}</div>
                      <div><span className="ts-badge ts-updated">UPDATED</span>{banner.updated}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`View banner ${banner.position}`}
                        onClick={() => setViewingBanner(banner)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit banner ${banner.position}`}
                        onClick={() => openEditModal(banner)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBanner(banner)}
                        className="action-btn action-btn-danger"
                        aria-label={`Delete banner ${banner.position}`}
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

      <BannerModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        banner={editingBanner}
      />
      <BannerViewModal
        open={Boolean(viewingBanner)}
        onClose={() => setViewingBanner(null)}
        banner={viewingBanner}
      />
      <DeleteConfirmModal
        open={Boolean(deletingBanner)}
        onClose={() => setDeletingBanner(null)}
        onConfirm={() => deleteBanner(deletingBanner.id)}
        itemName={deletingBanner ? `${deletingBanner.position} banner` : ''}
        title="Delete Item"
      />
    </section>
  )
}
