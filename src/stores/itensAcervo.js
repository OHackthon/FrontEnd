import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ItensAcervoApi from '@/services/itensAcervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
const loadingStore = useLoading()
const modalStore = useModalStore()
const itensAcervoApi = new ItensAcervoApi()
export const useItensAcervoStore = defineStore('itensAcervo', () => {
  const itensAcervo = ref([])
  const filtrosAtivos = ref({
    colecao: [], 
    materia: [], 
    subtipo: [], 
    localizacao: [], 
    estado: [], 
  })
  const itensAcervoFiltrados = computed(() => {
    return itensAcervo.value.filter((item) => {
      return Object.keys(filtrosAtivos.value).every((chave) => {
        const selecionados = filtrosAtivos.value[chave]
        if (!selecionados || selecionados.length === 0) return true
        let valorItem = ''
        switch (chave) {
          case 'colecao':
            valorItem = item.colecao?.nome_colecao || item.colecao?.nome || item.colecao || ''
            break
          case 'materia':
            valorItem =
              item.materia_prima?.materia ||
              item.materia_prima?.nome ||
              item.materia_prima ||
              item.materia ||
              ''
            break
          case 'subtipo':
            valorItem = item.subtipo?.termo || item.subtipo?.nome || item.subtipo || ''
            break
          case 'localizacao':
            valorItem =
              item.localizacao_atual?.nome_local ||
              item.localizacao_atual?.nome ||
              item.localizacao_atual ||
              item.localizacao ||
              ''
            break
          case 'estado':
            valorItem = item.estado_conservacao || item.estado || ''
            break
        }
        return selecionados.includes(valorItem)
      })
    })
  })
  const atualizarFiltros = (novosFiltros) => {
    filtrosAtivos.value = { ...novosFiltros }
  }
  const limparFiltros = () => {
    filtrosAtivos.value = {
      colecao: [],
      materia: [],
      subtipo: [],
      localizacao: [],
      estado: [],
    }
  }
  const estadoOptions = ref([
    { value: 'BOM', label: 'Bom' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'FRAGMENTADO', label: 'Fragmentado' },
  ])
  const inteirezaOptions = ref([
    { value: 'INTEIRO', label: 'Inteiro' },
    { value: 'PARCIAL', label: 'Parcial' },
    { value: 'FRAGMENTADO', label: 'Fragmentado' },
  ])
  const newItemAcervo = ref({
    id: null,
    acervo: null, 
    nome: '',
    imagens: [], 
    colecao: null, 
    materia_prima: null, 
    subtipo: null, 
    localizacao_atual: null, 
    categoria_acervo: null, 
    procedencia: '',
    datacao: '',
    estado_conservacao: '',
    diensoes: '',
    peso_g: null,
    descricao: '',
    inteireza: '',
    observacoes_curadoria: '',
    criado_por: null, 
    data_registro: null,
    ultima_atualizacao: null,
  })
  const fetchItens = async () => {
    try {
      const data = await itensAcervoApi.fetchItens()
      if (Array.isArray(data.results)) {
        itensAcervo.value = [...data.results]
      } else if (Array.isArray(data)) {
        itensAcervo.value = [...data]
      } else {
        itensAcervo.value = []
      }
    } catch (error) {
      console.error('Erro ao buscar itens do acervo:', error)
      itensAcervo.value = []
    }
  }
  const createItemAcervo = async (itemAcervo) => {
    try {
      loadingStore.isLoading = true
      const created = await itensAcervoApi.createItemAcervo(itemAcervo)
      itensAcervo.value.push(created)
      newItemAcervo.value = {
        id: null,
        acervo: null, 
        nome: '',
        imagens: [], 
        colecao: null, 
        materia_prima: null, 
        subtipo: null, 
        localizacao_atual: null, 
        categoria_acervo: null, 
        procedencia: '',
        datacao: '',
        estado_conservacao: '',
        diensoes: '',
        peso_g: null,
        descricao: '',
        inteireza: '',
        observacoes_curadoria: '',
        criado_por: null, 
        data_registro: null,
        ultima_atualizacao: null,
      }
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating item acervo', err)
      loadingStore.isLoading = false
    }
  }
  const getItemPorId = (id) => {
    return itensAcervo.value.find((item) => item.id === id)
  }
  const updateItemAcervo = async () => {
    try {
      loadingStore.isLoading = true
      await itensAcervoApi.updateItemAcervo(modalStore.editingItem)
      await fetchItens()
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
      await itensAcervoApi.deleteItemAcervo(id)
      itensAcervo.value = itensAcervo.value.filter((itemAcervo) => itemAcervo.id !== id)
      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting item acervo:', err)
      loadingStore.isLoading = false
    }
  }
  const uploadExcel = async (file) => {
    try {
      loadingStore.isLoading = true
      const response = await itensAcervoApi.uploadExcel(file)
      await fetchItens() 
      loadingStore.isLoading = false
      return response
    } catch (err) {
      console.error('Error uploading excel:', err)
      loadingStore.isLoading = false
      throw err
    }
  }
  return {
    itensAcervo,
    itensAcervoFiltrados,
    filtrosAtivos,
    atualizarFiltros,
    limparFiltros,
    newItemAcervo,
    fetchItens,
    createItemAcervo,
    updateItemAcervo,
    deleteItemAcervo,
    uploadExcel,
    estadoOptions,
    inteirezaOptions,
    getItemPorId,
  }
})