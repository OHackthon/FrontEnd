import API from '@/services/axiosInterceptor.js'
export default class ColecionadoresApi {
    async fetchColecionadores() {
        const response = await API.get('colecionadores/')
        return response.data
    }
    async createColecionador(colecionador) {
        const response = await API.post('colecionadores/', colecionador)
        return response.data
    }
    async updateColecionador(colecionador) {
        const response = await API.put(`colecionadores/${colecionador.id}/`, colecionador)
        return response.data
    }
    async deleteColecionador(id) {
        await API.delete(`colecionadores/${id}/`)
    }
}