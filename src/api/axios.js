import axios from "axios";
import { API_URL } from "../config/env";

const AUTH_STORAGE_KEY = 'shieldx-admin-auth'

function readAuth() {
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function clearAuth() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"]
    delete config.headers["content-type"]
  }

  const token = readAuth()?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url || "")
    const isAuthCall = /admin-login|verify-otp|forgot-password|reset-password/.test(url)

    if (status === 401 && !isAuthCall) {
      clearAuth()
      window.dispatchEvent(new Event("shieldx-admin-auth-expired"))
    }

    return Promise.reject(error)
  }
)

export default api;
