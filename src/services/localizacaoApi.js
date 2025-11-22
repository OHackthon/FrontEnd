import API from '@/services/axiosInterceptor.js'

export default class LocalizacaoApi {
    async fetchLocalizacoes() {
        const response =  await API.get('localizacoes/')
        return response.data
    }
    async createLocalizacao(localizacao) {
        const response = await API.post('localizacoes/', localizacao)
        return response.data
    }
    async updateLocalizacao(localizacao) {
        const response = await API.put(`localizacoes/${localizacao.id}/`, localizacao)
        return response.data
    }
    async deleteLocalizacao(id) {
        await API.delete(`localizacoes/${id}/`)
    }
}