<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  colecao: {
    type: Object,
    required: true,
    default: () => ({ id: 0, nome: 'Título', image: 'https://picsum.photos/400/300?random=1', descricao: 'Breve descrição...' })
  }
})

// Simulação de rota dinâmica
const colecaoPath = computed(() => ({
  name: 'acervototal',
  query: { colecao: props.colecao.nome_colecao }
}))
</script>

<template>
  <router-link :to="colecaoPath" class="group block bg-white border border-gray-100 shadow-md hover:shadow-xl transition duration-300 ease-in-out overflow-hidden">
    <div class="p-6">
      <h3 class="text-xl font-serif font-semibold text-gray-900 group-hover:text-gray-700 transition duration-150 ease-in-out mb-2 leading-snug">
        {{ colecao.nome_colecao }}
      </h3>
      <p class="text-sm text-gray-600 font-light line-clamp-2">
        {{ colecao.descricao_origem || 'Sem descrição disponível.' }}
      </p>
      <div class="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-900 transition duration-150 ease-in-out">
        Ver Coleção &rarr;
      </div>
    </div>
  </router-link>
</template>