import api from '../api/axios'

export const fetchProductFormOptionsAPI = async () => {
  const response = await api.get('/v1/product/form-options')
  return response.data
}

export const fetchCategoriesByMainAPI = async (mainCategoryId) => {
  const response = await api.get('/v1/product/categories', {
    params: { main_category_id: mainCategoryId },
  })
  return response.data
}

export const fetchSubCategoriesByMainAPI = async ({ mainCategoryId, categoryId } = {}) => {
  const response = await api.get('/v1/product/sub-categories', {
    params: {
      ...(mainCategoryId ? { main_category_id: mainCategoryId } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
    },
  })
  return response.data
}

export const fetchProductsAPI = async (params = {}) => {
  const response = await api.get('/v1/product/list', { params })
  return response.data
}

export const fetchProductByIdAPI = async (id) => {
  const response = await api.get(`/v1/product/${id}`)
  return response.data
}

export const createProductAPI = async (formData) => {
  const response = await api.post('/v1/product/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateProductAPI = async (id, formData) => {
  const response = await api.post(`/v1/product/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateProductInventoryAPI = async (id, payload) => {
  const response = await api.post(`/v1/product/inventory/${id}`, payload)
  return response.data
}

export const setProductStatusAPI = async (id, isActive) => {
  const response = await api.post(`/v1/product/status/${id}`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export const setProductApprovalAPI = async (id, approvalStatus, rejectionReason = '') => {
  const response = await api.post(`/v1/product/approval/${id}`, {
    approval_status: approvalStatus,
    rejection_reason: rejectionReason,
  })
  return response.data
}

export const deleteProductAPI = async (id) => {
  const response = await api.post(`/v1/product/delete/${id}`)
  return response.data
}

export const bulkDeleteProductsAPI = async (ids = []) => {
  const response = await api.post('/v1/product/bulk-delete', { ids })
  return response.data
}

export const downloadProductBulkSampleAPI = async () => {
  const response = await api.get('/v1/product/bulk-sample', {
    responseType: 'blob',
  })
  return response.data
}

export const bulkUploadProductsAPI = async (file, action = 'publish') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('action', action)
  const response = await api.post('/v1/product/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
