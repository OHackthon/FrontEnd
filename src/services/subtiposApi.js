import API from '@/services/axiosInterceptor.js'
export default class SubtiposApi {
  async fetchSubtipos() {
    const response = await API.get('subtipos/')
    return response.data
  }
  async fetchSubtiposByMateriaPrima(materiaPrimaId) {
    const response = await API.get(`subtipos/?materia_prima=${materiaPrimaId}`)
    return response.data
  }
  async createSubtipo(subtipo) {
    const response = await API.post('subtipos/', subtipo)
    return response.data
  }
  async updateSubtipo(subtipo) {
    const response = await API.put(`subtipos/${subtipo.id}/`, subtipo)
    return response.data
  }
  async deleteSubtipo(id) {
    await API.delete(`subtipos/${id}/`)
  }
}