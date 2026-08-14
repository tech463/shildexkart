import axios from "axios";
import { API_URL } from "../config/env";

const AUTH_STORAGE_KEY = 'shieldx-admin-auth'

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

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return config
    const parsed = JSON.parse(raw)
    const token = parsed?.token
    if (!token) return config

    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // localStorage read/parse failed - ignore and let request go without auth header
  }
  return config
})

export default api;