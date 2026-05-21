import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Interceptor: agrega token de admin si existe
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: manejo global de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
      return Promise.reject(error)
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Ocurrió un error inesperado'

    // No mostrar toast en errores de validación (400) — el form los maneja
    if (error.response?.status !== 400) {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
