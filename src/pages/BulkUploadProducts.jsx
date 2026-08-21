import { useRef, useState } from 'react'
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

export default function BulkUploadProducts({ onNavigate }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [action, setAction] = useState('publish')
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [result, setResult] = useState(null)

  const onFileChange = (event) => {
    const next = event.target.files?.[0] || null
    setFile(next)
    setError('')
    setSuccess('')
    setResult(null)
  }

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
      setError('Please choose an Excel (.xlsx) or CSV file first.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setResult(null)
    try {
      const response = await bulkUploadProductsAPI(file, action)
      if (!response?.success) {
        throw new Error(response?.message || 'Bulk upload failed.')
      }
      setSuccess(response.message || 'Bulk upload completed.')
      setResult(response.data || null)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || 'Bulk upload failed.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="page-view">
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
            <span>Bulk Upload</span>
          </nav>
          <h2 className="title-xl !text-2xl">Bulk Upload Products</h2>
          <p className="mt-1 text-sm text-slate-400">
            Upload many products at once. The sample Excel is filled from live products and categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('products')}
          className="btn-glass rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          Back to Products
        </button>
      </div>

      <div className="neo-card glass-card space-y-6 p-6" style={{ '--accent': '#34d399' }}>
        <span className="card-accent" aria-hidden="true" />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">How it works</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-400">
            <li>Download the sample Excel (current products + category reference from DB).</li>
            <li>
              Edit or copy rows as needed. Keep the column headers unchanged.
            </li>
            <li>
              Category columns must match Master names (Main / Category / Sub-category).
            </li>
            <li>
              Set each row <code className="text-brand-300">action</code> to{' '}
              <code className="text-brand-300">draft</code> or{' '}
              <code className="text-brand-300">publish</code>.
            </li>
            <li>Upload the file. Cover/gallery image URLs are downloaded automatically.</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={downloading}
            onClick={downloadSample}
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-400 disabled:opacity-60"
          >
            {downloading ? 'Preparing…' : 'Download Sample Excel'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Excel / CSV file
            </label>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={onFileChange}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-200"
            />
            {file ? (
              <p className="mt-2 text-xs text-slate-400">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Default action (if row omits action)
            </label>
            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
            >
              <option value="draft">Save as Draft</option>
              <option value="publish">Publish (admin approves instantly)</option>
            </select>
          </div>
        </div>

        {error ? <div className="vendor-form-error">{error}</div> : null}
        {success ? <div className="notif-toast">{success}</div> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={uploading || !file}
            onClick={handleUpload}
            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload Products'}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              setFile(null)
              setResult(null)
              setError('')
              setSuccess('')
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="btn-glass rounded-xl px-4 py-3 text-sm font-medium"
          >
            Clear
          </button>
        </div>

        {result ? (
          <div className="space-y-4 border-t border-white/10 pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Total</p>
                <p className="mt-1 text-2xl font-bold text-slate-100">{result.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-400">Created</p>
                <p className="mt-1 text-2xl font-bold text-emerald-300">{result.createdCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-rose-400">Failed</p>
                <p className="mt-1 text-2xl font-bold text-rose-300">{result.failedCount ?? 0}</p>
              </div>
            </div>

            {Array.isArray(result.failed) && result.failed.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failed.map((item) => (
                      <tr key={`${item.row}-${item.message}`} className="border-b border-white/5">
                        <td className="px-3 py-2 text-slate-400">{item.row}</td>
                        <td className="px-3 py-2 text-slate-200">{item.title || '—'}</td>
                        <td className="px-3 py-2 text-rose-300">{item.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
