<script setup>
import { reactive } from 'vue'
import CategoryCard from './CategoryCard.vue'

// Conteúdo Obrigatório: Dados Mockados
const categories = reactive([
  { 
    id: 1, 
    title: 'Cerâmica Pré-histórica', 
    image: 'https://picsum.photos/400/300?random=1', 
    description: 'Vasilhas, urnas e objetos cerimoniais que revelam a sofisticação da arte cerâmica dos povos originários.' 
  },
  { 
    id: 2, 
    title: 'Artefatos Líticos', 
    image: 'https://picsum.photos/400/300?random=2', 
    description: 'Instrumentos de caça, pesca e trabalho, como machados polidos e pontas de projéteis em pedra lascada.' 
  },
  { 
    id: 3, 
    title: 'Ossuários e Restos Humanos', 
    image: 'https://picsum.photos/400/300?random=3', 
    description: 'Estudos paleoantropológicos e a organização social e ritualística dos enterramentos nos sambaquis.' 
  },
  { 
    id: 4, 
    title: 'Cultura Material de Conchas', 
    image: 'https://picsum.photos/400/300?random=4', 
    description: 'Adornos, ferramentas e evidências da exploração e uso das conchas pelos habitantes dos sambaquis.' 
  },
  { 
    id: 5, 
    title: 'Pinturas Rupestres', 
    image: 'https://picsum.photos/400/300?random=5', 
    description: 'Registros gráficos e simbólicos em cavernas e abrigos rochosos, contando histórias e mitos.' 
  },
  { 
    id: 6, 
    title: 'Coleção de Fauna e Flora', 
    image: 'https://picsum.photos/400/300?random=6', 
    description: 'Fósseis e vestígios que ajudam a reconstruir o ecossistema e a dieta dos povos Sambaquis.' 
  },
    { 
    id: 7, 
    title: 'Coleção de Fauna e Flora', 
    image: 'https://picsum.photos/400/300?random=6', 
    description: 'Fósseis e vestígios que ajudam a reconstruir o ecossistema e a dieta dos povos Sambaquis.' 
  },
    { 
    id: 8, 
    title: 'Coleção de Fauna e Flora', 
    image: 'https://picsum.photos/400/300?random=6', 
    description: 'Fósseis e vestígios que ajudam a reconstruir o ecossistema e a dieta dos povos Sambaquis.' 
  },
])
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
        v-for="category in categories" 
        :key="category.id" 
        :category="category" 
      />
    </div>
  </div>
</template>