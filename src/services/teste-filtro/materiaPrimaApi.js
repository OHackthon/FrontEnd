import API from '@/services/axiosInterceptor.js'

export default class MateriaPrimaApi {
    async fetchMateriasPrimas() {
        const { response } = await API.get('materias-primas/')
        return response.data
    }

    async fetchMateriaPrima(id) {
        const { response } = await API.get(`materias-primas/${id}/`)
        return response.data
    }

    async createMateriaPrima(materiaPrima) {
        const { response } = await API.post('materias-primas/', materiaPrima)
        return response.data
    }

    async updateMateriaPrima(materiaPrima) {
        const { response } = await API.put(`materias-primas/${materiaPrima.id}/`, materiaPrima)
        return response.data
    }

    async deleteMateriaPrima(id) {
        await API.delete(`materias-primas/${id}/`)
    }
}
