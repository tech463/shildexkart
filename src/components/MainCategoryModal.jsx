import { useEffect, useMemo, useState } from 'react'

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const ICON_OPTIONS = [
  { id: 'grid', label: 'Grid', path: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
  { id: 'tag', label: 'Tag', path: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z' },
  { id: 'star', label: 'Star', path: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
  { id: 'heart', label: 'Heart', path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z' },
  { id: 'home', label: 'Home', path: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
  { id: 'cart', label: 'Cart', path: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z' },
  { id: 'gift', label: 'Gift', path: 'M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z' },
  { id: 'bolt', label: 'Bolt', path: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z' },
  { id: 'camera', label: 'Camera', path: 'M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z' },
  { id: 'phone', label: 'Phone', path: 'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
  { id: 'laptop', label: 'Laptop', path: 'M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z' },
  { id: 'shirt', label: 'Fashion', path: 'M9 4.5v-.75a3 3 0 0 1 6 0V4.5m-6 0h6m-6 0-3.75 2.25L4.5 9.75v9.75A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V9.75l-.75-3L15 4.5' },
  { id: 'siren', label: 'Siren', path: 'M12 3v1.5m0 15V21m8.485-15.485-1.06 1.06M4.575 17.425l-1.06 1.06M21 12h-1.5M4.5 12H3m15.485 5.485-1.06-1.06M4.575 6.575l-1.06-1.06M9 12a3 3 0 1 1 6 0v3H9v-3Zm-1.5 3h9v1.5A1.5 1.5 0 0 1 15 18H9a1.5 1.5 0 0 1-1.5-1.5V15Z' },
]

function PathIcon({ path, className = 'h-4 w-4', style }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={style} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const uiPaths = {
  close: 'M6 18 18 6M6 6l12 12',
  upload: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

function resolveImagePreview(item) {
  if (!item) return ''
  if (typeof item.imageUrl === 'string' && item.imageUrl) return item.imageUrl
  if (typeof item.image === 'string' && item.image) return item.image
  if (typeof File !== 'undefined' && item.image instanceof File) return URL.createObjectURL(item.image)
  return ''
}

export default function MainCategoryModal({
  open,
  onClose,
  onSubmit,
  item = null,
  title = 'Main Category',
  parentLabel = 'Main Category',
  parentOptions = null,
}) {
  const isEdit = Boolean(item)
  const hasParent = Array.isArray(parentOptions) && parentOptions.length > 0
  const [name, setName] = useState('')
  const [parent, setParent] = useState(parentOptions?.[0] || '')
  const [status, setStatus] = useState('Active')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageRemoved, setImageRemoved] = useState(false)
  const [iconQuery, setIconQuery] = useState('')
  const [selectedIconId, setSelectedIconId] = useState(null)
  const [iconColor, setIconColor] = useState('#22c55e')
  const [iconSize, setIconSize] = useState(18)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined

    if (item) {
      setName(item.name || '')
      setParent(item.parent || parentOptions?.[0] || '')
      setStatus(item.active ? 'Active' : 'Inactive')
      setImageFile(null)
      setImageRemoved(false)
      setImagePreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
        return resolveImagePreview(item)
      })
      setSelectedIconId(item.icon?.id || null)
      setIconColor(item.icon?.color || '#22c55e')
      setIconSize(item.icon?.size || 18)
    } else {
      setName('')
      setParent(parentOptions?.[0] || '')
      setStatus('Active')
      setImageFile(null)
      setImageRemoved(false)
      setImagePreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
        return ''
      })
      setSelectedIconId(null)
      setIconColor('#22c55e')
      setIconSize(18)
    }

    setIconQuery('')
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
  }, [open, onClose, item, parentOptions])

  const filteredIcons = useMemo(() => {
    const search = iconQuery.trim().toLowerCase()
    if (!search) return ICON_OPTIONS
    return ICON_OPTIONS.filter((icon) => icon.label.toLowerCase().includes(search) || icon.id.includes(search))
  }, [iconQuery])

  const selectedIcon = ICON_OPTIONS.find((icon) => icon.id === selectedIconId) || null

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
    setImageRemoved(false)
    setImageFile(file)
    setImagePreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  const clearImage = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setImageFile(null)
    setImageRemoved(true)
    setImagePreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
      return ''
    })
  }

  const clearIcon = () => {
    setSelectedIconId(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (hasParent && !parent) {
      setError(`Please select a ${parentLabel.toLowerCase()}.`)
      return
    }
    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }
    onSubmit({
      id: item?.id,
      name: name.trim(),
      parent: hasParent ? parent : undefined,
      active: status === 'Active',
      status,
      image: imageFile,
      imageRemoved,
      keepImage: isEdit && !imageFile && !imageRemoved && Boolean(item?.image || item?.imageUrl),
      icon: selectedIcon
        ? { id: selectedIcon.id, label: selectedIcon.label, color: iconColor, size: iconSize }
        : null,
    })
  }

  const fieldId = `${isEdit ? 'edit' : 'add'}-${title.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id={`${fieldId}-title`} className="vendor-modal-title">
            <span className="vendor-modal-title-muted">{isEdit ? 'Edit ' : 'Add '}</span>
            <span className="vendor-modal-title-accent">{title}</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <PathIcon path={uiPaths.close} />
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-5">
            {hasParent ? (
              <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <label htmlFor={`${fieldId}-parent`} className="vendor-field-label">{parentLabel}</label>
                  <select
                    id={`${fieldId}-parent`}
                    value={parent}
                    onChange={(event) => setParent(event.target.value)}
                    className="glass-input vendor-field-input"
                  >
                    {parentOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${fieldId}-name`} className="vendor-field-label">Name</label>
                  <input
                    id={`${fieldId}-name`}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter name"
                    className="glass-input vendor-field-input"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor={`${fieldId}-name`} className="vendor-field-label">Name</label>
                <input
                  id={`${fieldId}-name`}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter name"
                  className="glass-input vendor-field-input"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label htmlFor={`${fieldId}-image`} className="vendor-field-label">Image</label>
              <div className={`vendor-upload-zone category-upload-zone${imagePreview ? ' has-preview' : ''}`}>
                <input
                  id={`${fieldId}-image`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => selectImage(event.target.files?.[0] || null)}
                />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Category preview" />
                    <button
                      type="button"
                      className="category-image-remove"
                      aria-label="Remove image"
                      onClick={clearImage}
                    >
                      <PathIcon path={uiPaths.delete} className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <label htmlFor={`${fieldId}-image`} className="category-upload-trigger">
                    <span className="vendor-upload-icon" aria-hidden="true">
                      <PathIcon path={uiPaths.upload} className="h-3.5 w-3.5" />
                    </span>
                    <span className="vendor-upload-copy">
                      <span className="text-sm font-semibold text-slate-200">Enter image</span>
                      <span className="text-[11px] leading-snug text-slate-500">PNG, JPG or WEBP (Max 10MB)</span>
                    </span>
                  </label>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
              <div className="category-icon-panel">
                <div className="mb-3 flex items-center gap-3">
                  <div className="category-icon-preview" style={{ color: selectedIcon ? iconColor : undefined }}>
                    {selectedIcon ? (
                      <PathIcon path={selectedIcon.path} style={{ width: iconSize, height: iconSize }} />
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">None</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400">Selected Icon:</p>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-200">
                        {selectedIcon ? selectedIcon.label : 'No Icon Selected'}
                      </p>
                      {selectedIcon ? (
                        <button type="button" onClick={clearIcon} className="category-icon-clear">
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="relative mb-3">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <PathIcon path={uiPaths.search} className="h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    value={iconQuery}
                    onChange={(event) => setIconQuery(event.target.value)}
                    placeholder="Search & select icon..."
                    className="glass-input vendor-field-input pl-10"
                  />
                </div>

                <div className="category-icon-grid mb-4">
                  {filteredIcons.length === 0 ? (
                    <p className="col-span-full py-2 text-center text-xs text-slate-500">No icons found.</p>
                  ) : filteredIcons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      className={`category-icon-option${selectedIconId === icon.id ? ' active' : ''}`}
                      onClick={() => setSelectedIconId(icon.id)}
                      aria-label={`Select ${icon.label} icon`}
                      title={icon.label}
                    >
                      <PathIcon path={icon.path} className="h-4 w-4" style={{ color: iconColor }} />
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Icon Color</p>
                    <div className="flex items-center gap-2">
                      <label className="category-color-swatch" style={{ background: iconColor }}>
                        <input
                          type="color"
                          value={iconColor}
                          onChange={(event) => setIconColor(event.target.value)}
                          className="sr-only"
                          aria-label="Icon color"
                        />
                      </label>
                      <input
                        type="text"
                        value={iconColor}
                        onChange={(event) => setIconColor(event.target.value)}
                        className="glass-input vendor-field-input !py-2 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Icon Size ({iconSize}px)
                    </p>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={iconSize}
                      onChange={(event) => setIconSize(Number(event.target.value))}
                      className="category-size-slider w-full"
                      aria-label="Icon size"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor={`${fieldId}-status`} className="vendor-field-label">Status</label>
                <select
                  id={`${fieldId}-status`}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="glass-input vendor-field-input"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {error ? <p className="vendor-form-error">{error}</p> : null}
          </div>

          <div className="vendor-modal-footer !justify-stretch gap-3">
            <button type="button" onClick={onClose} className="vendor-btn-cancel flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-glass vendor-btn-submit flex-1">
              {isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
