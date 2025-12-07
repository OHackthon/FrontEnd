import API from '@/services/axiosInterceptor.js'
export default class AcervoApi {
    async fetchAcervos() {
        const response =  await API.get('acervos/')
        return response.data
    }
    async createAcervo(acervo) {
        const response = await API.post('acervos/', acervo)
        return response.data
    }
    async updateAcervo(acervo) {
        const response = await API.put(`acervos/${acervo.id}/`, acervo)
        return response.data
    }
    async deleteAcervo(id) {
        await API.delete(`acervos/${id}/`)
    }
}