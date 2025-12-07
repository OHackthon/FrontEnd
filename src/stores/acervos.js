import { defineStore } from 'pinia'
import { ref } from 'vue'
import AcervoApi from '@/services/acervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
const loadingStore = useLoading()
const modalStore = useModalStore()
const acervoApi = new AcervoApi()
export const useAcervoStore = defineStore('acervo', () => {
  const acervos = ref([])
  const newAcervo = ref({
    id: null,
    numero_acervo: null
  })
  const fetchAcervos = async () => {
    loadingStore.isLoading = true
    const data = await acervoApi.fetchAcervos()
    acervos.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }
  const createAcervo = async (acervo) => {
    try {
      loadingStore.isLoading = true
      const created = await acervoApi.createAcervo(acervo)
      acervos.value.push(created)
      newAcervo.value = {
        id: null,
        numero_acervo: '',
      }
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating acervo', err)
      loadingStore.isLoading = false
    }
  }
  const updateAcervo = async () => {
    try {
      loadingStore.isLoading = true
      await acervoApi.updateAcervo(modalStore.editingItem)
      await fetchAcervos()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating acervo: ', err)
      loadingStore.isLoading = false
    }
  }
  const deleteAcervo = async (id) => {
    try {
      loadingStore.isLoading = true
      await acervoApi.deleteAcervo(id)
      acervos.value = acervos.value.filter(acervo => acervo.id !== id)
      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting acervo:', err)
      loadingStore.isLoading = false
    }
  }
  return {
    acervos, newAcervo, fetchAcervos, createAcervo, updateAcervo, deleteAcervo
  }
})