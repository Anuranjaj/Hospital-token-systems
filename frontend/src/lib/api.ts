import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const PUBLIC_ENDPOINTS = [
  "/auth/token/",
  "/auth/token/refresh/",
  "/departments/",
  "/doctors/",
  "/tokens/live/",
]

const normalizeUrl = (url?: string) => {
  if (!url) return ""
  return url.startsWith("/") ? url : `/${url}`
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    const requestUrl = normalizeUrl(config.url)
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      requestUrl === endpoint || requestUrl.startsWith(endpoint)
    )

    if (token && !isPublicEndpoint) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    } else if (config.headers) {
      delete config.headers.Authorization
    }
  }
  return config
})

export default api
