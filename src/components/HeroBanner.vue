<script setup>
import { ref } from 'vue'

const title = ref('Descubra a Cultura dos Sambaquis')
const subtitle = ref('Milênios de história e arte na costa brasileira.')
const ctaText = ref('Explorar Coleções')
</script>

<template>
  <div class="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
    <div 
      class="absolute inset-0 bg-cover bg-center bg-fixed" 
      style="background-image: url('https://picsum.photos/1920/1080?random=1');"
      aria-label="Imagem de fundo imponente do Museu do Sambaqui"
    >
      <div class="absolute inset-0 bg-black opacity-30"></div>
    </div>

    <div class="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
      <h1 class="text-4xl sm:text-5xl lg:text-7xl font-serif font-light text-white tracking-tight leading-tight mb-4 max-w-4xl">
        {{ title }}
      </h1>
      <p class="text-lg sm:text-xl lg:text-2xl font-light text-gray-100 mb-8 max-w-3xl">
        {{ subtitle }}
      </p>
      <router-link 
        to="/collections"
        class="px-8 py-3 text-lg font-semibold border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 transition duration-300 ease-in-out uppercase tracking-wider"
      >
        {{ ctaText }}
      </router-link>
    </div>
  </div>
</template>