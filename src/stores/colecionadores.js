import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColecionadoresApi from '@/services/colecionadoresApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const colecionadoresApi = new ColecionadoresApi()

export const useColecionadoresStore = defineStore('colecionadores', () => {
  const colecionadores = ref([])
  const newColecionador = ref({
    id: null,
    nome: '',
    contato: '',
  })

  const fetchColecionadores = async () => {
    loadingStore.isLoading = true
    try {
      const data = await colecionadoresApi.fetchColecionadores()
      colecionadores.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.error('Erro ao buscar colecionadores:', error)
    } finally {
      loadingStore.isLoading = false
    }
  }

  const createColecionador = async (colecionador) => {
    try {
      loadingStore.isLoading = true
      const created = await colecionadoresApi.createColecionador(colecionador)
      colecionadores.value.push(created)

      newColecionador.value = {
        id: null,
        nome: '',
        contato: '',
      }

      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating colecionador', err)
      loadingStore.isLoading = false
    }
  }

  const updateColecionador = async (colecionador) => {
    try {
      loadingStore.isLoading = true

      await colecionadoresApi.updateColecionador(colecionador)

      await fetchColecionadores()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating colecionador: ', err)
      loadingStore.isLoading = false
    }
  }

  const deleteColecionador = async (id) => {
    try {
      loadingStore.isLoading = true

      await colecionadoresApi.deleteColecionador(id)
      colecionadores.value = colecionadores.value.filter((colecionador) => colecionador.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting colecionador:', err)
      loadingStore.isLoading = false
    }
  }

  return {
    colecionadores,
    newColecionador,
    fetchColecionadores,
    createColecionador,
    updateColecionador,
    deleteColecionador,
  }
})
