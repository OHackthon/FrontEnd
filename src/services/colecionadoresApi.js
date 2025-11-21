import API from '@/services/axiosInterceptor.js'

export default class ColecionadoresApi {
    async fetchColecionadores() {
        const { data } = await API.get('colecionadores/')
        return data
    }
    async createColecionador(colecionador) {
        const { data } = await API.post('colecionadores/', colecionador)
        return data
    }
    async updateColecionador(colecionador) {
        const { data } = await API.put(`colecionadores/${colecionador.id}/`, colecionador)
        return data
    }
    async deleteColecionador(id) {
        await API.delete(`colecionadores/${id}/`)
    }
}