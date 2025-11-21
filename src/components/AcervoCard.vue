<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const router = useRouter();

// --- LÓGICA DE DADOS ---
const imagemUrl = computed(() => {
  return props.item.img || 
         props.item.imagem || 
         props.item.url || 
         'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
});

const titulo = computed(() => props.item.titulo || 'Sem Título');
const colecao = computed(() => props.item.colecao || 'Acervo Geral');
const materia = computed(() => props.item.materia || props.item.materia_prima || '');
const subtipo = computed(() => props.item.subtipo || '');
const numeroInv = computed(() => props.item.numero_acervo || props.item.id);
const procedencia = computed(() => props.item.procedencia || 'Origem desconhecida');
const datacao = computed(() => props.item.datacao || 'Data desconhecida');

// --- NAVEGAÇÃO ---
const irParaDetalhe = () => {
  if (props.item.id) {
    // CORREÇÃO: Mudamos 'detalhe-item' para 'item-detail' para bater com o router/index.js
    router.push({ name: 'item-detail', params: { id: props.item.id } });
  } else {
    console.warn('Item sem ID, impossível navegar para detalhes:', props.item);
  }
};

// --- LÓGICA VISUAL ---
const imageLoaded = ref(false);
const handleImageLoad = () => { imageLoaded.value = true; };
const handleImageError = (e) => {
  e.target.src = 'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
  imageLoaded.value = true; 
};
</script>

<template>
  <div 
    @click="irParaDetalhe"
    class="group flex flex-col gap-4 cursor-pointer select-none bg-white h-full relative"
  >
    <!-- ÁREA DA FOTO -->
    <div 
      class="overflow-hidden bg-gray-100 relative rounded-sm w-full border border-gray-100"
      style="aspect-ratio: 4/3;"
    >
      <img 
        :src="imagemUrl" 
        @load="handleImageLoad"
        @error="handleImageError"
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
        :class="imageLoaded ? 'opacity-100' : 'opacity-0'" 
        loading="lazy"
        :alt="titulo"
      />
      
      <div v-if="!imageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center">
         <svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    </div>

    <!-- INFORMAÇÕES -->
    <div class="px-1 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <span class="truncate">{{ colecao }}</span>
        <span v-if="materia" class="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span v-if="materia" class="truncate text-gray-500">{{ materia }}</span>
      </div>

      <h3 class="font-serif text-xl text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
        {{ titulo }}
      </h3>

      <div class="flex flex-col gap-1 pt-1">
        <p class="text-xs text-gray-600 font-medium">
          {{ datacao }} <span class="text-gray-300 mx-1">|</span> {{ procedencia }}
        </p>
        <p class="text-[10px] text-gray-400 font-mono mt-1">
          Inv. {{ numeroInv }}
        </p>
      </div>
    </div>
  </div>
</template>