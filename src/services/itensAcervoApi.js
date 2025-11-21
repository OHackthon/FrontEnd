import API from '@/services/axiosInterceptor.js'

export default class ItensAcervoApi {
    async fetchItens() {
        const { data } = await API.get('itens-acervo/')
        return data
    }
    async createItem(item) {
        const { data } = await API.post('itens-acervo/', item)
        return data
    }
    async updateItem(item) {
        const { data } = await API.put(`itens-acervo/${item.id}/`, itemAcervo)
        return data
    }
    async deleteItem(id) {
        await API.delete(`itens-acervo/${id}/`)
    }
}