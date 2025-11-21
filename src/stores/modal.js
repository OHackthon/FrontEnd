import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const itemToDelete = ref()
  const confirmDeleteModal = ref(false)

  const openConfirmDeleteModal = (id) => {
    itemToDelete.value = id
    confirmDeleteModal.value = true
  }

  const closeConfirmDeleteModal = () => {
    confirmDeleteModal.value = false
  }

  return {
    itemToDelete,
    confirmDeleteModal,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
  }
})