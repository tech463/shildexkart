import api from '../api/axios'

export const fetchUnitsAPI = async ({ page = 1, limit = 10 } = {}) => {
  // Postman SS:
  // GET /api/v1/master/unit/list?page=1&limit=10
  const response = await api.get(`/v1/master/unit/list?page=${page}&limit=${limit}`)
  return response.data
}

export const createUnitAPI = async (formData) => {
  // Postman SS:
  // POST /api/v1/master/unit/create
  // Important: multipart boundary browser/axios automatically set karega.
  const response = await api.post('/v1/master/unit/create', formData)
  return response.data
}

export const updateUnitAPI = async (id, formData) => {
  // Postman SS:
  // POST /api/v1/master/unit/update/:id
  // Important: multipart boundary browser/axios automatically set karega.
  const response = await api.post(`/v1/master/unit/update/${id}`, formData)
  return response.data
}

export const setUnitStatusAPI = async (id, isActive) => {
  // Postman SS:
  // POST /api/v1/master/unit/status/:id
  const response = await api.post(`/v1/master/unit/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const deleteUnitAPI = async (id) => {
  // Postman SS:
  // POST /api/v1/master/unit/delete/:id
  const response = await api.post(`/v1/master/unit/delete/${id}`)
  return response.data
}

