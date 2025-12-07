import { defineStore } from 'pinia'
import { ref } from 'vue'
import SubtiposApi from '@/services/subtiposApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
const loadingStore = useLoading()
const modalStore = useModalStore()
const subtiposApi = new SubtiposApi()
export const useSubtiposStore = defineStore('subtipos', () => {
  const subtipos = ref([])
  const newSubtipo = ref({
    id: null,
    termo: '',
    materia_prima: null,
  })
  const fetchSubtipos = async () => {
    loadingStore.isLoading = true
    try {
      const data = await subtiposApi.fetchSubtipos()
      subtipos.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.error('Erro ao buscar subtipos:', error)
      subtipos.value = []
    } finally {
      loadingStore.isLoading = false
    }
  }
  const fetchSubtiposByMateriaPrima = async (materiaPrimaId) => {
    loadingStore.isLoading = true
    try {
      const data = await subtiposApi.fetchSubtiposByMateriaPrima(materiaPrimaId)
      const subtiposFiltrados = Array.isArray(data.results) ? data.results : data
      subtipos.value = subtiposFiltrados
      return subtiposFiltrados
    } catch (error) {
      console.error('Erro ao buscar subtipos por matéria-prima:', error)
      subtipos.value = []
      return []
    } finally {
      loadingStore.isLoading = false
    }
  }
  const createSubtipo = async (subtipo) => {
    try {
      loadingStore.isLoading = true
      const created = await subtiposApi.createSubtipo(subtipo)
      subtipos.value.push(created)
      newSubtipo.value = {
        id: null,
        termo: '',
        materia_prima: null,
      }
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating subtipo', err)
      loadingStore.isLoading = false
    }
  }
  const updateSubtipo = async (subtipo) => {
    try {
      loadingStore.isLoading = true
      await subtiposApi.updateSubtipo(subtipo)
      const index = subtipos.value.findIndex((s) => s.id === subtipo.id)
      if (index !== -1) {
        subtipos.value[index] = subtipo
      }
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating subtipo:', err)
      loadingStore.isLoading = false
    }
  }
  const deleteSubtipo = async (id) => {
    try {
      loadingStore.isLoading = true
      await subtiposApi.deleteSubtipo(id)
      subtipos.value = subtipos.value.filter((subtipo) => subtipo.id !== id)
      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting subtipo:', err)
      loadingStore.isLoading = false
    }
  }
  return {
    subtipos,
    newSubtipo,
    fetchSubtipos,
    fetchSubtiposByMateriaPrima,
    createSubtipo,
    updateSubtipo,
    deleteSubtipo,
  }
})