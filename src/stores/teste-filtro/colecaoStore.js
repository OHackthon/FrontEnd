import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColecaoApi from '@/services/colecaoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const colecaoApi = new ColecaoApi()

export const useColecaoStore = defineStore('colecao', () => {

  const colecoes = ref([])
  const colecoesComItens = ref([])
  const colecaoAtual = ref(null)
  const newColecao = ref({
    id: null,
    nome_colecao: '',
    descricao_colecao: '',
    colecionador: null
  })

  const fetchColecoes = async () => {
    loadingStore.isLoading = true
    const data = await colecaoApi.fetchColecoes()
    colecoes.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const fetchColecao = async (id) => {
    loadingStore.isLoading = true
    const data = await colecaoApi.fetchColecao(id)
    colecaoAtual.value = data
    loadingStore.isLoading = false
    return data
  }

  const fetchColecoesComItens = async () => {
    loadingStore.isLoading = true
    const data = await colecaoApi.fetchColecoesComItens()
    colecoesComItens.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
    return colecoesComItens.value
  }

  const createColecao = async (colecao) => {
    try {
      loadingStore.isLoading = true
      const created = await colecaoApi.createColecao(colecao)
      colecoes.value.push(created)

      newColecao.value = {
        id: null,
        nome_colecao: '',
        descricao_colecao: '',
        colecionador: null
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating colecao', err)
      loadingStore.isLoading = false
    }
  }

  const updateColecao = async () => {
    try {
      loadingStore.isLoading = true

      await colecaoApi.updateColecao(modalStore.editingItem)

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

      await colecaoApi.deleteColecao(id)
      colecoes.value = colecoes.value.filter(colecao => colecao.id !== id)
      colecoesComItens.value = colecoesComItens.value.filter(colecao => colecao.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting colecao:', err)
      loadingStore.isLoading = false
    }
  }

  // Método helper para obter nome da coleção por ID
  const getColecaoNome = (colecaoId) => {
    const colecao = colecoes.value.find(c => c.id === parseInt(colecaoId))
    return colecao ? colecao.nome_colecao : 'Desconhecida'
  }

  return {
    colecoes, 
    colecoesComItens,
    colecaoAtual,
    newColecao, 
    fetchColecoes,
    fetchColecao,
    fetchColecoesComItens,
    createColecao, 
    updateColecao, 
    deleteColecao,
    getColecaoNome
  }
})
