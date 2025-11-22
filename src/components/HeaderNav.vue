<script setup>
import { ref, reactive } from 'vue'

const isMenuOpen = ref(false)
const navItems = reactive([
  { name: 'Início', path: '/' },
  { name: 'Sobre o Museu', path: '/about' },
  { name: 'Visitação', path: '/visitavirtual' },

  
])
</script>

<template>
  <header class="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
    <div class="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center h-20">
      
      <router-link to="/" class="flex items-center">
        <img 
          src="../assets/images/INTEIROPRETO.png" 
          alt="Logo do Museu Sambaqui" 
          class="h-25 w-auto" 
        />
      </router-link>

      <nav class="hidden lg:flex space-x-8 text-sm font-medium">
        <router-link 
          v-for="item in navItems" 
          :key="item.name" 
          :to="item.path"
          class="text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out py-2 border-b-2 border-transparent hover:border-gray-900"
        >
          {{ item.name }}
        </router-link>
        <router-link 
          to="/login"
          class="ml-4 px-4 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition duration-150 ease-in-out"
        >
          Entrar
        </router-link>
      </nav>

      <button 
        @click="isMenuOpen = !isMenuOpen" 
        class="lg:hidden text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        aria-label="Toggle menu"
      >
        <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <nav v-if="isMenuOpen" class="lg:hidden bg-white border-t border-gray-100">
      <div class="px-4 pt-2 pb-3 space-y-1 sm:px-6">
        <router-link 
          v-for="item in navItems" 
          :key="item.name" 
          :to="item.path" 
          @click="isMenuOpen = false"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition duration-150 ease-in-out"
        >
          {{ item.name }}
        </router-link>
        <router-link 
          to="/login" 
          @click="isMenuOpen = false"
          class="mt-2 block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 transition duration-150 ease-in-out"
        >
          Entrar
        </router-link>
      </div>
    </nav>
  </header>
</template>