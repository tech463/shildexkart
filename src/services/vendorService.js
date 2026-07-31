import api from '../api/axios'

// Postman SS (approx):
// GET  /api/v1/admin/vendors
// PATCH /api/v1/admin/vendors/:id/status  body: { status: "approved" | "inactive" }

export const fetchVendorsAPI = async () => {
  const response = await api.get('/v1/admin/vendors')
  return response.data
}

export const setVendorStatusAPI = async ({ id, isActive }) => {
  const status = isActive ? 'approved' : 'rejected'
  console.log('[vendorService] setVendorStatusAPI payload:', { id, isActive, status })
  const response = await api.patch(`/v1/admin/vendors/${id}/status`, {
    // Backend screenshot shows "approved" for Active.
    // Backend allowed values: pending, approved, rejected, suspended.
    // Inactive ke liye "rejected" send karein taaki is_active false set ho.
    status,
  })
  return response.data
}

