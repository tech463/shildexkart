import api from '../api/axios'

export const fetchMainCategoriesAPI = async ({ page = 1, limit = 10 } = {}) => {
  // Postman SS ke hisaab se:
  // GET /api/v1/master/main-category/list?page=1&limit=10
  const response = await api.get(`/v1/master/main-category/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createMainCategoryAPI = async (formData) => {
  // Postman SS:
  // POST /api/v1/master/main-category/create (multipart/form-data)
  const response = await api.post('/v1/master/main-category/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateMainCategoryAPI = async (id, formData) => {
  // Postman SS:
  // POST /api/v1/master/main-category/update/:id (multipart/form-data)
  const response = await api.post(`/v1/master/main-category/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const setMainCategoryStatusAPI = async (id, isActive) => {
  // Postman SS:
  // POST /api/v1/master/main-category/status/:id
  const response = await api.post(`/v1/master/main-category/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const deleteMainCategoryAPI = async (id) => {
  // Postman SS:
  // POST /api/v1/master/main-category/delete/:id
  const response = await api.post(`/v1/master/main-category/delete/${id}`)
  return response.data
}

