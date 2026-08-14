import { useEffect, useState } from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import BackgroundEffects from './components/BackgroundEffects'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import { useAppNavigate } from './hooks/useAppNavigate'
import { pathToPageId } from './routes/paths'
import AllUsers from './pages/AllUsers'
import Account from './pages/Account'
import Addresses from './pages/Addresses'
import Banners from './pages/Banners'
import Coupons from './pages/Coupons'
import Dashboard from './pages/Dashboard'
import CMS from './pages/CMS'
import EntityListPage from './pages/EntityListPage'
import Invoices from './pages/Invoices'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import NotificationInbox from './pages/NotificationInbox'
import Orders from './pages/Orders'
import PaymentsPage from './pages/PaymentsPage'
import AddProduct from './pages/AddProduct'
import BulkUploadProducts from './pages/BulkUploadProducts'
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

function RequireAuth({ authUser, children }) {
  const location = useLocation()
  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

function GuestOnly({ authUser, children }) {
  if (authUser) {
    return <Navigate to="/" replace />
  }
  return children
}

function AdminLayout({ onLogout, sidebarCollapsed, onToggleSidebar }) {
  const location = useLocation()
  const appNavigate = useAppNavigate()
  const currentPage = pathToPageId(location.pathname)

  return (
    <div className="font-sans antialiased text-slate-200">
      <BackgroundEffects />
      <Sidebar
        currentPage={currentPage}
        onNavigate={appNavigate}
        collapsed={sidebarCollapsed}
      />
      <Topbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        onNavigate={appNavigate}
        onLogout={onLogout}
      />
      <div
        id="main-wrapper"
        className={`relative z-10 ml-64 pt-16 transition-[margin] duration-300${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}
      >
        <main className="min-h-[calc(100vh-4rem)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function withNav(Page) {
  return function RoutedPage() {
    const onNavigate = useAppNavigate()
    return <Page onNavigate={onNavigate} />
  }
}

/** Same as withNav, but stores member payload in location.state for user-insights. */
function withInsightsNav(Page) {
  return function RoutedPage() {
    const onNavigate = useAppNavigate()
    const location = useLocation()
    const bridged = (page, member = null) => {
      if (page === 'user-insights' && member) {
        onNavigate('user-insights', {
          member,
          fromPage: pathToPageId(location.pathname),
        })
        return
      }
      onNavigate(page)
    }
    return <Page onNavigate={bridged} />
  }
}

const DashboardPage = withInsightsNav(Dashboard)
const AllUsersPage = withInsightsNav(AllUsers)
const VendorsPage = withInsightsNav(Vendors)
const UsersPage = withInsightsNav(Users)
const BannersPage = withNav(Banners)
const CMSPage = withNav(CMS)
const ProductsPage = withNav(Products)
const AddProductPage = withNav(AddProduct)
const BulkUploadProductsPage = withNav(BulkUploadProducts)
const OrdersPage = withNav(Orders)
const AddressesPage = withNav(Addresses)
const InvoicesPage = withNav(Invoices)
const CouponsPage = withNav(Coupons)
const NotificationsPage = withNav(Notifications)
const NotificationInboxPage = withNav(NotificationInbox)
const AccountPage = withNav(Account)
const WalletPage = withNav(Wallet)
const SecurityPage = withNav(Security)

function MasterPage({ pageId }) {
  const onNavigate = useAppNavigate()
  return <EntityListPage key={pageId} pageId={pageId} onNavigate={onNavigate} />
}

function InventoryRoute({ stockType }) {
  const onNavigate = useAppNavigate()
  return <StockInventoryPage key={stockType} stockType={stockType} onNavigate={onNavigate} />
}

function PaymentRoute({ paymentType }) {
  const onNavigate = useAppNavigate()
  return <PaymentsPage key={paymentType} paymentType={paymentType} onNavigate={onNavigate} />
}

function UserInsightsRoute() {
  const onNavigate = useAppNavigate()
  const location = useLocation()
  const state = location.state
  const member = state?.member || (state?.email ? state : null)
  const fromPage = state?.fromPage || 'all-users'

  if (!member?.email) {
    return <Navigate to="/users/all" replace />
  }

  return (
    <UserInsights
      member={member}
      onNavigate={onNavigate}
      fromPage={fromPage}
    />
  )
}

function NotFoundPage() {
  const onNavigate = useAppNavigate()
  return (
    <section className="page-view">
      <div className="neo-card glass-card mx-auto max-w-xl p-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-400">404</p>
        <h1 className="mt-3 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          This admin route does not exist or is no longer available.
        </p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400"
          onClick={() => onNavigate('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </section>
  )
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => readStoredAuth())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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

  const handleAuthenticated = ({ email, remember, token }) => {
    setAuthUser({ email, remember: Boolean(remember), token })
    setSidebarCollapsed(false)
    const from = location.state?.from
    navigate(from && from !== '/login' ? from : '/', { replace: true })
  }

  const handleLogout = () => {
    setAuthUser(null)
    setSidebarCollapsed(false)
    navigate('/login', { replace: true })
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={(
          <GuestOnly authUser={authUser}>
            <div className="font-sans antialiased text-slate-200">
              <BackgroundEffects />
              <Login onAuthenticated={handleAuthenticated} />
            </div>
          </GuestOnly>
        )}
      />

      <Route
        element={(
          <RequireAuth authUser={authUser}>
            <AdminLayout
              onLogout={handleLogout}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            />
          </RequireAuth>
        )}
      >
        <Route index element={<DashboardPage />} />
        <Route path="users/all" element={<AllUsersPage />} />
        <Route path="users/vendors" element={<VendorsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/insights" element={<UserInsightsRoute />} />

        <Route path="masters/main-category" element={<MasterPage pageId="main-category" />} />
        <Route path="masters/category" element={<MasterPage pageId="category" />} />
        <Route path="masters/sub-category" element={<MasterPage pageId="sub-category" />} />
        <Route path="masters/units" element={<MasterPage pageId="units" />} />
        <Route path="masters/product-tags" element={<MasterPage pageId="product-tags" />} />

        <Route path="banners" element={<BannersPage />} />
        <Route path="cms" element={<CMSPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<AddProductPage />} />
        <Route path="products/edit/:id" element={<AddProductPage />} />
        <Route path="products/bulk" element={<BulkUploadProductsPage />} />

        <Route path="inventory/in-stock" element={<InventoryRoute stockType="in-stock" />} />
        <Route path="inventory/low-stock" element={<InventoryRoute stockType="low-stock" />} />
        <Route path="inventory/out-of-stock" element={<InventoryRoute stockType="out-of-stock" />} />

        <Route path="orders" element={<OrdersPage />} />

        <Route path="payments/all" element={<PaymentRoute paymentType="all-payments" />} />
        <Route path="payments/pending" element={<PaymentRoute paymentType="pending-payments" />} />
        <Route path="payments/completed" element={<PaymentRoute paymentType="completed-payments" />} />
        <Route path="payments/refunded" element={<PaymentRoute paymentType="refunded-payments" />} />
        <Route path="payments/failed" element={<PaymentRoute paymentType="failed-payments" />} />

        <Route path="addresses" element={<AddressesPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="notifications/inbox" element={<NotificationInboxPage />} />

        <Route path="settings/account" element={<AccountPage />} />
        <Route path="settings/wallet" element={<WalletPage />} />
        <Route path="settings/security" element={<SecurityPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
