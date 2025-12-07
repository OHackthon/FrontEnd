import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColecoesApi from '@/services/colecoesApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
import { useNotificationStore } from '@/stores/notification.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const notificationStore = useNotificationStore()
const colecoesApi = new ColecoesApi()

export const useColecoesStore = defineStore('colecoes', () => {
  const colecoes = ref([])
  const newColecao = ref({
    id: null,
    nome_colecao: '',
    nome_colecionador: '',
    descricao: '',
    data_registro: new Date().toISOString(),
  })

  const fetchColecoes = async () => {
    loadingStore.isLoading = true
    try {
      const data = await colecoesApi.fetchColecoes()
      colecoes.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.error('Erro ao buscar coleções da API:', error)
    } finally {
      loadingStore.isLoading = false
    }
  }

  const checkDuplicateColecao = (nomeColecao) => {
    return colecoes.value.some(
      (colecao) => colecao.nome_colecao.toLowerCase().trim() === nomeColecao.toLowerCase().trim(),
    )
  }

  function findColecoesByColecionador(nomeColecionador) {
    return (
      colecoes.value
        .filter((c) => c.nome_colecionador === nomeColecionador)
        .map((c) => c.nome_colecao)
        .join(', ') || 'Nenhuma coleção encontrada'
    )
  }

  const createColecao = async (colecao) => {
    try {
      // Check for duplicate collection name
      if (checkDuplicateColecao(colecao.nome_colecao)) {
        notificationStore.showWarning(`A coleção "${colecao.nome_colecao}" já existe!`)
        return false
      }

      loadingStore.isLoading = true

      // Incluir um colecionador padrão se não foi fornecido
      const colecaoData = {
        ...colecao,
      }
      const response = await colecoesApi.createColecao(colecaoData)
      console.log('Coleção criada via API:', response)

      // Recarregar as coleções da API para pegar o ID real
      await fetchColecoes()
      notificationStore.showSuccess(`Coleção "${colecao.nome_colecao}" criada com sucesso!`)

      newColecao.value = {
        id: null,
        nome_colecao: '',
        nome_colecionador: '',
        descricao: '',
        data_registro: null,
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
      return true
    } catch (err) {
      console.error('Error creating colecao', err)
      notificationStore.showError('Erro ao criar coleção. Tente novamente.')
      loadingStore.isLoading = false
      return false
    }
  }

  const updateColecao = async (colecao) => {
    try {
      loadingStore.isLoading = true

      await colecoesApi.updateColecao(colecao)

      await fetchColecoes()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating colecao: ', err)
      loadingStore.isLoading = false
    }
  }

  const deleteColecao = async (id) => {
    try {
      loadingStore.isLoading = true

      await colecoesApi.deleteColecao(id)
      colecoes.value = colecoes.value.filter((colecao) => colecao.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting colecao:', err)
      loadingStore.isLoading = false
    }
  }

  return {
    colecoes,
    newColecao,
    fetchColecoes,
    createColecao,
    updateColecao,
    deleteColecao,
    findColecoesByColecionador,
  }
})
