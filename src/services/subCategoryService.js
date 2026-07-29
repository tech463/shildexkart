import api from '../api/axios'

export const fetchSubCategoriesAPI = async ({ page = 1, limit = 10 } = {}) => {
  // Postman SS:
  // GET /api/v1/master/sub-category/list?page=1&limit=10
  const response = await api.get(`/v1/master/sub-category/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createSubCategoryAPI = async (formData) => {
  // Postman SS:
  // POST /api/v1/master/sub-category/create (multipart/form-data)
  const response = await api.post('/v1/master/sub-category/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateSubCategoryAPI = async (id, formData) => {
  // Postman SS:
  // POST /api/v1/master/sub-category/update/:id (multipart/form-data)
  const response = await api.post(`/v1/master/sub-category/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const setSubCategoryStatusAPI = async (id, isActive) => {
  // Postman SS:
  // POST /api/v1/master/sub-category/status/:id
  const response = await api.post(`/v1/master/sub-category/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const deleteSubCategoryAPI = async (id) => {
  // Postman SS:
  // POST /api/v1/master/sub-category/delete/:id
  const response = await api.post(`/v1/master/sub-category/delete/${id}`)
  return response.data
}

