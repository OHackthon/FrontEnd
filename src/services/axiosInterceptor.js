import axios from 'axios'
import { authService } from './authService'

// Crie a instância
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// Adicione os interceptors DIRETAMENTE na instância API!

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await authService.refreshToken()
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return API(originalRequest)
      } catch (refreshError) {
        authService.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default API
