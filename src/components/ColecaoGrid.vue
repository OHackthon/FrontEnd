<script setup>
import { onMounted } from 'vue'
import CategoryCard from './ColecaoCard.vue'
import { useRouter } from 'vue-router';

const router = useRouter();
import { useColecoesStore } from '@/stores/colecoes';

const colecoesStore = useColecoesStore();

onMounted( async () => {
  await colecoesStore.fetchColecoes();
});
</script>

<template>
  <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h2 class="text-3xl sm:text-4xl font-serif font-light text-gray-900 mb-10 text-center uppercase tracking-wider">
      Explore as Coleções
    </h2>
    
    <div class="grid 
      grid-cols-1 gap-8 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      auto-rows-fr"
    >
      <CategoryCard 
        v-for="colecao in colecoesStore.colecoes" 
        :key="colecao.id" 
        :colecao="colecao"
      />
    </div>
  </div>
</template>