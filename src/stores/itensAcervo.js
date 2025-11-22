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

  // ========== SISTEMA DE FILTROS NO FRONTEND ==========
  // ✅ AQUI ESTÁ O SISTEMA DE FILTROS FUNCIONANDO NO FRONTEND
  // Estado dos filtros ativos (controlado pelos checkboxes do sidebar)
  const filtrosAtivos = ref({
    colecao: [], // Array de coleções selecionadas
    materia: [], // Array de matérias-primas selecionadas
    subtipo: [], // Array de subtipos selecionados
    localizacao: [], // Array de localizações selecionadas
    estado: [], // Array de estados de conservação selecionados
  })

  // ✅ FUNÇÃO PRINCIPAL DE FILTROS - EXECUTA EM TEMPO REAL
  // Esta função computed é executada automaticamente sempre que:
  // 1. Os dados do acervo mudam (itensAcervo.value)
  // 2. Os filtros ativos mudam (filtrosAtivos.value)
  const itensAcervoFiltrados = computed(() => {
    return itensAcervo.value.filter((item) => {
      // Para cada categoria de filtro, verifica se o item atende aos critérios
      return Object.keys(filtrosAtivos.value).every((chave) => {
        const selecionados = filtrosAtivos.value[chave]

        // Se nenhum filtro está ativo para esta categoria, aceita todos os itens
        if (!selecionados || selecionados.length === 0) return true

        // ✅ MAPEAMENTO DOS CAMPOS DO ITEM PARA OS FILTROS
        // Mapear campos do item para as categorias de filtro
        let valorItem = ''
        switch (chave) {
          case 'colecao':
            // Mapeia para o campo correto baseado na estrutura do AcervoCard.vue
            valorItem = item.colecao?.nome_colecao || item.colecao?.nome || item.colecao || ''
            break
          case 'materia':
            // Mapeia para matéria-prima baseado na estrutura real
            valorItem = item.materia_prima?.nome || item.materia_prima || item.materia || ''
            break
          case 'subtipo':
            // Mapeia para subtipo baseado na estrutura real
            valorItem = item.subtipo?.termo || item.subtipo?.nome || item.subtipo || ''
            break
          case 'localizacao':
            valorItem =
              item.localizacao_atual?.nome_local ||
              item.localizacao_atual?.nome ||
              item.localizacao_atual ||
              item.localizacao?.nome_local ||
              item.localizacao?.nome ||
              item.localizacao ||
              ''
            break
          case 'estado':
            valorItem = item.estado_conservacao || item.estado || ''
            break
        }

        // ✅ VERIFICA SE O VALOR DO ITEM ESTÁ NOS FILTROS SELECIONADOS
        // Retorna true se o valor do item está na lista de selecionados
        return selecionados.includes(valorItem)
      })
    })
  })

  // ✅ FUNÇÃO PARA ATUALIZAR FILTROS (chamada pelo SideFilter.vue)
  const atualizarFiltros = (novosFiltros) => {
    filtrosAtivos.value = { ...novosFiltros }
    // O computed itensAcervoFiltrados será automaticamente recalculado
  }

  // ✅ FUNÇÃO PARA LIMPAR FILTROS
  const limparFiltros = () => {
    filtrosAtivos.value = {
      colecao: [],
      materia: [],
      subtipo: [],
      localizacao: [],
      estado: [],
    }
    // O computed itensAcervoFiltrados será automaticamente recalculado
  }
  // ========== FIM DO SISTEMA DE FILTROS ==========

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
    itensAcervoFiltrados,
    filtrosAtivos,
    atualizarFiltros,
    limparFiltros,
    newItemAcervo,
    fetchItens,
    createItemAcervo,
    updateItemAcervo,
    deleteItemAcervo,
    estadoOptions,
    inteirezaOptions,
  }
})
