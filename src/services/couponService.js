import api from '../api/axios'

// Postman SS (COUPAN collection):
// GET    /api/v1/coupons/list?page=1&limit=10
// GET    /api/v1/coupons/:id
// POST   /api/v1/coupons/create        body: { name, amount, amount_type }
// POST   /api/v1/coupons/:id/update    body: { name, amount, amount_type }
// DELETE /api/v1/coupons/:id           → { success, message }

export const fetchCouponsAPI = async ({ page = 1, limit = 50, search = '', date_from = '', date_to = '' } = {}) => {
  const response = await api.get('/v1/coupons/list', {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(date_from ? { date_from } : {}),
      ...(date_to ? { date_to } : {}),
    },
  })
  return response.data
}

export const fetchCouponByIdAPI = async (id) => {
  const response = await api.get(`/v1/coupons/${id}`)
  return response.data
}

export const createCouponAPI = async (payload) => {
  const response = await api.post('/v1/coupons/create', payload)
  return response.data
}

export const updateCouponAPI = async (id, payload) => {
  const response = await api.post(`/v1/coupons/${id}/update`, payload)
  return response.data
}

export const setCouponStatusAPI = async (id, isActive) => {
  const body = { is_active: Boolean(isActive) }

  try {
    const response = await api.post(`/v1/coupons/${id}/status`, body)
    return response.data
  } catch (error) {
    // Kuch backends status ko update endpoint se hi handle karte hain.
    const statusCode = error?.response?.status
    if (statusCode === 404 || statusCode === 405) {
      const response = await api.post(`/v1/coupons/${id}/update`, body)
      return response.data
    }
    throw error
  }
}

export const deleteCouponAPI = async (id) => {
  const response = await api.delete(`/v1/coupons/${id}`)
  return response.data
}
