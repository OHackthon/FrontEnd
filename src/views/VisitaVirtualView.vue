<script setup>
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';

const iframeLoaded = ref(false);

const onLoad = () => {
  iframeLoaded.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-black flex flex-col">
    
    <NavBar />

    <main class="flex-1 relative w-full h-[calc(100vh-64px)] bg-gray-900">
      
      <div 
        v-if="!iframeLoaded" 
        class="absolute inset-0 flex flex-col items-center justify-center text-white z-0"
      >
        <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm uppercase tracking-widest animate-pulse">Carregando Tour Virtual...</p>
      </div>

      <iframe 
        src="https://sambaquijoinville.sitevr.com.br/"
        class="w-full h-full border-none absolute inset-0 z-10"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer"
        @load="onLoad"
      ></iframe>

    </main>
  </div>
</template>