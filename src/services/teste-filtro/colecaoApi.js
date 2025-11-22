import API from '@/services/axiosInterceptor.js'

export default class ColecaoApi {
    async fetchColecoes(params = {}) {
        const queryString = new URLSearchParams(params).toString()
        const url = queryString ? `colecoes/?${queryString}` : 'colecoes/'
        const { response } = await API.get(url)
        return response.data
    }

    async fetchColecao(id) {
        const { response } = await API.get(`colecoes/${id}/`)
        return response.data
    }

    async createColecao(colecao) {
        const { response } = await API.post('colecoes/', colecao)
        return response.data
    }

    async updateColecao(colecao) {
        const { response } = await API.put(`colecoes/${colecao.id}/`, colecao)
        return response.data
    }

    async deleteColecao(id) {
        await API.delete(`colecoes/${id}/`)
    }

    // Métodos específicos para filtros
    async fetchColecoesComItens() {
        return await this.fetchColecoes({ tem_itens: true })
    }

    async fetchColecoesSemItens() {
        return await this.fetchColecoes({ tem_itens: false })
    }
}
