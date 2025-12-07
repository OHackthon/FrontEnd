import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  let nextId = 1
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = nextId++
    const notification = {
      id,
      message,
      type, 
      duration,
      visible: true,
    }
    notifications.value.push(notification)
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    return id
  }
  const removeNotification = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  const clearAll = () => {
    notifications.value = []
  }
  const showSuccess = (message, duration = 4000) => {
    return addNotification(message, 'success', duration)
  }
  const showError = (message, duration = 6000) => {
    return addNotification(message, 'error', duration)
  }
  const showWarning = (message, duration = 5000) => {
    return addNotification(message, 'warning', duration)
  }
  const showInfo = (message, duration = 4000) => {
    return addNotification(message, 'info', duration)
  }
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
})