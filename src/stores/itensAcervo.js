import { defineStore } from 'pinia'
import { ref } from 'vue'
import ItensAcervoApi from '@/services/itensAcervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const itensAcervoApi = new ItensAcervoApi()

export const useItensAcervoStore = defineStore('itensAcervo', () => {
  const itensAcervo = ref([])

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
    acervo: null, // fk
    nome: '',
    imagens: [], // fk
    colecao: null, // fk
    materia_prima: null, // fk
    subtipo: null, // fk
    localizacao_atual: null, // fk
    categoria_acervo: null, // fk
    procedencia: '',
    datacao: '',
    estado_conservacao: '',
    diensoes: '',
    peso_g: null,
    descricao: '',
    inteireza: '',
    observacoes_curadoria: '',
    criado_por: null, // fk
    data_registro: null,
    ultima_atualizacao: null,
  })

  const fetchItens = async () => {
  loadingStore.isLoading = true
  const data = await itensAcervoApi.fetchItens()
  
  if (Array.isArray(data.results)) {
    itensAcervo.value = [...data.results]
  } else if (Array.isArray(data)) {
    itensAcervo.value = [...data]
  } else {
    itensAcervo.value = []
  }
  
  loadingStore.isLoading = false
}

  const createItemAcervo = async (itemAcervo) => {
    try {
      loadingStore.isLoading = true
      const created = await itensAcervoApi.createItemAcervo(itemAcervo)
      itensAcervo.value.push(created)

      newItemAcervo.value = {
        id: null,
        acervo: null, // fk
        nome: '',
        imagens: [], // fk
        colecao: null, // fk
        materia_prima: null, // fk
        subtipo: null, // fk
        localizacao_atual: null, // fk
        categoria_acervo: null, // fk
        procedencia: '',
        datacao: '',
        estado_conservacao: '',
        diensoes: '',
        peso_g: null,
        descricao: '',
        inteireza: '',
        observacoes_curadoria: '',
        criado_por: null, // fk
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

  return {
    itensAcervo,
    newItemAcervo,
    fetchItens,
    createItemAcervo,
    updateItemAcervo,
    deleteItemAcervo,
    estadoOptions,
    inteirezaOptions
  }
})
