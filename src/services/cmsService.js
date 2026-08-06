import api from '../api/axios'

// Postman SS (based on screenshots):
// GET  /api/v1/cms/list?page=1&limit=10&search=&status=true
// POST /api/v1/cms/create (form-data)

export const fetchCMSListAPI = async ({ page = 1, limit = 10, search = '', status = true } = {}) => {
  const response = await api.get(
    `/v1/cms/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${status}`,
  )
  return response.data
}

export const createCMSAPI = async (formData) => {
  const response = await api.post('/v1/cms/create', formData)
  return response.data
}

export const updateCMSAPI = async (id, formData) => {
  const response = await api.post(`/v1/cms/update/${id}`, formData)
  return response.data
}

export const setCMSStatusAPI = async (id, isActive) => {
  const response = await api.post(`/v1/cms/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const deleteCMSAPI = async (id) => {
  // Postman me method "DEL cms/delete/:id" dikh raha hai,
  // lekin kabhi backend strict method reject karta hai, isliye fallback bhi add kiya.
  try {
    const response = await api.delete(`/v1/cms/delete/${id}`)
    return response.data
  } catch (err) {
    const statusCode = err?.response?.status
    if (statusCode === 404 || statusCode === 405) {
      const response = await api.post(`/v1/cms/delete/${id}`, {})
      return response.data
    }
    throw err
  }
}

