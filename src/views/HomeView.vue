<script setup>
import HeaderNav from '../components/HeaderNav.vue'
import HeroBanner from '../components/HeroBanner.vue'

import CategoryGrid from '../components/CategoryGrid.vue'
import FooterSection from '../components/FooterSection.vue'

// Importação das funções necessárias (embora nem todas sejam usadas aqui, seguindo a regra estrita de importação)
import { ref, reactive, computed, watch, onMounted } from 'vue'

</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    
    
    <main class="flex-grow">
      <HeroBanner />
      <SearchBar />

      <CategoryGrid />
      
      <section class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <h2 class="text-2xl sm:text-3xl font-serif font-light text-gray-800 text-center mb-4">
          O que são os Sambaquis?
        </h2>
        <p class="max-w-3xl mx-auto text-center text-gray-600 font-light text-lg leading-relaxed">
          Os sambaquis são montes artificiais formados por restos orgânicos e inorgânicos, principalmente conchas, criados por populações pré-coloniais que viveram no litoral brasileiro entre 8.000 e 1.000 anos atrás. Estes monumentos funerários e habitacionais guardam a chave para a compreensão de uma das mais antigas e complexas culturas do nosso continente.
        </p>
        <div class="flex justify-center mt-8">
          <router-link 
            to="/about"
            class="px-6 py-2 text-md font-medium border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition duration-300 ease-in-out"
          >
            Saiba Mais
          </router-link>
        </div>
      </section>

    </main>
    
    
  </div>
</template>