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
    colecionador: null,
    descricao: '', // Corrigindo para 'descricao'
    data_registro: null,
  })

  const fetchColecoes = async () => {
    loadingStore.isLoading = true
    try {
      const data = await colecoesApi.fetchColecoes()
      colecoes.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.warn('Erro ao buscar coleções da API, usando dados padrão:', error)
      // Fallback para dados padrão em caso de erro
      colecoes.value = [
        { id: 1, nome_colecao: 'Coleção Guilherme Tiburtius' },
        { id: 2, nome_colecao: 'Coleção Sambaqui de Joinville' },
        { id: 3, nome_colecao: 'Coleção Etnológica Indígena' },
        { id: 4, nome_colecao: 'Doações Diversas' },
      ]
    } finally {
      loadingStore.isLoading = false
    }
  }

  const checkDuplicateColecao = (nomeColecao) => {
    return colecoes.value.some(
      (colecao) => colecao.nome_colecao.toLowerCase().trim() === nomeColecao.toLowerCase().trim(),
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

      try {
        // Tentar criar na API primeiro

        // Incluir um colecionador padrão se não foi fornecido
        const colecaoData = {
          ...colecao,
          colecionador: colecao.colecionador || 1, // Usar ID 1 como padrão ou criar se necessário
        }
        const response = await colecoesApi.createColecao(colecaoData)
        console.log('Coleção criada via API:', response)

        // Recarregar as coleções da API para pegar o ID real
        await fetchColecoes()
        notificationStore.showSuccess(`Coleção "${colecao.nome_colecao}" criada com sucesso!`)
      } catch (apiError) {
        console.warn('API indisponível, criando coleção localmente:', apiError)

        // Fallback: criar localmente se a API falhar
        const newId = Math.max(...colecoes.value.map((c) => c.id), 0) + 1
        const simulatedColecao = {
          id: newId,
          nome_colecao: colecao.nome_colecao,
          descricao: colecao.descricao || null,
          colecionador: null,
          data_registro: new Date().toISOString().split('T')[0],
        }

        colecoes.value.push(simulatedColecao)
        notificationStore.showSuccess(
          `Coleção "${colecao.nome_colecao}" criada localmente (API indisponível)!`,
        )
      }

      newColecao.value = {
        id: null,
        nome_colecao: '',
        colecionador: null,
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

  const updateColecao = async () => {
    try {
      loadingStore.isLoading = true

      await colecoesApi.updateColecao(modalStore.editingItem)

      await fetchColecoes()
      modalStore.closeCreateModal()
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
    checkDuplicateColecao,
  }
})
