import { defineStore } from 'pinia'
import { ref } from 'vue'
import LocalizacaoApi from '@/services/localizacaoApi.js'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const localizacaoApi = new LocalizacaoApi()
const modalStore = useModalStore()

export const useLocalizacoesStore = defineStore('localizacoes', () => {
  const localizacoes = ref([])
  const newLocalizacao = ref({
    id: null,
    nome_local: '',
  })

  const fetchLocalizacoes = async () => {
    loadingStore.isLoading = true
    const data = await localizacaoApi.fetchLocalizacoes()
    localizacoes.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const createLocalizacao = async (localizacao) => {
    try {
      loadingStore.isLoading = true
      const created = await localizacaoApi.createLocalizacao(localizacao)
      localizacoes.value.push(created)

      newLocalizacao.value = {
        id: null,
        nome_local: '',
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating localizacao', err)
      loadingStore.isLoading = false
    }
  }

  const updateLocalizacao = async () => {
    try {
      loadingStore.isLoading = true

      await localizacaoApi.updateLocalizacao(modalStore.editingItem)

      await fetchLocalizacoes()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating localizacao: ', err)
      loadingStore.isLoading = false
    }
  }

  const deleteLocalizacao = async (id) => {
    try {
      loadingStore.isLoading = true

      await localizacaoApi.deleteLocalizacao(id)
      localizacoes.value = localizacoes.value.filter((localizacao) => localizacao.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting localizacao:', err)
      loadingStore.isLoading = false
    }
  }

  return {
    localizacoes,
    newLocalizacao,
    fetchLocalizacoes,
    createLocalizacao,
    updateLocalizacao,
    deleteLocalizacao,
  }
})
