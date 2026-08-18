import { useEffect, useState } from 'react'
import { fetchPaymentsAPI } from '../services/orderService'

function money(value) {
  return Number(value || 0)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN')
}

export default function Wallet({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPayments, setTotalPayments] = useState(0)
  const [recentPayments, setRecentPayments] = useState([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchPaymentsAPI({ page: 1, limit: 100 })
      const rows = Array.isArray(res?.data) ? res.data : []
      const successful = rows.filter((row) => {
        const status = String(row.status || '').toLowerCase()
        return status === 'paid' || status === 'captured' || status === 'cod_pending'
      })
      setTotalEarned(successful.reduce((sum, row) => sum + money(row.amount), 0))
      setTotalPayments(successful.length)
      setRecentPayments(rows.slice(0, 8).map((row) => ({
        id: row.id,
        order: row.order?.order_number || `#${row.order_id}`,
        amount: `₹${money(row.amount).toLocaleString('en-IN')}`,
        type: `${row.method || 'payment'} · ${row.status || ''}`.trim(),
        date: formatDate(row.paid_at || row.created_at),
      })))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load wallet payments.')
      setTotalEarned(0)
      setTotalPayments(0)
      setRecentPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section id="page-wallet" className="page-view">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="title-xl !text-2xl">Wallet</h2>
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
          <span>Wallet</span>
        </nav>
      </div>

      {error ? <div className="vendor-form-error mb-4">{error}</div> : null}
      {loading ? <p className="mb-4 text-sm text-slate-400">Loading payments...</p> : null}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="neo-card glass-card wallet-stat-card p-5" style={{ '--accent': '#34d399' }}>
          <span className="card-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-400">Total Earned</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">
            ₹{totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="mt-3 text-xs font-medium text-emerald-400">Paid and COD orders processed</p>
        </div>

        <div className="neo-card glass-card wallet-stat-card p-5" style={{ '--accent': '#00A3FF' }}>
          <span className="card-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-400">Total Payments</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{totalPayments}</p>
          <p className="mt-3 text-xs font-medium text-slate-500">Number of successful orders processed</p>
        </div>
      </div>

      <div className="neo-card glass-card p-5" style={{ '--accent': '#34d399' }}>
        <span className="card-accent" aria-hidden="true" />
        <div className="mb-6 flex items-center justify-between gap-3">
          <h3 className="font-display text-sm font-bold tracking-wide text-shield">Recent Payments</h3>
          <button type="button" onClick={load} className="btn-glass rounded-lg px-3 py-1.5 text-xs font-medium">
            Refresh
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="wallet-empty-state">
            <p>No payment history available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="vendors-table data-table w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-medium text-slate-200">{payment.order}</td>
                    <td className="text-slate-300">{payment.amount}</td>
                    <td className="text-slate-400 capitalize">{payment.type}</td>
                    <td className="text-slate-400">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
