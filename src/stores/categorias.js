import { defineStore } from 'pinia'
import { ref } from 'vue'
import CategoriaAcervoApi from '@/services/categoriaAcervoApi'
import { useLoading } from '@/stores/loading.js'
import { useModalStore } from '@/stores/modal.js'
import { useNotificationStore } from '@/stores/notification.js'

export const useCategoriasStore = defineStore('categorias', () => {
  const loadingStore = useLoading()
  const modalStore = useModalStore()
  const notificationStore = useNotificationStore()
  const categoriaAcervoApi = new CategoriaAcervoApi()
  const categorias = ref([])
  const newCategoria = ref({
    id: null,
    nome: '',
    descricao: '',
  })

  const fetchCategorias = async () => {
    loadingStore.isLoading = true
    try {
      const data = await categoriaAcervoApi.fetchCategorias()
      categorias.value = Array.isArray(data.results) ? [...data.results] : [...data]
    } catch (error) {
      console.warn('Erro ao buscar categorias da API, usando dados padrão:', error)
      // Fallback para dados padrão em caso de erro
      categorias.value = [
        { id: 1, nome: 'Arqueológico' },
        { id: 2, nome: 'Etnográfico' },
        { id: 3, nome: 'Histórico' },
        { id: 4, nome: 'Artístico' },
      ]
    } finally {
      loadingStore.isLoading = false
    }
  }

  const checkDuplicateCategoria = (nome) => {
    return categorias.value.some(
      (categoria) => categoria.nome.toLowerCase().trim() === nome.toLowerCase().trim(),
    )
  }

  const createCategoria = async (categoria) => {
    try {
      // Check for duplicate category name
      if (checkDuplicateCategoria(categoria.nome)) {
        notificationStore.showWarning(`A categoria "${categoria.nome}" já existe no acervo!`)
        return false
      }

      loadingStore.isLoading = true
      const created = await categoriaAcervoApi.createCategoria(categoria)
      categorias.value.push(created)

      newCategoria.value = {
        id: null,
        nome: '',
        descricao: '',
      }

      modalStore.closeCreateModal()
      notificationStore.showSuccess(`Categoria "${categoria.nome}" criada com sucesso!`)
      loadingStore.isLoading = false
      return true
    } catch (err) {
      console.error('Error creating categoria', err)
      notificationStore.showError('Erro ao criar categoria. Tente novamente.')
      loadingStore.isLoading = false
      return false
    }
  }

  const updateCategoria = async () => {
    try {
      // Check for duplicate category name (excluding current category)
      const isDuplicate = categorias.value.some(
        (categoria) =>
          categoria.id !== modalStore.editingItem.id &&
          categoria.nome.toLowerCase().trim() === modalStore.editingItem.nome.toLowerCase().trim(),
      )

      if (isDuplicate) {
        notificationStore.showWarning(
          `A categoria "${modalStore.editingItem.nome}" já existe no acervo!`,
        )
        return false
      }

      loadingStore.isLoading = true

      await categoriaAcervoApi.updateCategoria(modalStore.editingItem)

      await fetchCategorias()
      modalStore.closeCreateModal()
      notificationStore.showSuccess(
        `Categoria "${modalStore.editingItem.nome}" atualizada com sucesso!`,
      )
      loadingStore.isLoading = false
      return true
    } catch (err) {
      console.error('Error updating categoria: ', err)
      notificationStore.showError('Erro ao atualizar categoria. Tente novamente.')
      loadingStore.isLoading = false
      return false
    }
  }

  const deleteCategoria = async (id) => {
    try {
      loadingStore.isLoading = true

      await categoriaAcervoApi.deleteCategoria(id)

      const deletedCategoria = categorias.value.find((categoria) => categoria.id === id)
      categorias.value = categorias.value.filter((categoria) => categoria.id !== id)

      modalStore.closeConfirmDeleteModal()
      notificationStore.showSuccess(
        `Categoria "${deletedCategoria?.nome || ''}" excluída com sucesso!`,
      )
      loadingStore.isLoading = false
    } catch (err) {
      console.error('Error deleting categoria:', err)
      notificationStore.showError('Erro ao excluir categoria. Tente novamente.')
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
    checkDuplicateCategoria,
  }
})
