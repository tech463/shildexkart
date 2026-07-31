import api from '../api/axios'

// Postman SS (based on user screenshot):
// GET  /api/v1/admin/users
// PATCH /api/v1/admin/users/:id/status  body: { is_active: boolean }

export const fetchUsersAPI = async () => {
  const response = await api.get('/v1/admin/users')
  return response.data
}

export const setUserStatusAPI = async ({ id, isActive }) => {
  const payload = { is_active: Boolean(isActive) }

  try {
    const response = await api.patch(`/v1/admin/users/${id}/status`, payload)
    return response.data
  } catch (err) {
    // Agar backend PATCH support na kare (404), to POST try karte hain.
    const statusCode = err?.response?.status
    if (statusCode === 404) {
      const response = await api.post(`/v1/admin/users/${id}/status`, payload)
      return response.data
    }
    throw err
  }
}

