import API from '@/services/axiosInterceptor.js'

export default class UsersApi {
  async fetchUsers() {
    const response = await API.get('users/')
    return response.data
  }

  async createUser(userData) {
    const response = await API.post('users/', userData)
    return response.data
  }

  async updateUser(id, userData) {
    const response = await API.patch(`users/${id}/`, userData)
    return response.data
  }

  async deleteUser(id) {
    await API.delete(`users/${id}/`)
  }
}
