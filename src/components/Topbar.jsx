import { useEffect, useRef, useState } from 'react'
import { BellIcon, ChevronIcon, MenuIcon, RefreshIcon } from './Icons'
import { fetchInboxAPI, markInboxReadAPI } from '../services/notificationService'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/env'

const AUTH_STORAGE_KEY = 'shieldx-admin-auth'

function relativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days}d ago`
}

function getAdminToken() {
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return ''
    return JSON.parse(raw)?.token || ''
  } catch {
    return ''
  }
}

function Topbar({ onToggleSidebar, sidebarCollapsed, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  const loadInbox = async () => {
    try {
      const res = await fetchInboxAPI({ limit: 8, filter: 'all' })
      setItems(Array.isArray(res?.data) ? res.data : [])
      setUnreadCount(Number(res?.unreadCount || 0))
    } catch {
      setItems([])
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    loadInbox()
  }, [])

  useEffect(() => {
    const token = getAdminToken()
    if (!token) return undefined

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('notification:new', (payload) => {
      setItems((current) => [payload, ...current].slice(0, 8))
      setUnreadCount((count) => count + 1)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

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

  const openItem = async (item, event) => {
    event?.preventDefault?.()
    if (item?.id && !item.is_read) {
      try {
        await markInboxReadAPI(item.id)
        setItems((current) => current.map((row) => (
          row.id === item.id ? { ...row, is_read: true } : row
        )))
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch {
        // ignore and still navigate
      }
    }
    go('notification-inbox', event)
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
            className="icon-3d-btn relative flex h-10 w-10 items-center justify-center rounded-full"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((open) => !open)
              setMenuOpen(false)
              if (!notifOpen) loadInbox()
            }}
          >
            <BellIcon className="h-[18px] w-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>
          <div className={`topbar-dropdown topbar-notif-dropdown${notifOpen ? ' open' : ''}`}>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Notifications</p>
              <button
                type="button"
                className="link-glow relative z-10 cursor-pointer text-xs font-semibold"
                onClick={(event) => go('notification-inbox', event)}
              >
                See all
              </button>
            </div>
            <ul className="space-y-1">
              {items.length === 0 ? (
                <li className="px-2 py-4 text-center text-xs text-slate-500">No notifications yet.</li>
              ) : items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`topbar-notif-item${!item.is_read ? ' is-unread' : ''}`}
                    onClick={(event) => openItem(item, event)}
                  >
                    <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{item.body}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {relativeTime(item.sent_at || item.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 w-full rounded-xl bg-brand-500/20 px-3 py-2 text-xs font-bold text-brand-300 transition hover:bg-brand-500/30"
              onClick={(event) => go('notification-inbox', event)}
            >
              Open notification center
            </button>
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
