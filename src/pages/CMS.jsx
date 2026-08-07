import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import CmsRichEditor from '../components/CmsRichEditor'
import {
  createCMSAPI,
  deleteCMSAPI,
  fetchCMSListAPI,
  setCMSStatusAPI,
  updateCMSAPI,
} from '../services/cmsService'
import {
  createEmptyFaqItem,
  isFaqSlug,
  parseFaqPayload,
  serializeFaqPayload,
} from '../utils/faqCms'

const CMS_PAGE_PRESETS = [
  { slug: 'about-us', title: 'About Us', subtitle: 'Who we are' },
  { slug: 'contact', title: 'Contact Us', subtitle: 'We’re here to help' },
  { slug: 'faq', title: 'FAQ', subtitle: 'Frequently asked questions' },
  { slug: 'privacy', title: 'Privacy Policy', subtitle: 'How we handle your data' },
  { slug: 'terms', title: 'Terms & Policy', subtitle: 'Terms of use' },
  { slug: 'return', title: 'Return Policy', subtitle: 'Returns & exchanges' },
  { slug: 'cancellation', title: 'Cancellation Policy', subtitle: 'Order cancellations' },
]

function Icon({ path, paths: pathList, className = 'h-4 w-4' }) {
  const segments = pathList || (path ? path.split(' M').map((segment, index) => (index === 0 ? segment : `M${segment}`)) : [])
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      {segments.map((segment) => (
        <path key={segment} strokeLinecap="round" strokeLinejoin="round" d={segment} />
      ))}
    </svg>
  )
}

const paths = {
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  refresh: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 12H16.02',
  plus: 'M12 4.5v15m7.5-7.5h-15',
  close: 'M6 18 18 6M6 6l12 12',
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="vendor-field-label">
      {children}
    </label>
  )
}

function TextField({ id, label, value, onChange, placeholder, type = 'text', className = '', disabled = false }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        className={`glass-input vendor-field-input ${className}`.trim()}
      />
    </div>
  )
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

function CMSModal({ open, onClose, onSubmit, submitting, initialValues, mode = 'create' }) {
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const [form, setForm] = useState({
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  })
  const [faqItems, setFaqItems] = useState([createEmptyFaqItem()])
  const [faqIntro, setFaqIntro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setFieldErrors({})
    const nextForm = {
      slug: initialValues?.slug ?? '',
      title: initialValues?.title ?? '',
      subtitle: initialValues?.subtitle ?? '',
      description: initialValues?.description ?? '',
      meta_title: initialValues?.meta_title ?? '',
      meta_description: initialValues?.meta_description ?? '',
      meta_keywords: initialValues?.meta_keywords ?? '',
    }
    setForm(nextForm)

    if (isFaqSlug(nextForm.slug) || (nextForm.description || '').includes('"type":"faq"')) {
      const parsed = parseFaqPayload(nextForm.description)
      setFaqItems(parsed.items)
      setFaqIntro(parsed.intro || '')
    } else {
      setFaqItems([createEmptyFaqItem()])
      setFaqIntro('')
    }
  }, [open, initialValues])

  if (!open) return null

  const faqMode = isFaqSlug(form.slug)
  const set = (k) => (v) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v }
      if (k === 'slug' && isFaqSlug(v) && !isFaqSlug(prev.slug)) {
        const parsed = parseFaqPayload(prev.description)
        setFaqItems(parsed.items?.length ? parsed.items : [createEmptyFaqItem()])
        setFaqIntro(parsed.intro || '')
      }
      return next
    })
  }

  const updateFaqItem = (id, field, value) => {
    setFaqItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  const addFaqItem = () => {
    setFaqItems((current) => [...current, createEmptyFaqItem()])
  }

  const removeFaqItem = (id) => {
    setFaqItems((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)))
  }

  const validate = () => {
    const errors = {}
    if (!form.slug.trim()) errors.slug = 'Slug is required.'
    if (!form.title.trim()) errors.title = 'Title is required.'

    if (faqMode) {
      const validItems = faqItems.filter((item) => item.question.trim() && item.answer.trim())
      if (!validItems.length) errors.description = 'Add at least one FAQ question and answer.'
    } else {
      const plain = String(form.description || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
      if (!plain) errors.description = 'Page content is required.'
    }
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isView) return
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const payload = { ...form }
    if (faqMode) {
      payload.description = serializeFaqPayload({
        intro: faqIntro,
        items: faqItems,
      })
    }
    onSubmit(payload)
  }

  const applyPreset = (slug) => {
    const preset = CMS_PAGE_PRESETS.find((item) => item.slug === slug)
    if (!preset) return
    setForm((prev) => ({
      ...prev,
      slug: preset.slug,
      title: prev.title || preset.title,
      subtitle: prev.subtitle || preset.subtitle,
      meta_title: prev.meta_title || `${preset.title} | ShieldX`,
    }))
    if (isFaqSlug(preset.slug)) {
      setFaqItems((current) => (current[0]?.question ? current : [createEmptyFaqItem()]))
    }
  }

  const titleText = isView ? 'CMS Details' : isEdit ? 'Edit CMS Page' : 'Add CMS Page'
  const buttonText = isView ? '' : isEdit ? (submitting ? 'Updating...' : 'Update Page') : (submitting ? 'Creating...' : 'Create Page')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="vendor-modal vendor-modal-scroll rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl w-full max-w-5xl max-h-[92vh]">
        <div className="vendor-modal-header">
          <div>
            <h3 className="vendor-modal-title">{titleText}</h3>
            <p className="vendor-modal-subtitle">
              {faqMode
                ? 'FAQ uses dropdown Q&A items. Customers expand one question at a time on the website.'
                : 'Manage About Us, Contact, FAQ, and policy pages with rich text and alignment.'}
            </p>
          </div>
          <button type="button" className="vendor-modal-close" onClick={onClose} aria-label="Close">
            <Icon path={paths.close} className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
          {!isView ? (
            <div className="md:col-span-2">
              <FieldLabel htmlFor="cms-preset">Quick page type</FieldLabel>
              <select
                id="cms-preset"
                className="glass-input vendor-field-input"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) applyPreset(event.target.value)
                }}
              >
                <option value="">Select preset (About, Contact, FAQ…)</option>
                {CMS_PAGE_PRESETS.map((preset) => (
                  <option key={preset.slug} value={preset.slug}>
                    {preset.title} ({preset.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <TextField id="cms-slug" label="Slug" value={form.slug} onChange={set('slug')} placeholder="about-us" disabled={isView} />
            {fieldErrors.slug ? <p className="vendor-form-error mt-2">{fieldErrors.slug}</p> : null}
          </div>

          <div>
            <TextField id="cms-title" label="Title" value={form.title} onChange={set('title')} placeholder="About Us" disabled={isView} />
            {fieldErrors.title ? <p className="vendor-form-error mt-2">{fieldErrors.title}</p> : null}
          </div>

          <div className="md:col-span-2">
            <TextField id="cms-subtitle" label="Subtitle" value={form.subtitle} onChange={set('subtitle')} placeholder="Who we are" disabled={isView} />
          </div>

          {faqMode ? (
            <div className="md:col-span-2 space-y-4">
              <div>
                <FieldLabel htmlFor="cms-faq-intro">Intro text (optional)</FieldLabel>
                <textarea
                  id="cms-faq-intro"
                  value={faqIntro}
                  disabled={isView}
                  onChange={(event) => setFaqIntro(event.target.value)}
                  rows={2}
                  placeholder="Short intro shown above the FAQ dropdowns"
                  className="glass-input vendor-field-input"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">FAQ dropdowns</p>
                  <p className="text-xs text-slate-500">Each item becomes an expandable question on the storefront.</p>
                </div>
                {!isView ? (
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="rounded-xl bg-brand-500/20 px-3 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/30"
                  >
                    + Add question
                  </button>
                ) : null}
              </div>

              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Question {index + 1}
                      </p>
                      {!isView && faqItems.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeFaqItem(item.id)}
                          className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <input
                      value={item.question}
                      disabled={isView}
                      onChange={(event) => updateFaqItem(item.id, 'question', event.target.value)}
                      placeholder="e.g. How long does delivery take?"
                      className="glass-input vendor-field-input mb-3"
                    />
                    <textarea
                      value={item.answer}
                      disabled={isView}
                      onChange={(event) => updateFaqItem(item.id, 'answer', event.target.value)}
                      placeholder="Answer shown when customer expands this dropdown"
                      rows={3}
                      className="glass-input vendor-field-input"
                    />
                  </div>
                ))}
              </div>
              {fieldErrors.description ? <p className="vendor-form-error">{fieldErrors.description}</p> : null}
            </div>
          ) : (
            <div className="md:col-span-2">
              <FieldLabel htmlFor="cms-description">Page content</FieldLabel>
              <p className="mb-2 text-xs text-slate-500">
                Use the toolbar for bold, lists, links, and text alignment (left / center / right / justify).
              </p>
              <CmsRichEditor
                value={form.description}
                onChange={set('description')}
                readOnly={isView}
                placeholder="Write About Us, Contact, or policy content…"
              />
              {fieldErrors.description ? <p className="vendor-form-error mt-2">{fieldErrors.description}</p> : null}
            </div>
          )}

          <div>
            <TextField id="cms-meta-title" label="Meta Title" value={form.meta_title} onChange={set('meta_title')} placeholder="About ShieldX" disabled={isView} />
          </div>

          <div>
            <TextField
              id="cms-meta-description"
              label="Meta Description"
              value={form.meta_description}
              onChange={set('meta_description')}
              placeholder="Best ecommerce website..."
              disabled={isView}
            />
          </div>

          <div className="md:col-span-2">
            <TextField
              id="cms-meta-keywords"
              label="Meta Keywords"
              value={form.meta_keywords}
              onChange={set('meta_keywords')}
              placeholder="shopping, ecommerce..."
              disabled={isView}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="vendor-btn-cancel">
              Cancel
            </button>
            {!isView ? (
              <button type="submit" className="btn-glass vendor-btn-submit" disabled={submitting}>
                {buttonText}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CMS({ onNavigate }) {
  const [cms, setCms] = useState([])
  const [loadingCms, setLoadingCms] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Active') // UI label

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit | view
  const [selectedCMS, setSelectedCMS] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cmsStatusUpdatingId, setCmsStatusUpdatingId] = useState(null)
  const [deletingCMS, setDeletingCMS] = useState(null)

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

  const normalizeCms = (items = []) => items.map((item) => {
    const id = item?.id ?? item?._id ?? Date.now()
    const createdRaw = item?.created_at ?? item?.createdAt ?? item?.created
    const updatedRaw = item?.updated_at ?? item?.updatedAt ?? item?.updated

    return {
      id,
      slug: item?.slug ?? '',
      title: item?.title ?? '',
      subtitle: item?.subtitle ?? '',
      description: item?.description ?? item?.desc ?? '',
      meta_title: item?.meta_title ?? '',
      meta_description: item?.meta_description ?? '',
      meta_keywords: item?.meta_keywords ?? '',
      active: Boolean(item?.is_active ?? item?.active),
      created: createdRaw ? formatTimestamp(new Date(createdRaw)) : '',
      updated: updatedRaw ? formatTimestamp(new Date(updatedRaw)) : '',
    }
  })

  const loadCMS = async ({ search = '', statusLabel = status } = {}) => {
    setLoadingCms(true)
    setToastError('')
    try {
      const statusBool = statusLabel === 'Inactive' ? false : true
      const data = await fetchCMSListAPI({ page: 1, limit: 10, search, status: statusBool })
      const list = data?.data ?? data?.cms ?? data?.items ?? []
      setCms(normalizeCms(list))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load CMS.'
      setToastError(msg)
    } finally {
      setLoadingCms(false)
    }
  }

  useEffect(() => {
    loadCMS({ search: '', statusLabel: 'Active' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = () => loadCMS({ search: query, statusLabel: status })

  const filteredCms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cms
    return cms.filter((x) => (
      x.title.toLowerCase().includes(q)
      || x.slug.toLowerCase().includes(q)
      || x.subtitle.toLowerCase().includes(q)
    ))
  }, [cms, query])

  const handleCMSSubmit = async (payload) => {
    if (modalMode === 'view') return

    setSubmitting(true)
    setToastError('')
    try {
      const formData = new FormData()
      formData.append('slug', payload.slug.trim())
      formData.append('title', payload.title.trim())
      formData.append('subtitle', payload.subtitle.trim())
      formData.append('description', payload.description.trim())
      formData.append('meta_title', payload.meta_title.trim())
      formData.append('meta_description', payload.meta_description.trim())
      formData.append('meta_keywords', payload.meta_keywords.trim())

      const res = modalMode === 'edit' && selectedCMS
        ? await updateCMSAPI(selectedCMS.id, formData)
        : await createCMSAPI(formData)

      setToastSuccess(res?.message || (modalMode === 'edit' ? 'CMS updated successfully.' : 'CMS created successfully.'))
      setModalOpen(false)
      await loadCMS({ search: query, statusLabel: status })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'CMS submit failed.'
      setToastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCMSStatus = async (id) => {
    const row = cms.find((x) => x.id === id)
    if (!row) return
    if (cmsStatusUpdatingId) return

    const newActive = !row.active
    setCmsStatusUpdatingId(id)
    setToastError('')

    try {
      const res = await setCMSStatusAPI(id, newActive)
      setToastSuccess(res?.message || (newActive ? 'CMS activated.' : 'CMS deactivated.'))
      await loadCMS({ search: query, statusLabel: status })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'CMS status update failed.'
      setToastError(msg)
    } finally {
      setCmsStatusUpdatingId(null)
    }
  }

  const deleteCMS = async (id) => {
    setToastError('')
    try {
      const res = await deleteCMSAPI(id)
      setToastSuccess(res?.message || 'CMS deleted successfully.')
      setDeletingCMS(null)
      await loadCMS({ search: query, statusLabel: status })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'CMS delete failed.'
      setToastError(msg)
      setDeletingCMS(null)
    }
  }

  return (
    <section id="page-cms" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">CMS</h2>
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
          <span>CMS</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#00A3FF' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">CMS List</h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search by title, slug..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="glass-input rounded-xl px-3 py-2 text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <button
              type="button"
              onClick={refresh}
              className="btn-glass flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label="Refresh"
              disabled={loadingCms}
            >
              <Icon path={paths.refresh} />
            </button>

            <button
              type="button"
              className="btn-add"
              aria-label="Add CMS"
              onClick={() => {
                setSelectedCMS(null)
                setModalMode('create')
                setModalOpen(true)
              }}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {toastSuccess ? <div className="notif-toast mb-4">{toastSuccess}</div> : null}
        {toastError ? <div className="vendor-form-error mb-4">{toastError}</div> : null}

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="vendors-table data-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10"><input type="checkbox" className="rounded border-white/20 bg-white/5" /></th>
                <th>S.No</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingCms ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading CMS...</td>
                </tr>
              ) : filteredCms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-400">No CMS found.</td>
                </tr>
              ) : (
                filteredCms.map((item, index) => (
                  <tr key={item.id}>
                    <td><input type="checkbox" className="rounded border-white/20 bg-white/5" /></td>
                    <td className="text-slate-400">{index + 1}</td>
                    <td className="font-semibold text-slate-200">{item.title}</td>
                    <td className="text-slate-400">{item.slug}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={item.active}
                            disabled={cmsStatusUpdatingId === item.id}
                            onChange={() => toggleCMSStatus(item.id)}
                          />
                          <span className="toggle-slider" />
                        </label>
                        <span className={`text-xs font-semibold ${item.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
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
                          aria-label={`View ${item.title}`}
                          onClick={() => {
                            setSelectedCMS(item)
                            setModalMode('view')
                            setModalOpen(true)
                          }}
                        >
                          <Icon path={paths.view} />
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          aria-label={`Edit ${item.title}`}
                          onClick={() => {
                            setSelectedCMS(item)
                            setModalMode('edit')
                            setModalOpen(true)
                          }}
                        >
                          <Icon path={paths.edit} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCMS(item)}
                          className="action-btn action-btn-danger"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Icon path={paths.delete} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CMSModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCMSSubmit}
        submitting={submitting}
        initialValues={selectedCMS}
        mode={modalMode}
      />

      <DeleteConfirmModal
        open={Boolean(deletingCMS)}
        onClose={() => setDeletingCMS(null)}
        onConfirm={() => deletingCMS && deleteCMS(deletingCMS.id)}
        itemName={deletingCMS?.title || ''}
        title="Delete CMS"
      />
    </section>
  )
}

