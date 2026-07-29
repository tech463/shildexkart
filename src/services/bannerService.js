import api from '../api/axios'

export const fetchBannersAPI = async ({ page = 1, limit = 10 } = {}) => {
  // Postman SS ke hisaab se:
  // GET /api/v1/banner/list?page=1&limit=10
  const response = await api.get(`/v1/banner/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createBannerAPI = async (formData) => {
  // Postman SS ke hisaab se:
  // POST /api/v1/banner/create (multipart/form-data)
  const response = await api.post('/v1/banner/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const setBannerStatusAPI = async (id, isActive) => {
  // Postman SS ke hisaab se:
  // POST /api/v1/banner/status/:id
  const response = await api.post(`/v1/banner/status/${id}`, { is_active: Boolean(isActive) })
  return response.data
}

export const deleteBannerAPI = async (id) => {
  // Postman SS ke hisaab se:
  // DELETE /api/v1/banner/delete/:id
  const response = await api.delete(`/v1/banner/delete/${id}`)
  return response.data
}

export const updateBannerAPI = async (id, formData) => {
  // Postman naming ke hisaab se:
  // POST /api/v1/banner/update/:id
  const response = await api.post(`/v1/banner/update/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

