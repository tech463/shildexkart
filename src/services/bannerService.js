import api from '../api/axios'

export const fetchBannersAPI = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/v1/banner/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createBannerAPI = async (formData) => {
  const response = await api.post('/v1/banner/create', formData)
  return response.data
}

export const setBannerStatusAPI = async (id, isActive) => {
  const response = await api.post(`/v1/banner/status/${id}`, { is_active: Boolean(isActive) })
  return response.data
}

export const deleteBannerAPI = async (id) => {
  const response = await api.delete(`/v1/banner/delete/${id}`)
  return response.data
}

export const updateBannerAPI = async (id, formData) => {
  const response = await api.post(`/v1/banner/update/${id}`, formData)
  return response.data
}
