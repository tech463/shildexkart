import api from '../api/axios'

export const fetchAdminMeAPI = async () => {
  const response = await api.get('/v1/admin/me')
  return response.data
}

export const changeAdminPasswordAPI = async ({ currentPassword, newPassword }) => {
  const response = await api.post('/v1/admin/change-password', {
    currentPassword,
    newPassword,
  })
  return response.data
}
