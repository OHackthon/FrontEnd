<script setup>
import { ref, watch, onUnmounted } from 'vue';
import NavBar from '../components/HeaderNav.vue';
import HeroBanner from '@/components/HeroBanner.vue';
import HeaderNav from '../components/HeaderNav.vue';

const iframeLoaded = ref(false);
const isMaximized = ref(false);

const onLoad = () => {
  iframeLoaded.value = true;
};

const toggleFullscreen = () => {
  isMaximized.value = !isMaximized.value;
};

watch(isMaximized, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">

    <HeaderNav />

    <main class="flex-1 flex flex-col items-center w-full transition-all duration-500"
      :class="isMaximized ? 'justify-start p-0' : 'justify-start px-4 pt-2 pb-8'">

      <div class="text-center mb-2 transition-all duration-300" v-if="!isMaximized">
        <h1 class="font-serif text-xl md:text-2xl font-bold mb-0 text-gray-900">Tour Virtual 360º</h1>
        <p class="text-xs text-gray-500">Navegue pelo acervo histórico.</p>
      </div>

      <div class="relative transition-all duration-500 ease-in-out bg-black" :class="[
        isMaximized
          ? 'fixed top-16 left-0 w-full h-[calc(100vh-64px)] z-40 rounded-none border-0'
          : 'w-full max-w-5xl aspect-video rounded-t-xl shadow-2xl border-[12px] border-b-[24px] border-gray-800'
      ]">

        <div class="absolute top-4 right-4 z-50">
          <button @click="toggleFullscreen"
            class="bg-black/50 hover:bg-black text-white backdrop-blur-sm border border-white/20 rounded-full p-2 transition-all shadow-lg group flex items-center gap-2"
            :title="isMaximized ? 'Sair da Tela Cheia' : 'Tela Cheia'">
            <svg v-if="isMaximized" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>

            <span
              class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-[10px] font-bold uppercase tracking-widest">
              {{ isMaximized ? 'Fechar' : 'Tela Cheia' }}
            </span>
          </button>
        </div>

        <div v-if="!iframeLoaded"
          class="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-gray-900">
          <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs uppercase tracking-widest animate-pulse">Carregando...</p>
        </div>

        <iframe src="https://sambaquijoinville.sitevr.com.br/" class="w-full h-full border-none bg-black"
          allowfullscreen loading="lazy" referrerpolicy="no-referrer" @load="onLoad"></iframe>

      </div>

      <div v-if="!isMaximized" class="flex flex-col items-center w-full animate-fade-in">

        <div class="w-32 h-16 bg-linear-to-b from-gray-700 to-gray-800 shadow-inner mx-auto relative z-10 -mt-1"></div>

        <div class="w-64 h-2 bg-gray-800 rounded-t-lg shadow-2xl z-0 border-t border-gray-600"></div>
        <div class="w-72 h-1 bg-gray-900 rounded-full opacity-20 blur-md mt-1"></div>
      </div>

    </main>
    <FooterSection />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>