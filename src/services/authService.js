import axios from 'axios'
import API from '@/services/axiosInterceptor.js'

export const authService = {
  async refreshToken() {
    const refresh = localStorage.getItem('refresh_token')
    const response = await API.post(`token/refresh/`, {
      refresh,
    })

    localStorage.setItem('access_token', response.data.access)
    return response.data.access
  },
}
