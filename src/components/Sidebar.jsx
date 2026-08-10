import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BannerIcon, BellIcon, CalendarIcon, CheckIcon, ChevronIcon, ClockIcon,
  DashboardIcon, FolderIcon, GridIcon, InventoryIcon, InvoiceIcon, LayersIcon, ListIcon,
  MailIcon, PaymentIcon, ProductsIcon, SettingsIcon, ShieldIcon, StarIcon, TagIcon,
  UnitIcon, UserIcon, UsersIcon,
} from './Icons'
import { pageToPath } from '../routes/paths'

const mainLinkClass = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-brand-400'
const subLinkClass = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-brand-400'

const PAGE_GROUP = {
  'all-users': 'users',
  vendors: 'users',
  users: 'users',
  'user-insights': 'users',
  'main-category': 'masters',
  category: 'masters',
  'sub-category': 'masters',
  units: 'masters',
  'product-tags': 'masters',
  'add-product': 'products',
  'edit-product': 'products',
  'bulk-upload-products': 'products',
  'in-stock': 'inventory',
  'low-stock': 'inventory',
  'out-of-stock': 'inventory',
  'all-payments': 'payment',
  'pending-payments': 'payment',
  'completed-payments': 'payment',
  'refunded-payments': 'payment',
  'failed-payments': 'payment',
  notifications: 'notifications',
  'notification-inbox': 'notifications',
  account: 'settings',
  wallet: 'settings',
  security: 'settings',
}

const dropdowns = [
  {
    id: 'users', label: 'My Users', icon: UsersIcon, itemClass: 'nav-item-users',
    buttonClass: 'hover:bg-pink-950/40 hover:text-pink-400',
    links: [
      { id: 'all-users', label: 'All Users', icon: UsersIcon },
      { id: 'vendors', label: 'Vendor', icon: UserIcon },
      { id: 'users', label: 'User', icon: UserIcon },
    ],
  },
  {
    id: 'masters', label: 'Masters', icon: GridIcon, itemClass: 'nav-item-masters',
    buttonClass: 'hover:bg-cyan-950/40 hover:text-cyan-400',
    links: [
      { id: 'main-category', label: 'Main Category', icon: FolderIcon },
      { id: 'category', label: 'Category', icon: ListIcon },
      { id: 'sub-category', label: 'Sub Category', icon: LayersIcon },
      { id: 'units', label: 'Units', icon: UnitIcon },
      { id: 'product-tags', label: 'Product Tags', icon: TagIcon },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: InventoryIcon, itemClass: 'nav-item-inventory',
    buttonClass: 'border border-transparent hover:bg-teal-950/40 hover:text-teal-400',
    links: [
      { id: 'in-stock', label: 'In Stock', status: 'check' },
      { id: 'low-stock', label: 'Low Stock', status: 'info' },
      { id: 'out-of-stock', label: 'Out of Stock', status: 'alert' },
    ],
  },
  {
    id: 'payment', label: 'Payment', icon: PaymentIcon, itemClass: 'nav-item-payment',
    buttonClass: 'hover:bg-rose-950/40 hover:text-rose-400',
    links: [
      { id: 'all-payments', label: 'All Payments', icon: ClockIcon },
      { id: 'pending-payments', label: 'Pending', icon: ClockIcon },
      { id: 'completed-payments', label: 'Completed', status: 'check' },
      { id: 'refunded-payments', label: 'Refunded', icon: ClockIcon },
      { id: 'failed-payments', label: 'Failed', icon: ClockIcon },
    ],
  },
  {
    id: 'notifications', label: 'Notifications', icon: BellIcon, itemClass: 'nav-item-notifications',
    buttonClass: 'hover:bg-sky-950/40 hover:text-sky-400',
    links: [
      { id: 'notification-inbox', label: 'My Inbox', icon: MailIcon },
      { id: 'notifications', label: 'Direct Broadcast', icon: BellIcon },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: SettingsIcon, itemClass: 'nav-item-settings',
    buttonClass: 'hover:bg-white/5 hover:text-white',
    links: [
      { id: 'account', label: 'Account', icon: UserIcon },
      { id: 'wallet', label: 'Wallet', icon: PaymentIcon },
      { id: 'security', label: 'Security', icon: ShieldIcon },
    ],
  },
]

function StatusIcon({ type }) {
  if (type === 'check') return <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-500"><CheckIcon className="h-3 w-3 text-white" /></span>
  if (type === 'info') return <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">i</span>
  return <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">!</span>
}

function Sidebar({ currentPage, collapsed = false }) {
  const [openDropdown, setOpenDropdown] = useState(PAGE_GROUP[currentPage] || null)

  useEffect(() => {
    const group = PAGE_GROUP[currentPage]
    if (group && group !== 'products') setOpenDropdown(group)
  }, [currentPage])

  const activeClassFor = (id) => {
    const isActive =
      currentPage === id
      || (id === 'products' && (currentPage === 'add-product' || currentPage === 'edit-product' || currentPage === 'bulk-upload-products'))
      || (id === 'all-users' && currentPage === 'user-insights')
    if (!isActive) return ''
    if (id === 'users' || id === 'all-users') return 'nav-active-pink'
    return 'nav-active'
  }

  const renderPageLink = ({ id, label, icon: Icon, status }) => (
    <li key={id}>
      <NavLink
        to={pageToPath(id)}
        data-page={id}
        className={`nav-page-link ${subLinkClass} ${activeClassFor(id)}`}
      >
        {status ? <StatusIcon type={status} /> : <span className="sidebar-icon sidebar-icon-sub"><Icon /></span>}
        {label}
      </NavLink>
    </li>
  )

  const renderDropdown = ({ id, label, icon: Icon, itemClass, buttonClass, links }) => (
    <li key={id} className={`nav-item ${itemClass}${openDropdown === id ? ' open' : ''}`}>
      <button type="button" className={`nav-toggle flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition ${buttonClass}`} aria-expanded={openDropdown === id} onClick={() => setOpenDropdown(openDropdown === id ? null : id)}>
        <span className="flex items-center gap-3"><span className="sidebar-icon sidebar-icon-main"><Icon /></span>{label}</span><ChevronIcon className="chevron" />
      </button>
      <ul className={`submenu mt-1 space-y-0.5 pl-3${openDropdown === id ? ' open' : ''}`}>{links.map(renderPageLink)}</ul>
    </li>
  )

  return (
    <aside id="sidebar" className={`glass-sidebar fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transition-transform duration-300${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-glow" aria-hidden="true" />
      <div className="border-b border-white/5 bg-black/40 px-4 py-4 backdrop-blur-xl">
        <div className="mb-3 overflow-hidden rounded-xl border border-white/5 bg-black/60 p-2 shadow-glow-sm">
          <img src="/shieldx-logo.png" alt="ShieldX logo" className="mx-auto h-auto w-full max-h-14 object-contain" />
        </div>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-sm font-bold leading-tight text-shield">ShieldX Ecommerce</h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-shield-sub">Admin User</p>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-0.5">
          <li>
            <NavLink to={pageToPath('dashboard')} data-page="dashboard" className={`${mainLinkClass} ${activeClassFor('dashboard')}`}>
              <span className="sidebar-icon sidebar-icon-main"><DashboardIcon /></span>Dashboard
            </NavLink>
          </li>

          {dropdowns.filter((item) => ['users', 'masters'].includes(item.id)).map(renderDropdown)}

          {[
            ['banners', 'Banners', BannerIcon],
            ['cms', 'CMS', ListIcon],
            ['products', 'Products', ProductsIcon],
          ].map(([id, label, Icon]) => (
            <li key={id}>
              <NavLink to={pageToPath(id)} data-page={id} className={`${mainLinkClass} ${activeClassFor(id)}`}>
                <span className="sidebar-icon sidebar-icon-main"><Icon /></span>{label}
              </NavLink>
            </li>
          ))}

          {dropdowns.filter((item) => item.id === 'inventory').map(renderDropdown)}

          <li>
            <NavLink to={pageToPath('orders')} data-page="orders" className={`${mainLinkClass} ${activeClassFor('orders')}`}>
              <span className="sidebar-icon sidebar-icon-main"><CalendarIcon /></span>Orders
            </NavLink>
          </li>

          {dropdowns.filter((item) => item.id === 'payment').map(renderDropdown)}

          {[
            ['addresses', 'Addresses', MailIcon],
            ['invoices', 'Invoices', InvoiceIcon],
            ['coupons', 'Coupons', StarIcon],
          ].map(([id, label, Icon]) => (
            <li key={id}>
              <NavLink to={pageToPath(id)} data-page={id} className={`${mainLinkClass} ${activeClassFor(id)}`}>
                <span className="sidebar-icon sidebar-icon-main"><Icon /></span>{label}
              </NavLink>
            </li>
          ))}

          {dropdowns.filter((item) => item.id === 'notifications').map(renderDropdown)}

          {dropdowns.filter((item) => item.id === 'settings').map(renderDropdown)}
        </ul>
      </nav>
      <div className="border-t border-white/5 px-5 py-4">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.25em] text-silver-400/50">Secure · Defend · Protect</p>
      </div>
    </aside>
  )
}

export default Sidebar
