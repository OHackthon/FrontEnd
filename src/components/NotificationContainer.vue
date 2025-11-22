<script setup>
import { useNotificationStore } from '@/stores/notification'
import { ref, onMounted } from 'vue'

const notificationStore = useNotificationStore()

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'error':
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'warning':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    case 'info':
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

const getNotificationClasses = (type) => {
  const baseClasses = 'relative flex w-full max-w-sm items-center gap-3 rounded-lg p-4 shadow-lg transition-all duration-300 transform'
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-50 border border-green-200 text-green-800`
    case 'error':
      return `${baseClasses} bg-red-50 border border-red-200 text-red-800`
    case 'warning':
      return `${baseClasses} bg-yellow-50 border border-yellow-200 text-yellow-800`
    case 'info':
    default:
      return `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`
  }
}

const getIconClasses = (type) => {
  switch (type) {
    case 'success':
      return 'h-5 w-5 text-green-500'
    case 'error':
      return 'h-5 w-5 text-red-500'
    case 'warning':
      return 'h-5 w-5 text-yellow-500'
    case 'info':
    default:
      return 'h-5 w-5 text-blue-500'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
    <transition-group
      name="notification"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        :class="getNotificationClasses(notification.type)"
        class="pointer-events-auto"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg 
            :class="getIconClasses(notification.type)"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              :d="getNotificationIcon(notification.type)" 
            />
          </svg>
        </div>

        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{{ notification.message }}</p>
        </div>

        <!-- Close Button -->
        <button
          @click="notificationStore.removeNotification(notification.id)"
          class="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
