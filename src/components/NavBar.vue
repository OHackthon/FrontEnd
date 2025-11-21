<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const termoBusca = ref("");

// Sincroniza o input com a URL ao carregar
onMounted(() => {
  if (route.query.q) {
    termoBusca.value = route.query.q;
  }
});

let timeout = null;

const aoDigitar = () => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Se já estiver na tela de acervo, atualiza a busca sem recarregar
    if (route.name === 'acervototal') {
      router.replace({ query: { ...route.query, q: termoBusca.value || undefined } });
    }
  }, 300);
};

const forcarBusca = () => {
  // Força a ida para a tela de acervo com o termo
  router.push({ name: 'acervototal', query: { ...route.query, q: termoBusca.value } });
};

const irParaHome = () => {
  termoBusca.value = "";
  router.push('/');
};

const voltar = () => {
  router.back(); 
};
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
    <div class="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
      
      <!-- ESQUERDA: Voltar + Logo -->
      <div class="flex items-center gap-4">
        
        <button 
          v-if="route.path !== '/'" 
          @click="voltar" 
          class="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div 
          @click="irParaHome" 
          class="flex items-center gap-3 cursor-pointer select-none"
        >
          <div class="w-8 h-8 bg-black text-white flex items-center justify-center font-serif font-bold text-xl rounded-sm">
            M
          </div>
          <span class="font-serif font-bold text-lg tracking-tight hidden sm:block">
            Museu Sambaqui
          </span>
        </div>
      </div>

      <!-- DIREITA: Busca -->
      <div class="relative flex-1 max-w-md">
        <input 
          v-model="termoBusca" 
          @input="aoDigitar"
          @keydown.enter="forcarBusca"
          type="text" 
          placeholder="Pesquisar no acervo..." 
          class="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" 
        />
        <span class="absolute left-3.5 top-2.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

    </div>
  </header>
</template>