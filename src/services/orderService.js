import api from '../api/axios'

const errMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const fetchOrdersAPI = async (params = {}) => {
  const response = await api.get('/v1/orders/list', { params })
  return response.data
}

export const fetchOrderByIdAPI = async (id) => {
  const response = await api.get(`/v1/orders/${id}`)
  return response.data
}

export const updateOrderStatusAPI = async (id, status, reason = '') => {
  const response = await api.post(`/v1/orders/${id}/status`, { status, reason })
  return response.data
}

export const createShipmentAPI = async (id) => {
  const response = await api.post(`/v1/orders/${id}/ship`)
  return response.data
}

export const trackOrderAPI = async (id) => {
  const response = await api.get(`/v1/orders/${id}/track`)
  return response.data
}

export const fetchPaymentsAPI = async (params = {}) => {
  const response = await api.get('/v1/orders/payments/list', { params })
  return response.data
}

export const fetchAdminAddressesAPI = async (params = {}) => {
  const response = await api.get('/v1/addresses/admin/list', { params })
  return response.data
}

export { errMsg }
