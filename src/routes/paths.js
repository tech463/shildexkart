/** Page-id → URL path map for admin navigation */
export const PAGE_PATHS = {
  dashboard: '/',
  'all-users': '/users/all',
  vendors: '/users/vendors',
  users: '/users',
  'user-insights': '/users/insights',
  'main-category': '/masters/main-category',
  category: '/masters/category',
  'sub-category': '/masters/sub-category',
  units: '/masters/units',
  'product-tags': '/masters/product-tags',
  banners: '/banners',
  products: '/products',
  'add-product': '/products/new',
  'in-stock': '/inventory/in-stock',
  'low-stock': '/inventory/low-stock',
  'out-of-stock': '/inventory/out-of-stock',
  orders: '/orders',
  'all-payments': '/payments/all',
  'pending-payments': '/payments/pending',
  'completed-payments': '/payments/completed',
  'refunded-payments': '/payments/refunded',
  'failed-payments': '/payments/failed',
  addresses: '/addresses',
  invoices: '/invoices',
  coupons: '/coupons',
  notifications: '/notifications',
  account: '/settings/account',
  wallet: '/settings/wallet',
  security: '/settings/security',
  login: '/login',
}

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([pageId, path]) => [path, pageId]),
)

export function pageToPath(pageId) {
  return PAGE_PATHS[pageId] || PAGE_PATHS.dashboard
}

export function pathToPageId(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (PATH_TO_PAGE[normalized]) return PATH_TO_PAGE[normalized]
  if (PATH_TO_PAGE[pathname]) return PATH_TO_PAGE[pathname]

  // Prefix matches for nested future routes (e.g. /products/edit/1)
  if (normalized.startsWith('/products')) return 'products'
  if (normalized.startsWith('/users/insights')) return 'user-insights'
  if (normalized.startsWith('/masters/')) {
    const key = normalized.slice('/masters/'.length)
    if (PAGE_PATHS[key]) return key
  }
  if (normalized.startsWith('/inventory/')) return normalized.slice('/inventory/'.length)
  if (normalized.startsWith('/payments/')) {
    const key = `${normalized.slice('/payments/'.length)}-payments`
    if (PAGE_PATHS[key]) return key
  }
  if (normalized.startsWith('/settings/')) return normalized.slice('/settings/'.length)

  return 'dashboard'
}
