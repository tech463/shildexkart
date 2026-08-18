import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale,
  PointElement, Tooltip,
} from 'chart.js'
import { fetchProductsAPI } from '../services/productService'
import { fetchOrdersAPI } from '../services/orderService'
import { fetchUsersAPI } from '../services/userService'
import { fetchVendorsAPI } from '../services/vendorService'
import { fetchMainCategoriesAPI } from '../services/mainCategoryService'
import { fetchCategoriesAPI } from '../services/categoryService'
import { fetchSubCategoriesAPI } from '../services/subCategoryService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0, 0, 0, 0.85)', borderColor: 'rgba(0, 163, 255, 0.3)', titleColor: '#E0E0E0', bodyColor: '#C0C0C0', padding: 12, cornerRadius: 8 } },
  scales: { x: { grid: { display: false }, ticks: { color: 'rgba(192, 192, 192, 0.45)', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(192, 192, 192, 0.5)', font: { size: 11 } } } },
  interaction: { mode: 'nearest', axis: 'x', intersect: false },
}

const STAT_NAV = {
  'Total Products': 'products',
  'Total Members': 'all-users',
  'Total Orders': 'orders',
  'Main Categories': 'main-category',
  Categories: 'category',
  'Sub Categories': 'sub-category',
}

const STAT_META = [
  ['Total Products', '#34d399', 'glass-icon-emerald', 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z'],
  ['Total Members', '#00A3FF', 'glass-icon-blue', 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'],
  ['Total Orders', '#a78bfa', 'glass-icon-violet', 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z'],
  ['Main Categories', '#fb923c', 'glass-icon-orange', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
  ['Categories', '#c084fc', 'glass-icon-purple', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 1-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
  ['Sub Categories', '#f472b6', 'glass-icon-pink', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 1-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
]

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
]

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '—'
}

function statusColor(status) {
  const value = String(status || '').toLowerCase()
  if (value.includes('deliver')) return 'text-emerald-600'
  if (value.includes('cancel') || value.includes('fail')) return 'text-red-500'
  if (value.includes('pending') || value.includes('process') || value.includes('packed')) return 'text-amber-500'
  return 'text-sky-400'
}

function rangeBounds(range) {
  const end = new Date()
  const start = new Date()
  if (range === 'today') start.setHours(0, 0, 0, 0)
  else if (range === 'week') {
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
  } else if (range === 'month') {
    start.setMonth(start.getMonth() - 1)
    start.setHours(0, 0, 0, 0)
  } else {
    start.setFullYear(start.getFullYear() - 1)
    start.setHours(0, 0, 0, 0)
  }
  return { start, end }
}

function toDateParam(date) {
  return date.toISOString().slice(0, 10)
}

function inRange(value, start, end) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date >= start && date <= end
}

function monthCounts(items, getDate, year) {
  const counts = Array(12).fill(0)
  items.forEach((item) => {
    const date = new Date(getDate(item))
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year) return
    counts[date.getMonth()] += 1
  })
  return counts
}

function totalFrom(res) {
  return Number(res?.totalRecords ?? res?.count ?? res?.data?.length ?? 0)
}

function ViewButton({ label, onClick }) {
  return (
    <button type="button" className="action-btn" aria-label={`View ${label}`} onClick={onClick}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </button>
  )
}

function StatCard({ stat, onClick }) {
  const [label, count, accent, iconClass, path, detail] = stat
  const clickable = typeof onClick === 'function'

  return (
    <div
      className={`neo-card glass-card relative overflow-hidden p-5${clickable ? ' cursor-pointer transition hover:border-brand-400/40' : ''}`}
      style={{ '--accent': accent }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
    >
      <span className="card-accent" aria-hidden="true" />
      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-silver-400/70">{label}</p>
          <p className="mt-1 text-3xl font-bold stat-value">{count}</p>
        </div>
        <div className={`icon-3d icon-3d-lg glass-icon shrink-0 ${iconClass}`}>
          <Icon path={path} />
        </div>
      </div>
      {detail ? <div className="relative z-[1]">{detail}</div> : null}
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const [range, setRange] = useState('year')
  const [userFilter, setUserFilter] = useState('all')
  const [liveDate, setLiveDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    products: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    users: 0,
    vendors: 0,
    orders: 0,
    mainCategories: 0,
    categories: 0,
    subCategories: 0,
  })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [members, setMembers] = useState([])
  const [chartSeries, setChartSeries] = useState({
    orders: Array(12).fill(0),
    users: Array(12).fill(0),
    products: Array(12).fill(0),
  })

  useEffect(() => {
    setLiveDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).toUpperCase())
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    const { start, end } = rangeBounds(range)
    const dateParams = { date_from: toDateParam(start), date_to: toDateParam(end) }

    const settled = await Promise.allSettled([
      fetchProductsAPI({ page: 1, limit: 1, ...dateParams }),
      fetchProductsAPI({ page: 1, limit: 100, ...dateParams }),
      fetchProductsAPI({ page: 1, limit: 1, stock_band: 'in-stock' }),
      fetchProductsAPI({ page: 1, limit: 1, stock_band: 'low-stock' }),
      fetchProductsAPI({ page: 1, limit: 1, stock_band: 'out-of-stock' }),
      fetchOrdersAPI({ page: 1, limit: 50 }),
      fetchUsersAPI(),
      fetchVendorsAPI(),
      fetchMainCategoriesAPI({ page: 1, limit: 1 }),
      fetchCategoriesAPI({ page: 1, limit: 1 }),
      fetchSubCategoriesAPI({ page: 1, limit: 1 }),
    ])

    const value = (index, fallback) => (
      settled[index].status === 'fulfilled' ? settled[index].value : fallback
    )

    const productTotal = value(0, {})
    const productPage = value(1, { data: [] })
    const inStock = value(2, {})
    const lowStock = value(3, {})
    const outStock = value(4, {})
    const orderRes = value(5, { data: [] })
    const userRes = value(6, { users: [] })
    const vendorRes = value(7, { vendors: [] })
    const mainRes = value(8, {})
    const catRes = value(9, {})
    const subRes = value(10, {})

    const productRows = Array.isArray(productPage?.data) ? productPage.data : []
    const orderRows = (Array.isArray(orderRes?.data) ? orderRes.data : [])
      .filter((row) => inRange(row.created_at || row.createdAt, start, end))
    const userRows = Array.isArray(userRes?.users) ? userRes.users : []
    const vendorRows = Array.isArray(vendorRes?.vendors) ? vendorRes.vendors : []
    const rangedUsers = userRows.filter((row) => inRange(row.created_at || row.createdAt, start, end))
    const rangedVendors = vendorRows.filter((row) => inRange(row.created_at || row.createdAt, start, end))

    setStats({
      products: totalFrom(productTotal),
      inStock: totalFrom(inStock),
      lowStock: totalFrom(lowStock),
      outOfStock: totalFrom(outStock),
      users: rangedUsers.length,
      vendors: rangedVendors.length,
      orders: orderRows.length,
      mainCategories: totalFrom(mainRes),
      categories: totalFrom(catRes),
      subCategories: totalFrom(subRes),
    })

    setOrders(orderRows.slice(0, 5).map((row) => ({
      id: row.id,
      orderId: row.order_number || `#${row.id}`,
      name: row.user?.name || 'Customer',
      email: row.user?.email || '',
      amount: money(row.total_amount),
      status: String(row.status || 'pending').replaceAll('_', ' '),
      color: statusColor(row.status),
    })))

    setProducts(productRows.slice(0, 5).map((row, index) => {
      const name = row.title || row.name || 'Product'
      const stock = Number(row.stock_qty ?? 0)
      return {
        id: row.id,
        initials: initials(name),
        name,
        unit: row.unit?.symbol || row.brand || '',
        price: money(row.effective_price ?? row.discounted_price ?? row.price),
        stock: String(stock),
        status: stock <= 0 ? 'out of stock' : 'available',
        color: AVATAR_COLORS[index % AVATAR_COLORS.length],
      }
    }))

    const mappedUsers = userRows.map((row, index) => ({
      id: `user-${row.id}`,
      sourceId: row.id,
      role: 'user',
      initials: initials(row.name),
      name: row.name || 'User',
      email: row.email || '',
      phone: row.phone || '',
      active: Boolean(row.is_active),
      createdAt: row.created_at || row.createdAt,
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    }))
    const mappedVendors = vendorRows.map((row, index) => ({
      id: `vendor-${row.id}`,
      sourceId: row.id,
      role: 'vendor',
      initials: initials(row.name || row.shop_name),
      name: row.name || row.shop_name || 'Vendor',
      email: row.email || '',
      phone: row.phone || '',
      active: row.status === 'approved' || Boolean(row.is_active),
      createdAt: row.created_at || row.createdAt,
      color: AVATAR_COLORS[(index + 2) % AVATAR_COLORS.length],
    }))
    setMembers(
      [...mappedUsers, ...mappedVendors]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 12)
    )

    const year = new Date().getFullYear()
    setChartSeries({
      orders: monthCounts(Array.isArray(orderRes?.data) ? orderRes.data : [], (row) => row.created_at || row.createdAt, year),
      users: monthCounts(userRows, (row) => row.created_at || row.createdAt, year),
      products: monthCounts(productRows, (row) => row.created_at || row.createdAt, year),
    })

    const failed = settled.filter((item) => item.status === 'rejected')
    if (failed.length === settled.length) {
      setError('Failed to load dashboard data.')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const chartData = useMemo(() => ({
    labels: months,
    datasets: [
      ['Orders', chartSeries.orders, '#00A3FF', 'rgba(0, 163, 255, 0.08)', '#007BFF'],
      ['Members / Users', chartSeries.users, '#C0C0C0', 'rgba(192, 192, 192, 0.06)', '#C0C0C0'],
      ['Products Added', chartSeries.products, '#007BFF', 'rgba(0, 123, 255, 0.1)', '#007BFF'],
    ].map(([label, values, borderColor, backgroundColor, pointBorderColor]) => ({
      label,
      data: values,
      borderColor,
      backgroundColor,
      pointBackgroundColor: label === 'Products Added' ? '#33b5ff' : borderColor === '#C0C0C0' ? '#E0E0E0' : borderColor,
      pointBorderColor,
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  }), [chartSeries])

  const memberCount = stats.users + stats.vendors
  const statCards = [
    [
      ...STAT_META[0],
      stats.products,
      <div key="product-detail" className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
        <span className="text-emerald-400">{stats.inStock} In Stock</span>
        <span className="text-amber-400">{stats.lowStock} Low Stock</span>
        <span className="text-red-400">{stats.outOfStock} Out of Stock</span>
      </div>,
    ],
    [
      ...STAT_META[1],
      memberCount,
      <div key="member-detail" className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <span className="glass-badge rounded-full px-2 py-0.5">{stats.users} User</span>
        <span className="glass-badge rounded-full px-2 py-0.5">{stats.vendors} Vendor</span>
      </div>,
    ],
    [...STAT_META[2], stats.orders],
    [...STAT_META[3], stats.mainCategories],
    [...STAT_META[4], stats.categories],
    [...STAT_META[5], stats.subCategories],
  ].map(([label, accent, iconClass, path, count, detail]) => [label, count, accent, iconClass, path, detail])

  const visibleMembers = members.filter((user) => userFilter === 'all' || user.role === userFilter)

  return (
    <section id="page-dashboard" className="page-view">
      <div className="shield-hero mb-8 p-6">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="live-badge mb-3"><span className="pulse-dot" />System Secured</div>
            <h2 className="title-xl">Dashboard</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-shield-sub">Secure · Defend · Protect</p>
            <p className="mt-2 font-display text-[10px] font-medium tracking-wide text-brand-400/60">{liveDate}</p>
          </div>
          <div className="glass-pill flex flex-wrap gap-1 rounded-xl p-1">
            {['today', 'week', 'month', 'year'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`time-filter ${range === item ? 'active text-white' : 'text-slate-400'} rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:text-white`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="vendor-form-error mb-4">{error}</div> : null}
      {loading ? <p className="mb-4 text-sm text-slate-400">Loading live dashboard data...</p> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat[0]}
            stat={stat}
            onClick={STAT_NAV[stat[0]] ? () => onNavigate?.(STAT_NAV[stat[0]]) : undefined}
          />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="neo-card glass-card cyber-frame p-5 xl:col-span-3">
          <span className="corner corner-tl" /><span className="corner corner-tr" />
          <span className="corner corner-bl" /><span className="corner corner-br" />
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-wide text-shield">Global Analytics</h3>
            <button type="button" onClick={loadDashboard} className="btn-glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
              <Icon className="h-3.5 w-3.5" path="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 12H16.02" />
              Refresh
            </button>
          </div>
          <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium">
            <span className="flex items-center gap-2 text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-glow-sm" />Orders</span>
            <span className="flex items-center gap-2 text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-silver-400" />Members / Users</span>
            <span className="flex items-center gap-2 text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-brand-400 shadow-glow-sm" />Products Added</span>
          </div>
          <div className="h-72"><Line data={chartData} options={chartOptions} /></div>
        </div>
        <TableCard title="Recent Orders" className="xl:col-span-2" onSeeAll={() => onNavigate?.('orders')}>
          <table className="data-table w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-3">Order ID</th>
                <th className="pb-3 pr-3">Customer</th>
                <th className="pb-3 pr-3">Amount</th>
                <th className="pb-3 pr-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">No orders in this range.</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-3 font-semibold text-slate-200">{order.orderId}</td>
                  <td className="py-3 pr-3">
                    <p className="font-medium text-slate-200">{order.name}</p>
                    <p className="text-xs text-slate-400">{order.email}</p>
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-300">{order.amount}</td>
                  <td className={`py-3 pr-3 text-xs font-semibold capitalize ${order.color}`}>{order.status}</td>
                  <td className="py-3">
                    <ViewButton label={order.orderId} onClick={() => onNavigate?.('orders')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TableCard title="Recent Products" onSeeAll={() => onNavigate?.('products')}>
          <table className="data-table w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-3">Product Name</th>
                <th className="pb-3 pr-3">Price</th>
                <th className="pb-3 pr-3">Stock</th>
                <th className="pb-3 pr-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">No products in this range.</td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${product.color}`}>{product.initials}</div>
                      <div>
                        <p className="font-medium text-slate-200">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-300">{product.price}</td>
                  <td className="py-3 pr-3 text-slate-400">{product.stock}</td>
                  <td className={`py-3 pr-3 text-xs font-semibold capitalize ${product.status === 'available' ? 'text-emerald-600' : 'text-red-400'}`}>
                    {product.status}
                  </td>
                  <td className="py-3">
                    <ViewButton label={product.name} onClick={() => onNavigate?.('products')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Recent Users" onSeeAll={() => onNavigate?.('all-users')}>
          <div className="glass-pill mb-4 flex gap-1 rounded-xl p-1">
            {['all', 'vendor', 'user'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setUserFilter(filter)}
                className={`user-filter ${userFilter === filter ? 'active bg-brand-500/20 text-brand-400 shadow-glow-sm' : 'text-slate-400'} rounded-lg px-3 py-1 text-xs font-semibold transition hover:text-white`}
              >
                {filter === 'all' ? 'All' : `${filter[0].toUpperCase()}${filter.slice(1)}s`}
              </button>
            ))}
          </div>
          <table className="data-table w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="pb-3 pr-3">User Name</th>
                <th className="pb-3 pr-3">Phone</th>
                <th className="pb-3 pr-3">Role</th>
                <th className="pb-3 pr-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">No members yet.</td>
                </tr>
              ) : visibleMembers.slice(0, 6).map((user) => (
                <tr key={user.id} data-role={user.role}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.color}`}>{user.initials}</div>
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-400">{user.phone || '—'}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-silver-300">
                      {user.role[0].toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className={`py-3 pr-3 text-xs font-semibold ${user.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="py-3">
                    <ViewButton
                      label={user.name}
                      onClick={() => onNavigate?.(user.role === 'vendor' ? 'vendors' : 'users')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>
    </section>
  )
}

function TableCard({ title, children, className = '', onSeeAll }) {
  return (
    <div className={`neo-card glass-card relative p-5 ${className}`}>
      <div className="relative z-[2] mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-bold tracking-wide text-shield">{title}</h3>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (typeof onSeeAll === 'function') onSeeAll()
          }}
          className="link-glow relative z-[3] shrink-0 cursor-pointer text-xs font-semibold"
        >
          See all
        </button>
      </div>
      <div className="relative z-[1] overflow-x-auto">{children}</div>
    </div>
  )
}
