import axios from 'axios'
import { authService } from './authService'

const API = axios.create({
  // baseURL: 'render',
  baseURL: 'http://127.0.0.1:8000/api/',
})

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await authService.refreshToken()
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axios(originalRequest)
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