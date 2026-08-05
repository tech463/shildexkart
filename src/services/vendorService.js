import api from '../api/axios'

export const VENDOR_APPROVAL_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

export const fetchVendorsAPI = async (params = {}) => {
  const response = await api.get('/v1/admin/vendors', { params })
  return response.data
}

/** Set vendor approval status: pending | approved | rejected | suspended */
export const setVendorApprovalStatusAPI = async (id, status) => {
  const response = await api.patch(`/v1/admin/vendors/${id}/status`, { status })
  return response.data
}

/**
 * Legacy helper used by Active/Inactive toggle.
 * Active  → approved
 * Inactive → suspended (so rejected stays a true rejection)
 */
export const setVendorStatusAPI = async ({ id, isActive }) => {
  const status = isActive ? 'approved' : 'suspended'
  const response = await api.patch(`/v1/admin/vendors/${id}/status`, { status })
  return response.data
}
