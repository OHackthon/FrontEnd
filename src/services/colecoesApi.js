import API from '@/services/axiosInterceptor.js'
export default class ColecoesApi {
    async fetchColecoes() {
        const response = await API.get('colecoes/')
        return response.data
    }
    async createColecao(colecao) {
        const response = await API.post('colecoes/', colecao)
        return response.data
    }
    async updateColecao(colecao) {
        const response = await API.put(`colecoes/${colecao.id}/`, colecao)
        return response.data
    }
    async deleteColecao(id) {
        await API.delete(`colecoes/${id}/`)
    }
}