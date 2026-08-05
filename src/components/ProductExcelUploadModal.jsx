import { useEffect, useRef, useState } from 'react'
import {
  bulkUploadProductsAPI,
  downloadProductBulkSampleAPI,
} from '../services/productService'

function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const closePath = 'M6 18 18 6M6 6l12 12'
const downloadPath = 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3'

/**
 * Excel upload modal for admin Products section.
 */
export default function ProductExcelUploadModal({
  open,
  onClose,
  onSuccess,
  onOpenFullPage,
}) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [action, setAction] = useState('draft')
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    setFile(null)
    setAction('draft')
    setError('')
    setSuccess('')
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''

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

  if (!open) return null

  const downloadSample = async () => {
    setDownloading(true)
    setError('')
    try {
      const blob = await downloadProductBulkSampleAPI()
      triggerBlobDownload(blob, 'product-bulk-upload-sample.xlsx')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to download sample.')
    } finally {
      setDownloading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose an Excel (.xlsx) or CSV file.')
      return
    }
    setUploading(true)
    setError('')
    setSuccess('')
    setResult(null)
    try {
      const response = await bulkUploadProductsAPI(file, action)
      if (!response?.success) throw new Error(response?.message || 'Upload failed.')
      setSuccess(response.message || 'Excel upload completed.')
      setResult(response.data || null)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onSuccess?.(response.data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Excel upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="vendor-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="vendor-modal vendor-modal-wide glass-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="excel-upload-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vendor-modal-header">
          <h3 id="excel-upload-title" className="vendor-modal-title">
            <span className="vendor-modal-title-muted">Upload </span>
            <span className="vendor-modal-title-accent">Excel</span>
          </h3>
          <button type="button" className="action-btn" aria-label="Close" onClick={onClose}>
            <Icon path={closePath} />
          </button>
        </div>

        <div className="vendor-modal-body space-y-4">
          <p className="text-sm text-slate-400">
            Download the sample Excel, fill product rows (including{' '}
            <code className="text-brand-300">cover_image_url</code> /{' '}
            <code className="text-brand-300">gallery_urls</code>), then upload here.
          </p>

          <button
            type="button"
            disabled={downloading}
            onClick={downloadSample}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
          >
            <Icon path={downloadPath} className="h-4 w-4" />
            {downloading ? 'Preparing…' : 'Download Sample Excel'}
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Excel / CSV file
              </label>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null)
                  setError('')
                  setSuccess('')
                }}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-200"
              />
              {file ? (
                <p className="mt-2 text-xs text-slate-400">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Default action
              </label>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="draft">Save as Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>
          </div>

          {error ? <div className="vendor-form-error">{error}</div> : null}
          {success ? <div className="notif-toast">{success}</div> : null}

          {result ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[10px] uppercase text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-100">{result.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                <p className="text-[10px] uppercase text-emerald-400">Created</p>
                <p className="text-lg font-bold text-emerald-300">{result.createdCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center">
                <p className="text-[10px] uppercase text-rose-400">Failed</p>
                <p className="text-lg font-bold text-rose-300">{result.failedCount ?? 0}</p>
              </div>
            </div>
          ) : null}

          {onOpenFullPage ? (
            <button
              type="button"
              onClick={onOpenFullPage}
              className="text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              Open full Bulk Upload page →
            </button>
          ) : null}
        </div>

        <div className="vendor-modal-footer flex flex-wrap gap-3">
          <button
            type="button"
            disabled={uploading || !file}
            onClick={handleUpload}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload Excel'}
          </button>
          <button type="button" onClick={onClose} className="vendor-btn-cancel flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
