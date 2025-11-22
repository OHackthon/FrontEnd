import API from '@/services/axiosInterceptor.js'

export default class MateriasPrimasApi {
  async fetchMateriasPrimas() {
    const response = await API.get('materias-primas/')
    return response.data
  }

  async fetchMateriasPrimasChoices() {
    // Retorna as choices estáticas baseadas no modelo Django
    return [
      { value: 'ANIMAL', label: 'Animal' },
      { value: 'VEGETAL', label: 'Vegetal' },
      { value: 'MINERAL', label: 'Mineral' },
      { value: 'OUTRO', label: 'Outro' },
    ]
  }

  async createMateriaPrima(materiaPrima) {
    const response = await API.post('materias-primas/', materiaPrima)
    return response.data
  }
  async updateMateriaPrima(materiaPrima) {
    const response = await API.put(`materias-primas/${materiaPrima.id}/`, materiaPrima)
    return response.data
  }
  async deleteMateriaPrima(id) {
    await API.delete(`materias-primas/${id}/`)
  }
}
