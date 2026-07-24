import { useEffect, useMemo, useState } from 'react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { ADDRESSES_DATA, ADDRESS_TYPES } from '../data/addresses'

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
}

const emptyForm = {
  customer: '',
  shippingPhone: '',
  alternatePhone: '',
  address: '',
  type: 'Home',
  isDefault: false,
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

function parseAddressDate(value) {
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
  const created = parseAddressDate(row.created)
  const updated = parseAddressDate(row.updated)
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

function phoneDisplay(value) {
  return value?.trim() ? value : 'Not available'
}

function TypeBadge({ type }) {
  const label = String(type || 'Home').toUpperCase()
  return <span className={`address-type-badge address-type-${label.toLowerCase()}`}>{label}</span>
}

function StatusBadge({ isDefault }) {
  if (!isDefault) return <span className="text-slate-500">—</span>
  return <span className="address-default-badge">DEFAULT</span>
}

function AddressModal({ open, onClose, onSubmit, address = null }) {
  const isEdit = Boolean(address)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    if (address) {
      setForm({
        customer: address.customer || '',
        shippingPhone: address.shippingPhone || '',
        alternatePhone: address.alternatePhone || '',
        address: address.address || '',
        type: address.type || 'Home',
        isDefault: Boolean(address.isDefault),
      })
    } else {
      setForm(emptyForm)
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
  }, [open, onClose, address])

  if (!open) return null

  const updateField = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.customer.trim() || !form.shippingPhone.trim() || !form.address.trim()) {
      setError('Please fill in customer, shipping phone, and address.')
      return
    }
    onSubmit({
      id: address?.id,
      customer: form.customer.trim(),
      shippingPhone: form.shippingPhone.trim(),
      alternatePhone: form.alternatePhone.trim(),
      address: form.address.trim(),
      type: form.type,
      isDefault: form.isDefault,
    })
  }

  const fieldPrefix = isEdit ? 'edit-address' : 'add-address'

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
            <span className="vendor-modal-title-accent">Address</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="vendor-modal-body space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldPrefix}-customer`} className="vendor-field-label">Customer</label>
                <input
                  id={`${fieldPrefix}-customer`}
                  value={form.customer}
                  onChange={updateField('customer')}
                  className="glass-input vendor-field-input"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-type`} className="vendor-field-label">Type</label>
                <select
                  id={`${fieldPrefix}-type`}
                  value={form.type}
                  onChange={updateField('type')}
                  className="glass-input vendor-field-input"
                >
                  {ADDRESS_TYPES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-shipping`} className="vendor-field-label">Shipping Phone</label>
                <input
                  id={`${fieldPrefix}-shipping`}
                  value={form.shippingPhone}
                  onChange={updateField('shippingPhone')}
                  className="glass-input vendor-field-input"
                  placeholder="Primary phone"
                />
              </div>
              <div>
                <label htmlFor={`${fieldPrefix}-alternate`} className="vendor-field-label">Alternate Phone</label>
                <input
                  id={`${fieldPrefix}-alternate`}
                  value={form.alternatePhone}
                  onChange={updateField('alternatePhone')}
                  className="glass-input vendor-field-input"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`${fieldPrefix}-line`} className="vendor-field-label">Address</label>
              <textarea
                id={`${fieldPrefix}-line`}
                value={form.address}
                onChange={updateField('address')}
                className="glass-input vendor-field-input min-h-[88px] resize-y"
                placeholder="Street, area, city, state - pincode"
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Default address</p>
                <p className="text-xs text-slate-400">Mark as the customer&apos;s default shipping address.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={form.isDefault} onChange={updateField('isDefault')} />
                <span className="toggle-slider" />
              </label>
            </div>
            {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
          </div>
          <div className="vendor-modal-footer">
            <button type="button" onClick={onClose} className="vendor-btn-cancel w-full">Cancel</button>
            <button type="submit" className="btn-glass vendor-btn-submit w-full !min-w-0">
              {isEdit ? 'Save Changes' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddressViewModal({ open, onClose, address }) {
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

  if (!open || !address) return null

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-category glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-address-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="view-address-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">View </span>
            <span className="vendor-modal-title-accent">Address</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={paths.close} />
          </button>
        </div>
        <div className="vendor-modal-body space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Customer</p>
              <p className="text-sm text-slate-200">{address.customer}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Type</p>
              <div className="mt-1"><TypeBadge type={address.type} /></div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Shipping Phone</p>
              <p className="text-sm text-slate-200">{phoneDisplay(address.shippingPhone)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Alternate Phone</p>
              <p className="text-sm text-slate-200">{phoneDisplay(address.alternatePhone)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Address</p>
              <p className="text-sm text-slate-200">{address.address}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <div className="mt-1"><StatusBadge isDefault={address.isDefault} /></div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Created</p>
              <p className="text-sm text-slate-300">{address.created}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Updated</p>
              <p className="text-sm text-slate-300">{address.updated}</p>
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

export default function Addresses({ onNavigate }) {
  const [addresses, setAddresses] = useState(() => ADDRESSES_DATA.map((row) => ({ ...row })))
  const [query, setQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [viewingAddress, setViewingAddress] = useState(null)
  const [deletingAddress, setDeletingAddress] = useState(null)

  const filteredAddresses = useMemo(() => {
    const search = query.trim().toLowerCase()
    return addresses.filter((row) => (
      (!search
        || row.customer.toLowerCase().includes(search)
        || row.shippingPhone.toLowerCase().includes(search)
        || row.alternatePhone.toLowerCase().includes(search)
        || row.address.toLowerCase().includes(search)
        || row.type.toLowerCase().includes(search))
      && isWithinDateRange(row, startDate, endDate)
    ))
  }, [addresses, query, startDate, endDate])

  const allVisibleSelected = filteredAddresses.length > 0
    && filteredAddresses.every((row) => selectedIds.includes(row.id))

  const refresh = () => {
    setQuery('')
    setStartDate('')
    setEndDate('')
    setSelectedIds([])
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingAddress(null)
  }

  const openAddModal = () => {
    setEditingAddress(null)
    setModalOpen(true)
  }

  const openEditModal = (address) => {
    setEditingAddress(address)
    setModalOpen(true)
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !filteredAddresses.some((row) => row.id === id)))
      return
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...filteredAddresses.map((row) => row.id)]),
    ])
  }

  const toggleSelect = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    ))
  }

  const deleteAddress = (id) => {
    setAddresses((current) => current.filter((row) => row.id !== id))
    setSelectedIds((current) => current.filter((value) => value !== id))
    setDeletingAddress(null)
  }

  const addAddress = (payload) => {
    const stamp = formatTimestamp()
    setAddresses((current) => {
      const next = {
        id: Date.now(),
        ...payload,
        created: stamp,
        updated: stamp,
      }
      if (payload.isDefault) {
        return [next, ...current.map((row) => (
          row.customer === payload.customer ? { ...row, isDefault: false } : row
        ))]
      }
      return [next, ...current]
    })
    closeModal()
  }

  const updateAddress = (payload) => {
    const stamp = formatTimestamp()
    setAddresses((current) => current.map((row) => {
      if (row.id === payload.id) {
        return { ...row, ...payload, updated: stamp }
      }
      if (payload.isDefault && row.customer === payload.customer) {
        return { ...row, isDefault: false }
      }
      return row
    }))
    closeModal()
  }

  const handleModalSubmit = (payload) => {
    if (editingAddress) updateAddress(payload)
    else addAddress(payload)
  }

  return (
    <section id="page-addresses" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Addresses</h2>
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
          <span>Addresses</span>
        </nav>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#66cfff' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Addresses List</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="icon-3d icon-3d-xs icon-3d-muted icon-3d-flat icon-3d-input">
                <Icon path={paths.search} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search Addresses..."
                className="glass-input w-full rounded-xl py-2 pl-11 pr-3 text-sm sm:w-56"
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
            >
              <Icon path={paths.refresh} />
            </button>
            <button
              type="button"
              className="btn-add"
              aria-label="Add address"
              onClick={openAddModal}
            >
              <Icon path={paths.plus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="vendors-table data-table w-full min-w-[1100px] text-left text-sm">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all addresses"
                  />
                </th>
                <th>S.No</th>
                <th>Customer</th>
                <th>Shipping Phone</th>
                <th>Alternate Phone</th>
                <th>Address</th>
                <th>Type</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAddresses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-sm text-slate-500">
                    No addresses found
                  </td>
                </tr>
              ) : filteredAddresses.map((row, index) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      aria-label={`Select ${row.customer}`}
                    />
                  </td>
                  <td className="text-slate-400">{index + 1}</td>
                  <td className="font-medium text-slate-200">{row.customer}</td>
                  <td className="text-slate-300">{phoneDisplay(row.shippingPhone)}</td>
                  <td className="text-slate-400">{phoneDisplay(row.alternatePhone)}</td>
                  <td className="max-w-[260px] text-slate-300">{row.address}</td>
                  <td><TypeBadge type={row.type} /></td>
                  <td><StatusBadge isDefault={row.isDefault} /></td>
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
                        aria-label={`View ${row.customer}`}
                        onClick={() => setViewingAddress(row)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.view} />
                          <path strokeLinecap="round" strokeLinejoin="round" d={paths.viewEye} />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        aria-label={`Edit ${row.customer}`}
                        onClick={() => openEditModal(row)}
                      >
                        <Icon path={paths.edit} />
                      </button>
                      <button
                        type="button"
                        className="action-btn action-btn-danger"
                        aria-label={`Delete ${row.customer}`}
                        onClick={() => setDeletingAddress(row)}
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

      <AddressModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        address={editingAddress}
      />
      <AddressViewModal
        open={Boolean(viewingAddress)}
        onClose={() => setViewingAddress(null)}
        address={viewingAddress}
      />
      <DeleteConfirmModal
        open={Boolean(deletingAddress)}
        onClose={() => setDeletingAddress(null)}
        onConfirm={() => deleteAddress(deletingAddress.id)}
        itemName={deletingAddress ? `${deletingAddress.customer} — ${deletingAddress.address}` : ''}
        title="Delete Item"
      />
    </section>
  )
}
