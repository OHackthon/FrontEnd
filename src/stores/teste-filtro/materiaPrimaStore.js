import { defineStore } from 'pinia'
import { ref } from 'vue'
import MateriaPrimaApi from '@/services/materiaPrimaApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const materiaPrimaApi = new MateriaPrimaApi()

export const useMateriaPrimaStore = defineStore('materiaPrima', () => {

  const materiasPrimas = ref([])
  const materiaPrimaAtual = ref(null)
  const newMateriaPrima = ref({
    id: null,
    nome_materia: '',
    descricao_materia: ''
  })

  const fetchMateriasPrimas = async () => {
    loadingStore.isLoading = true
    const data = await materiaPrimaApi.fetchMateriasPrimas()
    materiasPrimas.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const fetchMateriaPrima = async (id) => {
    loadingStore.isLoading = true
    const data = await materiaPrimaApi.fetchMateriaPrima(id)
    materiaPrimaAtual.value = data
    loadingStore.isLoading = false
    return data
  }

  const createMateriaPrima = async (materiaPrima) => {
    try {
      loadingStore.isLoading = true
      const created = await materiaPrimaApi.createMateriaPrima(materiaPrima)
      materiasPrimas.value.push(created)

      newMateriaPrima.value = {
        id: null,
        nome_materia: '',
        descricao_materia: ''
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating materia prima', err)
      loadingStore.isLoading = false
    }
  }

  const updateMateriaPrima = async () => {
    try {
      loadingStore.isLoading = true

      await materiaPrimaApi.updateMateriaPrima(modalStore.editingItem)

      await fetchMateriasPrimas()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false

    } catch (err) {
      console.error('Error updating materia prima: ', err)
      loadingStore.isLoading = false
    }
  }

  const deleteMateriaPrima = async (id) => {
    try {
      loadingStore.isLoading = true

      await materiaPrimaApi.deleteMateriaPrima(id)
      materiasPrimas.value = materiasPrimas.value.filter(materia => materia.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting materia prima:', err)
      loadingStore.isLoading = false
    }
  }

  // Método helper para obter nome da matéria-prima por ID
  const getMateriaPrimaNome = (materiaPrimaId) => {
    const materiaPrima = materiasPrimas.value.find(m => m.id === parseInt(materiaPrimaId))
    return materiaPrima ? materiaPrima.nome_materia : 'Desconhecida'
  }

  return {
    materiasPrimas,
    materiaPrimaAtual,
    newMateriaPrima,
    fetchMateriasPrimas,
    fetchMateriaPrima,
    createMateriaPrima,
    updateMateriaPrima,
    deleteMateriaPrima,
    getMateriaPrimaNome
  }
})
