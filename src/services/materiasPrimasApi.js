import API from '@/services/axiosInterceptor.js'

export default class MateriasPrimasApi {
    async fetchMateriasPrimas() {
        const { data } = await API.get('materias-primas/')
        return data
    }
    async createMateriaPrima(materiaPrima) {
        const { data } = await API.post('materias-primas/', materiaPrima)
        return data
    }
    async updateMateriaPrima(materiaPrima) {
        const { data } = await API.put(`materias-primas/${materiaPrima.id}/`, materiaPrima)
        return data
    }
    async deleteMateriaPrima(id) {
        await API.delete(`materias-primas/${id}/`)
    }
}