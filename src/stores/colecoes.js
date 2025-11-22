import { defineStore } from 'pinia'
import { ref } from 'vue'
import ColecoesApi from '@/services/colecoesApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const colecoesApi = new ColecoesApi()

export const useColecoesStore = defineStore('colecoes', () => {
  const colecoes = ref([])
  const newColecao = ref({
    id: null,
    nome_colecao: '',
    colecionador: null,
    descricao: '',
    data_registro: new Date().toISOString(),
    colecionador_data: null,
  })

  const fetchColecoes = async () => {
    loadingStore.isLoading = true
    const data = await colecoesApi.fetchColecoes()
    colecoes.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  function findColecoesByColecionador(nomeColecionador) {
    return colecoes.value
      .filter(c => c.colecionador.nome === nomeColecionador)
      .map(c => c.nome_colecao).join(', ') || 'Nenhuma coleção encontrada';
  }


  const createColecao = async (colecao) => {
    try {
      loadingStore.isLoading = true
      const created = await colecoesApi.createColecao(colecao)
      colecoes.value.push(created)

      newColecao.value = {
        id: null,
        nome_colecao: '',
        colecionador: null,
        descricao: '',
        data_registro: null,
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating colecao', err)
      loadingStore.isLoading = false
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
    findColecoesByColecionador
  }
})
