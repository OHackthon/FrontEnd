import API from '@/services/axiosInterceptor.js'

export default class ColecoesApi {
    async fetchColecoes() {
        const { data } = await API.get('colecoes/')
        return data
    }
    async createColecao(colecao) {
        const { data } = await API.post('colecoes/', colecao)
        return data
    }
    async updateColecao(colecao) {
        const { data } = await API.put(`colecoes/${colecao.id}/`, colecao)
        return data
    }
    async deleteColecao(id) {
        await API.delete(`colecoes/${id}/`)
    }
}