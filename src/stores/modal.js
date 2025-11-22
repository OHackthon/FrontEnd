import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const itemToDelete = ref()
  const confirmDeleteModal = ref(false)
  const createModal = ref(false)
  const editingItem = ref(null)
  const isEditing = ref(false)

  const openConfirmDeleteModal = (id) => {
    itemToDelete.value = id
    confirmDeleteModal.value = true
  }

  const closeConfirmDeleteModal = () => {
    confirmDeleteModal.value = false
    itemToDelete.value = null
  }

  const openCreateModal = (item = null) => {
    if (item) {
      editingItem.value = { ...item }
      isEditing.value = true
    } else {
      editingItem.value = {
        id: null,
        nome: '',
        descricao: '',
      }
      isEditing.value = false
    }
    createModal.value = true
  }

  const closeCreateModal = () => {
    createModal.value = false
    editingItem.value = null
    isEditing.value = false
  }

  return {
    itemToDelete,
    confirmDeleteModal,
    createModal,
    editingItem,
    isEditing,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    openCreateModal,
    closeCreateModal,
  }
})
