import api from '../api/axios'

const errMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const fetchInvoicesAPI = async (params = {}) => {
  const response = await api.get('/v1/invoices/list', { params })
  return response.data
}

export const fetchInvoiceByIdAPI = async (id) => {
  const response = await api.get(`/v1/invoices/${id}`)
  return response.data
}

export const updateInvoiceAPI = async (id, payload) => {
  const response = await api.post(`/v1/invoices/${id}/update`, payload)
  return response.data
}

export const deleteInvoiceAPI = async (id) => {
  const response = await api.delete(`/v1/invoices/${id}`)
  return response.data
}

export const syncInvoicesAPI = async () => {
  const response = await api.post('/v1/invoices/sync')
  return response.data
}

export { errMsg }
