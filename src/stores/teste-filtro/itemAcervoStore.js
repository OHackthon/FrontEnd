import { defineStore } from 'pinia'
import { ref } from 'vue'
import ItemAcervoApi from '@/services/itemAcervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
const loadingStore = useLoading()
const modalStore = useModalStore()
const itemAcervoApi = new ItemAcervoApi()
export const useItemAcervoStore = defineStore('itemAcervo', () => {
  const itensAcervo = ref([])
  const itemAtual = ref(null)
  const newItemAcervo = ref({
    id: null,
    titulo: '',
    descricao: '',
    estado_conservacao: 'BOM',
    procedencia: '',
    datacao: '',
    observacoes_curadoria: '',
    colecao: null,
    materia_prima: null,
    localizacao: null
  })
  const filtros = ref({
    busca_geral: '',
    estado_conservacao: '',
    colecao: '',
    procedencia: '',
    datacao: '',
    materia_prima: '',
    localizacao: ''
  })
  const paginacao = ref({
    paginaAtual: 1,
    totalPaginas: 1,
    totalItens: 0,
    itensPorPagina: 12
  })
  const fetchItensAcervo = async () => {
    loadingStore.isLoading = true
    const data = await itemAcervoApi.fetchItensAcervo()
    itensAcervo.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }
  const fetchItemAcervo = async (id) => {
    loadingStore.isLoading = true
    const data = await itemAcervoApi.fetchItemAcervo(id)
    itemAtual.value = data
    loadingStore.isLoading = false
    return data
  }
  const buscarItensComFiltros = async () => {
    try {
      loadingStore.isLoading = true
      const parametrosPaginacao = {
        page: paginacao.value.paginaAtual,
        page_size: paginacao.value.itensPorPagina
      }
      const data = await itemAcervoApi.buscarItensComFiltros(filtros.value, parametrosPaginacao)
      if (data.results) {
        itensAcervo.value = [...data.results]
        paginacao.value.totalItens = data.count
        paginacao.value.totalPaginas = Math.ceil(data.count / paginacao.value.itensPorPagina)
      } else {
        itensAcervo.value = Array.isArray(data) ? [...data] : [data]
        paginacao.value.totalItens = itensAcervo.value.length
        paginacao.value.totalPaginas = 1
      }
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Erro ao buscar itens com filtros:', err)
      loadingStore.isLoading = false
    }
  }
  const createItemAcervo = async (item) => {
    try {
      loadingStore.isLoading = true
      const created = await itemAcervoApi.createItemAcervo(item)
      itensAcervo.value.push(created)
      newItemAcervo.value = {
        id: null,
        titulo: '',
        descricao: '',
        estado_conservacao: 'BOM',
        procedencia: '',
        datacao: '',
        observacoes_curadoria: '',
        colecao: null,
        materia_prima: null,
        localizacao: null
      }
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating item acervo', err)
      loadingStore.isLoading = false
    }
  }
  const updateItemAcervo = async () => {
    try {
      loadingStore.isLoading = true
      await itemAcervoApi.updateItemAcervo(modalStore.editingItem)
      await fetchItensAcervo()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating item acervo: ', err)
      loadingStore.isLoading = false
    }
  }
  const deleteItemAcervo = async (id) => {
    try {
      loadingStore.isLoading = true
      await itemAcervoApi.deleteItemAcervo(id)
      itensAcervo.value = itensAcervo.value.filter(item => item.id !== id)
      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting item acervo:', err)
      loadingStore.isLoading = false
    }
  }
  const limparFiltros = () => {
    filtros.value = {
      busca_geral: '',
      estado_conservacao: '',
      colecao: '',
      procedencia: '',
      datacao: '',
      materia_prima: '',
      localizacao: ''
    }
    paginacao.value.paginaAtual = 1
    buscarItensComFiltros()
  }
  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= paginacao.value.totalPaginas) {
      paginacao.value.paginaAtual = novaPagina
      buscarItensComFiltros()
    }
  }
  const aplicarFiltro = (nomeFiltro, valor) => {
    filtros.value[nomeFiltro] = valor
    paginacao.value.paginaAtual = 1 
    buscarItensComFiltros()
  }
  const temFiltrosAtivos = () => {
    return Object.values(filtros.value).some(valor => valor !== '')
  }
  return {
    itensAcervo, 
    itemAtual, 
    newItemAcervo, 
    filtros, 
    paginacao,
    fetchItensAcervo, 
    fetchItemAcervo,
    createItemAcervo, 
    updateItemAcervo, 
    deleteItemAcervo,
    buscarItensComFiltros,
    limparFiltros,
    mudarPagina,
    aplicarFiltro,
    temFiltrosAtivos
  }
})