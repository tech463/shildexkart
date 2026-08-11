import { useCallback, useEffect, useState } from 'react'
import { errMsg, fetchAdminAddressesAPI } from '../services/orderService'

export default function Addresses() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminAddressesAPI({ page, limit: 20 })
      setRows(res?.data || [])
      setTotalPages(res?.totalPages || 1)
    } catch (err) {
      setError(errMsg(err, 'Failed to load addresses.'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer Addresses</h1>
        <p className="mt-1 text-sm text-slate-400">Saved delivery addresses used at checkout.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : !rows.length ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">No addresses yet.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-200">
                    <div className="font-semibold">{row.user?.name || row.full_name}</div>
                    <div className="text-xs text-slate-500">{row.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {row.address_line1}
                    {row.address_line2 ? `, ${row.address_line2}` : ''}
                    <div className="text-xs text-slate-500">
                      {row.city}, {row.state} {row.pincode}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.phone}</td>
                  <td className="px-4 py-3 capitalize text-slate-300">
                    {row.address_type}{row.is_default ? ' · default' : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-slate-400">Page {page} / {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
