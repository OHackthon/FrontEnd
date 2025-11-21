<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true,
    default: () => ({ id: 0, title: 'Título', image: 'https://picsum.photos/400/300?random=1', description: 'Breve descrição...' })
  }
})

// Simulação de rota dinâmica
const categoryPath = computed(() => `/category/${props.category.id}`)
</script>

<template>
  <router-link :to="categoryPath" class="group block bg-white border border-gray-100 shadow-md hover:shadow-xl transition duration-300 ease-in-out overflow-hidden">
    <div class="h-48 overflow-hidden">
      <img 
        :src="category.image" 
        :alt="category.title" 
        class="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-in-out"
      />
    </div>
    
    <div class="p-6">
      <h3 class="text-xl font-serif font-light text-gray-900 group-hover:text-gray-700 transition duration-150 ease-in-out mb-2 leading-snug">
        {{ category.title }}
      </h3>
      <p class="text-sm text-gray-600 font-light line-clamp-2">
        {{ category.description }}
      </p>
      <div class="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition duration-150 ease-in-out">
        Ver Coleção &rarr;
      </div>
    </div>
  </router-link>
</template>