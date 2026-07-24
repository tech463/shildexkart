import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale,
  PointElement, Tooltip,
} from 'chart.js'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const sourceData = [
  ['Orders', [2, 3, 2, 4, 3, 5, 18, 6, 4, 3, 5, 4], '#00A3FF', 'rgba(0, 163, 255, 0.08)', '#007BFF'],
  ['Members / Users', [1, 2, 1, 2, 2, 3, 12, 4, 3, 2, 3, 2], '#C0C0C0', 'rgba(192, 192, 192, 0.06)', '#C0C0C0'],
  ['Products Added', [5, 8, 6, 10, 12, 15, 280, 20, 14, 11, 9, 7], '#007BFF', 'rgba(0, 123, 255, 0.1)', '#007BFF'],
]
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

const statCards = [
  ['Total Products', 360, '#34d399', 'glass-icon-emerald', 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z', <div key="product-detail" className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium"><span className="text-emerald-400">359 In Stock</span><span className="text-amber-400">0 Low Stock</span><span className="text-red-400">1 Out of Stock</span></div>],
  ['Total Members', 20, '#00A3FF', 'glass-icon-blue', 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z', <div key="member-detail" className="mt-4 flex flex-wrap gap-2 text-xs font-medium"><span className="glass-badge rounded-full px-2 py-0.5">10 User</span><span className="glass-badge rounded-full px-2 py-0.5">6 Vendor</span><span className="glass-badge rounded-full px-2 py-0.5">3 Admin</span><span className="glass-badge rounded-full px-2 py-0.5">1 Super Admin</span></div>],
  ['Total Orders', 42, '#a78bfa', 'glass-icon-violet', 'M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z'],
  ['Main Categories', 36, '#fb923c', 'glass-icon-orange', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
  ['Categories', 231, '#c084fc', 'glass-icon-purple', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 1-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
  ['Sub Categories', 411, '#f472b6', 'glass-icon-pink', 'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 1-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'],
]

const actionPaths = {
  view: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
  viewEye: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  edit: 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125',
  delete: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
}

const INITIAL_ORDERS = [
  { id: 1, orderId: '#ORD-260714-U4KE', name: 'John Doe', email: 'john@example.com', amount: '₹32.00', status: 'pending', color: 'text-amber-500' },
  { id: 2, orderId: '#ORD-260713-M2XP', name: 'Sarah Miller', email: 'sarah@example.com', amount: '₹128.50', status: 'delivered', color: 'text-emerald-600' },
  { id: 3, orderId: '#ORD-260712-K9BN', name: 'Mike Wilson', email: 'mike@example.com', amount: '₹54.00', status: 'cancelled', color: 'text-red-500' },
  { id: 4, orderId: '#ORD-260711-P3QW', name: 'Emma Davis', email: 'emma@example.com', amount: '₹89.99', status: 'delivered', color: 'text-emerald-600' },
]

const INITIAL_PRODUCTS = [
  { id: 1, initials: 'SP', name: 'Sample Product', unit: 'roll', price: '₹25.00', stock: '120', color: 'border border-white/10 bg-white/5 text-silver-300' },
  { id: 2, initials: 'MS', name: 'My Milk Store', unit: 'kg', price: '₹48.00', stock: '85', color: 'bg-amber-50 text-amber-600' },
  { id: 3, initials: 'OF', name: 'Organic Flour', unit: 'kg', price: '₹62.00', stock: '200', color: 'bg-blue-50 text-blue-600' },
]

const INITIAL_USERS = [
  { id: 1, role: 'vendor', initials: 'R', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', color: 'bg-teal-100 text-teal-700' },
  { id: 2, role: 'user', initials: 'P', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 87654 32109', color: 'bg-violet-100 text-violet-700' },
  { id: 3, role: 'vendor', initials: 'A', name: 'Amit Patel', email: 'amit@example.com', phone: '+91 76543 21098', color: 'bg-orange-100 text-orange-700' },
  { id: 4, role: 'user', initials: 'S', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 65432 10987', color: 'bg-pink-100 text-pink-700' },
]

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function ActionButtons({ label, onView, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className="action-btn" aria-label={`View ${label}`} onClick={onView}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d={actionPaths.view} />
          <path strokeLinecap="round" strokeLinejoin="round" d={actionPaths.viewEye} />
        </svg>
      </button>
      <button type="button" className="action-btn" aria-label={`Edit ${label}`} onClick={onEdit}>
        <Icon className="h-4 w-4" path={actionPaths.edit} />
      </button>
      <button type="button" className="action-btn action-btn-danger" aria-label={`Delete ${label}`} onClick={onDelete}>
        <Icon className="h-4 w-4" path={actionPaths.delete} />
      </button>
    </div>
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
          <p className="mt-1 text-3xl font-bold stat-value" data-count={count}>{count}</p>
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
  const [version, setVersion] = useState(0)
  const [liveDate, setLiveDate] = useState('')
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    setLiveDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).toUpperCase())
  }, [])

  const chartData = useMemo(() => ({
    labels: months,
    datasets: sourceData.map(([label, values, borderColor, backgroundColor, pointBorderColor]) => ({
      label,
      data: values.map((value) => Math.max(0, value + (version ? Math.round((Math.random() - 0.5) * Math.max(2, value * 0.2)) : 0))),
      borderColor, backgroundColor,
      pointBackgroundColor: label === 'Products Added' ? '#33b5ff' : borderColor === '#C0C0C0' ? '#E0E0E0' : borderColor,
      pointBorderColor, tension: 0.4, fill: false, pointRadius: 3, pointHoverRadius: 5,
    })),
  }), [version])

  const confirmDelete = () => {
    if (!deleting) return
    if (deleting.type === 'order') setOrders((current) => current.filter((row) => row.id !== deleting.id))
    if (deleting.type === 'product') setProducts((current) => current.filter((row) => row.id !== deleting.id))
    if (deleting.type === 'user') setUsers((current) => current.filter((row) => row.id !== deleting.id))
    setDeleting(null)
  }

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
            {['today', 'week', 'month', 'year', 'custom'].map((item) => (
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
            <button type="button" onClick={() => setVersion((value) => value + 1)} className="btn-glass flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium">
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-3 font-semibold text-slate-200">{order.orderId}</td>
                  <td className="py-3 pr-3">
                    <p className="font-medium text-slate-200">{order.name}</p>
                    <p className="text-xs text-slate-400">{order.email}</p>
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-300">{order.amount}</td>
                  <td className={`py-3 pr-3 text-xs font-semibold capitalize ${order.color}`}>{order.status}</td>
                  <td className="py-3">
                    <ActionButtons
                      label={order.orderId}
                      onView={() => onNavigate?.('orders')}
                      onEdit={() => onNavigate?.('orders')}
                      onDelete={() => setDeleting({ type: 'order', id: order.id, name: order.orderId })}
                    />
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
              {products.map((product) => (
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
                  <td className="py-3 pr-3 text-xs font-semibold capitalize text-emerald-600">available</td>
                  <td className="py-3">
                    <ActionButtons
                      label={product.name}
                      onView={() => onNavigate?.('products')}
                      onEdit={() => onNavigate?.('products')}
                      onDelete={() => setDeleting({ type: 'product', id: product.id, name: product.name })}
                    />
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
              {users.filter((user) => userFilter === 'all' || user.role === userFilter).map((user) => (
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
                  <td className="py-3 pr-3 text-slate-400">{user.phone}</td>
                  <td className="py-3 pr-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-silver-300">
                      {user.role[0].toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-xs font-semibold text-emerald-600">Active</td>
                  <td className="py-3">
                    <ActionButtons
                      label={user.name}
                      onView={() => onNavigate?.('user-insights', {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role === 'vendor' ? 'Vendor' : 'User',
                      })}
                      onEdit={() => onNavigate?.(user.role === 'vendor' ? 'vendors' : 'users')}
                      onDelete={() => setDeleting({ type: 'user', id: user.id, name: user.name })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        itemName={deleting?.name || ''}
        title="Delete Item"
      />
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
