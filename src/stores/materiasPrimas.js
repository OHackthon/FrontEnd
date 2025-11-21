import { defineStore } from 'pinia'
import { ref } from 'vue'
import MateriasPrimasApi from '@/services/materiasPrimasApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const materiasPrimasApi = new MateriasPrimasApi()

export const useMateriasPrimasStore = defineStore('materiasPrimas', () => {

  const materiasPrimas = ref([])

  const materiaPrimaOptions = ref([
    { value: 'ANIMAL', label: 'Animal' },
    { value: 'VEGETAL', label: 'Vegetal' },
    { value: 'MINERAL', label: 'Mineral' },
    { value: 'OUTRO', label: 'Outro' },
  ])

  const newMateriaPrima = ref({
    id: null,
    nome: ''
  })

  const fetchMateriasPrimas = async () => {
    loadingStore.isLoading = true
    const data = await materiasPrimasApi.fetchMateriasPrimas()
    materiasPrimas.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const createMateriaPrima = async (materiaPrima) => {
    try {
      loadingStore.isLoading = true
      const created = await materiasPrimasApi.createMateriaPrima(materiaPrima)
      materiasPrimas.value.push(created)

      newMateriaPrima.value = {
        id: null,
        nome: ''
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

      await materiasPrimasApi.updateMateriaPrima(modalStore.editingItem)

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

      await materiasPrimasApi.deleteMateriaPrima(id)
      materiasPrimas.value = materiasPrimas.value.filter(materiaPrima => materiaPrima.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting materia prima:', err)
      loadingStore.isLoading = false
    }
  }

  return {
    materiasPrimas, newMateriaPrima, fetchMateriasPrimas, createMateriaPrima, updateMateriaPrima, deleteMateriaPrima, materiaPrimaOptions
  }
})