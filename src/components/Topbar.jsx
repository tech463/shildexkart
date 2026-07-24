import { useEffect, useRef, useState } from 'react'
import { BellIcon, ChevronIcon, MenuIcon, RefreshIcon } from './Icons'

const SAMPLE_NOTIFICATIONS = [
  { id: 1, title: 'Order shipped', body: 'Order #ORD-260715-U4KE is on the way.', time: '2m ago' },
  { id: 2, title: 'Low stock alert', body: 'USB-C Hub Pro is running low.', time: '1h ago' },
  { id: 3, title: 'New vendor signup', body: 'HK Traders requested approval.', time: 'Yesterday' },
]

function Topbar({ onToggleSidebar, sidebarCollapsed, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const closeMenus = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
    }
    document.addEventListener('click', closeMenus)
    return () => document.removeEventListener('click', closeMenus)
  }, [])

  const go = (page, event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()
    setMenuOpen(false)
    setNotifOpen(false)
    onNavigate?.(page)
  }

  return (
    <header id="topbar" className={`glass-topbar fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between px-5 transition-[left] duration-300${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <button id="sidebar-toggle" type="button" className="icon-3d-btn flex h-10 w-10 items-center justify-center rounded-xl" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <button id="refresh-btn" type="button" className="btn-glass flex h-10 w-10 items-center justify-center rounded-full" aria-label="Refresh page" onClick={() => window.location.reload()}>
          <RefreshIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="icon-3d-btn flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((open) => !open)
              setMenuOpen(false)
            }}
          >
            <BellIcon className="h-[18px] w-[18px]" />
          </button>
          <div className={`topbar-dropdown topbar-notif-dropdown${notifOpen ? ' open' : ''}`}>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Notifications</p>
              <button
                type="button"
                className="link-glow relative z-10 cursor-pointer text-xs font-semibold"
                onClick={(event) => go('notifications', event)}
              >
                See all
              </button>
            </div>
            <ul className="space-y-1">
              {SAMPLE_NOTIFICATIONS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="topbar-notif-item"
                    onClick={(event) => go('notifications', event)}
                  >
                    <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{item.body}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">{item.time}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative ml-2" ref={menuRef}>
          <button
            id="user-menu-toggle"
            type="button"
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => {
              setMenuOpen((open) => !open)
              setNotifOpen(false)
            }}
          >
            <span className="user-avatar-3d flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-brand-400">A</span>
            <span className="text-sm font-medium text-slate-200">Admin User</span>
            <ChevronIcon className={`user-chevron h-4 w-4 text-slate-400 transition-transform${menuOpen ? ' rotate-180' : ''}`} />
          </button>
          <div id="user-menu-panel" className={`invisible absolute right-0 top-full z-50 mt-2 w-48 translate-y-1 rounded-xl border border-white/10 bg-black/70 py-1 opacity-0 shadow-glass backdrop-blur-xl transition-all duration-200${menuOpen ? ' open' : ''}`}>
            <button type="button" className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-brand-500/10 hover:text-brand-400" onClick={(event) => go('account', event)}>
              My Profile
            </button>
            <button type="button" className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-brand-500/10 hover:text-brand-400" onClick={(event) => go('account', event)}>
              Account Settings
            </button>
            <hr className="my-1 border-white/10" />
            <button type="button" className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10" onClick={(event) => {
              event?.preventDefault?.()
              event?.stopPropagation?.()
              setMenuOpen(false)
              setNotifOpen(false)
              onLogout?.()
            }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Topbar
