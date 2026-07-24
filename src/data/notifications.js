export const AUDIENCE_OPTIONS = [
  'All Active Users',
  'Customers',
  'Vendors',
  'Admins',
  'Unread Users',
]

export const ALERT_TYPES = [
  { id: 'info', label: 'Information (Blue)', color: '#3b82f6' },
  { id: 'success', label: 'Success (Green)', color: '#10b981' },
  { id: 'warning', label: 'Warning (Amber)', color: '#f59e0b' },
  { id: 'danger', label: 'Alert (Red)', color: '#ef4444' },
]

export const NOTIFICATION_TEMPLATES = [
  {
    id: 'maintenance',
    label: 'Server Maintenance',
    title: 'Server Maintenance tonight',
    body: 'We will perform scheduled maintenance from 11 PM to 1 AM. Some features may be unavailable.',
    description: 'Plan ahead and complete pending checkouts before the window.',
    actionLink: '/status',
  },
  {
    id: 'sale',
    label: 'Weekend Sale',
    title: 'Weekend Sale is live',
    body: 'Enjoy up to 30% off across selected categories this weekend only.',
    description: 'Offer valid until Sunday midnight.',
    actionLink: '/products',
  },
  {
    id: 'order',
    label: 'Order Update',
    title: 'Your order is on the way',
    body: 'Your recent order has been shipped and is expected to arrive soon.',
    description: 'Track shipment from your orders page.',
    actionLink: '/orders',
  },
]

export const NOTIFICATIONS_HISTORY = []
