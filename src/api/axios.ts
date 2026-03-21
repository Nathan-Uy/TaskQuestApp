import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/')
    const hasToken       = !!sessionStorage.getItem('token')

    if (err.response?.status === 401 && !isAuthEndpoint && hasToken) {
      sessionStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(err)
  },
)

export default api