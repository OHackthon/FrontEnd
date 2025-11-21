import API from '@/services/axiosInterceptor.js'

export default class LocalizacaoApi {
    async fetchLocalizacoes() {
        const { data } =  await API.get('localizacoes/')
        return data
    }
    async createLocalizacao(localizacao) {
        const { data } = await API.post('localizacoes/', localizacao)
        return data
    }
    async updateLocalizacao(localizacao) {
        const { data } = await API.put(`localizacoes/${localizacao.id}/`, localizacao)
        return data
    }
    async deleteLocalizacao(id) {
        await API.delete(`localizacoes/${id}/`)
    }
}