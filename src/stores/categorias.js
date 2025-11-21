import { defineStore } from 'pinia'
import { ref } from 'vue'
import CategoriaAcervoApi from '@/services/categoriaAcervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'

const loadingStore = useLoading()
const modalStore = useModalStore()
const categoriaAcervoApi = new CategoriaAcervoApi()

export const useCategoriasStore = defineStore('categorias', () => {
  const categorias = ref([])
  const newCategoria = ref({
    id: null,
    nome: '',
    descricao: '',
  })

  const fetchCategorias = async () => {
    loadingStore.isLoading = true
    const data = await categoriaAcervoApi.fetchCategorias()
    categorias.value = Array.isArray(data.results) ? [...data.results] : [...data]
    loadingStore.isLoading = false
  }

  const createCategoria = async (categoria) => {
    try {
      loadingStore.isLoading = true
      const created = await categoriaAcervoApi.createCategoria(categoria)
      categorias.value.push(created)

      newCategoria.value = {
        id: null,
        nome: '',
        descricao: '',
      }

      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error creating categoria', err)
      loadingStore.isLoading = false
    }
  }

  const updateCategoria = async () => {
    try {
      loadingStore.isLoading = true

      await categoriaAcervoApi.updateCategoria(modalStore.editingItem)

      await fetchCategorias()
      modalStore.closeCreateModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error updating categoria: ', err)
      loadingStore.isLoading = false
    }
  }

  const deleteCategoria = async (id) => {
    try {
      loadingStore.isLoading = true

      await categoriaAcervoApi.deleteCategoria(id)
      categorias.value = categorias.value.filter((categoria) => categoria.id !== id)

      modalStore.closeConfirmDeleteModal()
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting categoria:', err)
      loadingStore.isLoading = false
    }
  }

  return {
    categorias,
    newCategoria,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  }
})
