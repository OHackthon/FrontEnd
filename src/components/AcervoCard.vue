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

const imagemUrl = computed(() => {
  return props.item.img || 
         props.item.imagem || 
         props.item.url || 
         'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
});

const titulo = computed(() => props.item.titulo || 'Item sem Título');
const colecao = computed(() => props.item.colecao || 'Acervo Geral');
const materia = computed(() => props.item.materia || props.item.materia_prima || '');
const subtipo = computed(() => props.item.subtipo || '');

const irParaDetalhe = () => {
  if (props.item.id) {
    router.push({ name: 'detalhe-item', params: { id: props.item.id } });
  } else {
    console.warn('Item sem ID, impossível navegar para detalhes:', props.item);
  }
};

const imageLoaded = ref(false);

const handleImageLoad = () => {
  imageLoaded.value = true; 
};

const handleImageError = (e) => {
  e.target.src = 'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
  imageLoaded.value = true; 
};
</script>

<template>
  <div 
    @click="irParaDetalhe"
    class="group flex flex-col gap-3 cursor-pointer select-none bg-white h-full relative"
  >
    <div 
      class="overflow-hidden bg-gray-100 relative rounded-sm w-full"
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

      <div 
        v-if="materia" 
        class="absolute bottom-0 left-0 bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-t border-r border-gray-100 shadow-sm z-10"
      >
        {{ materia }}
      </div>
    </div>

    <div class="px-1 flex flex-col gap-1">
      <h3 class="font-serif text-lg text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
        {{ titulo }}
      </h3>

      <div class="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 uppercase tracking-wide">
        <span class="truncate max-w-[150px]">{{ colecao }}</span>
        <span v-if="subtipo" class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span v-if="subtipo" class="text-gray-400 truncate">{{ subtipo }}</span>
      </div>
      
      <p class="text-[10px] text-gray-300 font-mono mt-1">
        Ref: {{ item.id }}
      </p>
    </div>

  </div>
</template>