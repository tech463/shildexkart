import { useEffect, useState } from 'react'
import BackgroundEffects from './components/BackgroundEffects'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { PAGE_CONFIGS } from './data/pages'
import AllUsers from './pages/AllUsers'
import Account from './pages/Account'
import Addresses from './pages/Addresses'
import Banners from './pages/Banners'
import Coupons from './pages/Coupons'
import Dashboard from './pages/Dashboard'
import EntityListPage from './pages/EntityListPage'
import Invoices from './pages/Invoices'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import Orders from './pages/Orders'
import PaymentsPage from './pages/PaymentsPage'
import Products from './pages/Products'
import Security from './pages/Security'
import StockInventoryPage from './pages/StockInventoryPage'
import UserInsights from './pages/UserInsights'
import Vendors from './pages/Vendors'
import Users from './pages/Users'
import Wallet from './pages/Wallet'

const AUTH_STORAGE_KEY = 'shieldx-admin-auth'

function readStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => readStoredAuth())
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMember, setViewMember] = useState(null)
  const [insightsFrom, setInsightsFrom] = useState('all-users')

  useEffect(() => {
    if (!authUser) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }
    if (authUser.remember) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [authUser])

  const navigate = (page, member = null) => {
    if (page === 'user-insights' && member) {
      setViewMember(member)
      setInsightsFrom(currentPage === 'dashboard' ? 'all-users' : currentPage)
    }
    if (page !== 'user-insights') {
      setViewMember(null)
    }
    setCurrentPage(page)
  }

  const handleAuthenticated = ({ email, remember }) => {
    setAuthUser({ email, remember: Boolean(remember) })
    setCurrentPage('dashboard')
    setSidebarCollapsed(false)
  }

  const handleLogout = () => {
    setAuthUser(null)
    setCurrentPage('dashboard')
    setViewMember(null)
    setSidebarCollapsed(false)
  }

  const renderPage = () => {
    if (currentPage === 'dashboard') return <Dashboard onNavigate={navigate} />
    if (currentPage === 'all-users') return <AllUsers onNavigate={navigate} />
    if (currentPage === 'vendors') return <Vendors onNavigate={navigate} />
    if (currentPage === 'users') return <Users onNavigate={navigate} />
    if (currentPage === 'banners') return <Banners onNavigate={navigate} />
    if (currentPage === 'products') return <Products onNavigate={navigate} />
    if (currentPage === 'orders') return <Orders onNavigate={navigate} />
    if (currentPage === 'addresses') return <Addresses onNavigate={navigate} />
    if (currentPage === 'invoices') return <Invoices onNavigate={navigate} />
    if (currentPage === 'coupons') return <Coupons onNavigate={navigate} />
    if (currentPage === 'notifications') return <Notifications onNavigate={navigate} />
    if (currentPage === 'account') return <Account onNavigate={navigate} />
    if (currentPage === 'wallet') return <Wallet onNavigate={navigate} />
    if (currentPage === 'security') return <Security onNavigate={navigate} />
    if (
      currentPage === 'all-payments'
      || currentPage === 'pending-payments'
      || currentPage === 'completed-payments'
      || currentPage === 'refunded-payments'
      || currentPage === 'failed-payments'
    ) {
      return <PaymentsPage key={currentPage} paymentType={currentPage} onNavigate={navigate} />
    }
    if (currentPage === 'in-stock' || currentPage === 'low-stock' || currentPage === 'out-of-stock') {
      return <StockInventoryPage key={currentPage} stockType={currentPage} onNavigate={navigate} />
    }
    if (currentPage === 'user-insights') {
      return (
        <UserInsights
          member={viewMember}
          onNavigate={navigate}
          fromPage={insightsFrom}
        />
      )
    }
    if (PAGE_CONFIGS[currentPage]) {
      return <EntityListPage key={currentPage} pageId={currentPage} onNavigate={navigate} />
    }
    return (
      <section className="page-view">
        <div className="neo-card glass-card p-8">
          <p className="text-sm text-slate-400">Page not found.</p>
        </div>
      </section>
    )
  }

  if (!authUser) {
    return (
      <div className="font-sans antialiased text-slate-200">
        <BackgroundEffects />
        <Login onAuthenticated={handleAuthenticated} />
      </div>
    )
  }

  return (
    <div className="font-sans antialiased text-slate-200">
      <BackgroundEffects />
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
      />
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <div
        id="main-wrapper"
        className={`relative z-10 ml-64 pt-16 transition-[margin] duration-300${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
      >
        <main className="min-h-[calc(100vh-4rem)] p-6">{renderPage()}</main>
      </div>
    </div>
  )
}
