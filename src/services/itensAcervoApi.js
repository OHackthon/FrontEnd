import API from '@/services/axiosInterceptor.js'
export default class ItensAcervoApi {
  async fetchItens() {
    const response = await API.get('itens-acervo/')
    return response.data
  }
  async createItemAcervo(item) {
    const response = await API.post('itens-acervo/', item)
    return response.data
  }
  async updateItem(item) {
    const response = await API.put(`itens-acervo/${item.id}/`, item)
    return response.data
  }
  async deleteItem(id) {
    await API.delete(`itens-acervo/${id}/`)
  }
  async uploadExcel(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await API.post('itens-acervo/upload_excel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}