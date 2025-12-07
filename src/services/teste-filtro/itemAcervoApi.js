import API from '@/services/axiosInterceptor.js'
export default class ItemAcervoApi {
    async fetchItensAcervo(params = {}) {
        const queryString = new URLSearchParams(params).toString()
        const url = queryString ? `itens-acervo/?${queryString}` : 'itens-acervo/'
        const { response } = await API.get(url)
        return response.data
    }
    async fetchItemAcervo(id) {
        const { response } = await API.get(`itens-acervo/${id}/`)
        return response.data
    }
    async createItemAcervo(item) {
        const { response } = await API.post('itens-acervo/', item)
        return response.data
    }
    async updateItemAcervo(item) {
        const { response } = await API.put(`itens-acervo/${item.id}/`, item)
        return response.data
    }
    async deleteItemAcervo(id) {
        await API.delete(`itens-acervo/${id}/`)
    }
    async buscarItensComFiltros(filtros = {}, paginacao = {}) {
        const params = {}
        if (filtros.busca_geral) params.busca_geral = filtros.busca_geral
        if (filtros.estado_conservacao) params.estado_conservacao = filtros.estado_conservacao
        if (filtros.colecao) params.colecao = filtros.colecao
        if (filtros.procedencia) params.procedencia__icontains = filtros.procedencia
        if (filtros.datacao) params.datacao__icontains = filtros.datacao
        if (filtros.materia_prima) params.materia_prima = filtros.materia_prima
        if (filtros.localizacao) params.localizacao = filtros.localizacao
        if (paginacao.page) params.page = paginacao.page
        if (paginacao.page_size) params.page_size = paginacao.page_size
        return await this.fetchItensAcervo(params)
    }
}