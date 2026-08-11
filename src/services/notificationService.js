import api from '../api/axios'

export const dispatchNotificationAPI = async (payload) => {
  const response = await api.post('/v1/notification/dispatch', payload)
  return response.data
}

export const fetchNotificationsAPI = async (params = {}) => {
  const response = await api.get('/v1/notification/list', { params })
  return response.data
}

export const updateNotificationAPI = async (id, payload) => {
  const response = await api.post(`/v1/notification/update/${id}`, payload)
  return response.data
}

export const deleteNotificationAPI = async (id) => {
  const response = await api.post(`/v1/notification/delete/${id}`)
  return response.data
}

export const fetchInboxAPI = async (params = {}) => {
  const response = await api.get('/v1/notification/inbox', { params })
  return response.data
}

export const fetchUnreadCountAPI = async () => {
  const response = await api.get('/v1/notification/inbox/unread-count')
  return response.data
}

export const markInboxReadAPI = async (id) => {
  const response = await api.post(`/v1/notification/inbox/read/${id}`)
  return response.data
}

export const markInboxReadAllAPI = async () => {
  const response = await api.post('/v1/notification/inbox/read-all')
  return response.data
}
