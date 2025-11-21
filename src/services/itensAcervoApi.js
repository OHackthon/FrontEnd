import API from '@/services/axiosInterceptor.js'

export default class ItensAcervoApi {
  async fetchItens() {
    const response = await API.get('itens-acervo/')
    return response.data
  }
  async createItem(item) {
    const { response } = await API.post('itens-acervo/', item)
    return response.data
  }
  async updateItem(item) {
    const { response } = await API.put(`itens-acervo/${item.id}/`, itemAcervo)
    return response.data
  }
  async deleteItem(id) {
    await API.delete(`itens-acervo/${id}/`)
  }
}
