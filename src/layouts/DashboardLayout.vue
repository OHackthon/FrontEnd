<script setup>
import { useRouter } from 'vue-router'
import SideBar from '../components/SideBar.vue'
import { useAuth } from '@/stores/auth.js'

const authStore = useAuth()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans">
    <SideBar @logout="handleLogout" />
    <div class="w-full h-full flex-1 py-8 px-6 flex flex-col min-w-0 md:ml-64 relative">
      <router-view />
    </div>
  </div>
</template>
