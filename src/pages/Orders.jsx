import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import TablePagination from '../components/TablePagination'
import usePagination from '../hooks/usePagination'
import {
  createShipmentAPI,
  errMsg,
  fetchOrderByIdAPI,
  fetchOrdersAPI,
  trackOrderAPI,
  updateOrderStatusAPI,
} from '../services/orderService'

const STATUS_OPTIONS = [
  'pending_payment',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function labelStatus(status) {
  return String(status || '').replaceAll('_', ' ')
}

export default function Orders() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [tracking, setTracking] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchOrdersAPI({
        page: 1,
        limit: 50,
        search: search.trim() || undefined,
        status: status || undefined,
      })
      setOrders(res?.data || [])
    } catch (err) {
      setError(errMsg(err, 'Failed to load orders.'))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) return
    openOrder(orderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const openOrder = async (id) => {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetchOrderByIdAPI(id)
      setSelected(res?.data || null)
      const track = await trackOrderAPI(id)
      setTracking(track?.data?.tracking || [])
    } catch (err) {
      setMessage(errMsg(err, 'Unable to open order.'))
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (nextStatus) => {
    if (!selected) return
    setBusy(true)
    setMessage('')
    try {
      const res = await updateOrderStatusAPI(selected.id, nextStatus)
      setMessage(res.message || 'Status updated.')
      setSelected(res.data)
      await load()
    } catch (err) {
      setMessage(errMsg(err, 'Status update failed.'))
    } finally {
      setBusy(false)
    }
  }

  const shipOrder = async () => {
    if (!selected) return
    setBusy(true)
    setMessage('')
    try {
      const res = await createShipmentAPI(selected.id)
      setMessage(res.message || 'Shipment created.')
      setSelected(res.data?.order || res.data)
      const track = await trackOrderAPI(selected.id)
      setTracking(track?.data?.tracking || [])
      await load()
    } catch (err) {
      setMessage(errMsg(err, 'Shiprocket shipment failed.'))
    } finally {
      setBusy(false)
    }
  }

  const counts = useMemo(() => {
    const base = { all: orders.length }
    STATUS_OPTIONS.forEach((s) => {
      base[s] = orders.filter((o) => o.status === s).length
    })
    return base
  }, [orders])

  const pagination = usePagination(orders)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage payments, Shiprocket shipments, and delivery status.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-sky-500"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus('')}
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${!status ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          All ({counts.all})
        </button>
        {STATUS_OPTIONS.slice(0, 6).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status === s ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            {labelStatus(s)} ({counts[s] || 0})
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order #, name, phone..."
          className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
              ) : !orders.length ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No orders found.</td></tr>
              ) : (
                pagination.pageItems.map((order, index) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrder(order.id)}
                    className={`cursor-pointer border-t border-slate-800 hover:bg-slate-800/40 ${selected?.id === order.id ? 'bg-slate-800/60' : ''}`}
                  >
                    <td className="px-4 py-3 text-slate-400">{pagination.rangeStart + index}</td>
                    <td className="px-4 py-3 font-semibold text-sky-400">{order.order_number}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{order.shipping_name}</div>
                      <div className="text-xs text-slate-500">{order.shipping_phone}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-300">
                      {order.payment_method} · {order.payment_status}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-200">{labelStatus(order.status)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{money(order.total_amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && orders.length > 0 ? (
            <div className="px-4 pb-4">
              <TablePagination
                {...pagination}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.changePageSize}
                itemLabel="orders"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          {!selected ? (
            <p className="text-sm text-slate-500">Select an order to manage status, shipment, and tracking.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.order_number}</h2>
                <p className="text-sm text-slate-400">
                  {selected.shipping_name} · {selected.shipping_city}, {selected.shipping_pincode}
                </p>
                <Link
                  to={`/invoices?orderId=${selected.id}`}
                  className="mt-2 inline-block text-xs font-bold text-sky-400 hover:underline"
                >
                  View linked invoice →
                </Link>
              </div>

              <div className="rounded-xl bg-slate-950/70 p-3 text-sm text-slate-300">
                {(selected.items || []).map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 border-b border-slate-800 py-2 last:border-0">
                    <span>{item.product_title} ×{item.qty}</span>
                    <span>{money(item.line_total)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span>{money(selected.total_amount)}</span>
                </div>
              </div>

              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                Update status
                <select
                  disabled={busy}
                  value={selected.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{labelStatus(s)}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={busy}
                onClick={shipOrder}
                className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-60"
              >
                Create Shiprocket shipment
              </button>

              <div className="rounded-xl border border-slate-800 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tracking</p>
                {tracking.length ? tracking.map((ship) => (
                  <div key={ship.id} className="mt-2 text-sm text-slate-300">
                    <p className="capitalize">Status: {ship.status}</p>
                    {ship.awb_code ? <p>AWB: {ship.awb_code}</p> : null}
                    {ship.courier_name ? <p>Courier: {ship.courier_name}</p> : null}
                    {ship.tracking_url ? (
                      <a href={ship.tracking_url} target="_blank" rel="noreferrer" className="text-sky-400">
                        Open tracking
                      </a>
                    ) : null}
                    {ship.error_message ? <p className="text-rose-400">{ship.error_message}</p> : null}
                  </div>
                )) : (
                  <p className="mt-2 text-sm text-slate-500">No shipment yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
