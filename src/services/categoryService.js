import api from '../api/axios'

export const fetchCategoriesAPI = async ({ page = 1, limit = 10 } = {}) => {
  // Postman SS:
  // GET /api/v1/master/category/list?page=1&limit=10
  const response = await api.get(`/v1/master/category/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createCategoryAPI = async (formData) => {
  // Postman SS:
  // POST /api/v1/master/category/create (multipart/form-data)
  const response = await api.post('/v1/master/category/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateCategoryAPI = async (id, formData) => {
  // Postman SS:
  // POST /api/v1/master/category/update/:id (multipart/form-data)
  const response = await api.post(`/v1/master/category/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const setCategoryStatusAPI = async (id, isActive) => {
  // Postman SS:
  // POST /api/v1/master/category/status/:id
  const response = await api.post(`/v1/master/category/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const deleteCategoryAPI = async (id) => {
  // Postman SS:
  // POST /api/v1/master/category/delete/:id
  const response = await api.post(`/v1/master/category/delete/${id}`)
  return response.data
}

