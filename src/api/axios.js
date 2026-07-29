import axios from "axios";

const AUTH_STORAGE_KEY = 'shieldx-admin-auth'

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return config
    const parsed = JSON.parse(raw)
    const token = parsed?.token
    if (!token) return config

    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // localStorage read/parse failed - ignore and let request go without auth header
  }
  return config
})

export default api;