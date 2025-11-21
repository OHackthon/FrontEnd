import API from '@/services/axiosInterceptor.js'

export default class AcervoApi {
    async fetchAcervos() {
        const { data } =  await API.get('acervos/')
        return data
    }
    async createAcervo(acervo) {
        const { data } = await API.post('acervos/', acervo)
        return data
    }
    async updateAcervo(acervo) {
        const { data } = await API.put(`acervos/${acervo.id}/`, acervo)
        return data
    }
    async deleteAcervo(id) {
        await API.delete(`acervos/${id}/`)
    }
}