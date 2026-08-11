import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { errMsg, fetchPaymentsAPI } from '../services/orderService'

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export default function PaymentsPage() {
  const [searchParams] = useSearchParams()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const orderIdFilter = searchParams.get('orderId') || ''

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchPaymentsAPI({
        page: 1,
        limit: 100,
        status: status || undefined,
        method: method || undefined,
      })
      let data = res?.data || []
      if (orderIdFilter) {
        data = data.filter((row) => String(row.order_id) === String(orderIdFilter))
      }
      setRows(data)
    } catch (err) {
      setError(errMsg(err, 'Failed to load payments.'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [status, method, orderIdFilter])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">
            Razorpay and COD payment records for all orders.
            {orderIdFilter ? ` Filtered by order #${orderIdFilter}.` : ''}
          </p>
        </div>
        <button type="button" onClick={load} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="created">Created</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="cod_pending">COD pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="">All methods</option>
          <option value="razorpay">Razorpay</option>
          <option value="cod">COD</option>
        </select>
        {orderIdFilter ? (
          <Link to="/payments/all" className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-sky-400">
            Clear order filter
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Razorpay</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : !rows.length ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No payments yet.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-semibold text-sky-400">
                    <Link to={`/orders?orderId=${row.order_id}`} className="hover:underline">
                      {row.order?.order_number || `#${row.order_id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/invoices?orderId=${row.order_id}`} className="text-emerald-400 hover:underline">
                      Invoice
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-300">{row.method}</td>
                  <td className="px-4 py-3 capitalize text-slate-200">{row.status}</td>
                  <td className="px-4 py-3 font-semibold text-white">{money(row.amount)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {row.razorpay_payment_id || row.razorpay_order_id || '—'}
                    {row.failure_reason ? <div className="text-rose-400">{row.failure_reason}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {row.paid_at || row.created_at
                      ? new Date(row.paid_at || row.created_at).toLocaleString('en-IN')
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
