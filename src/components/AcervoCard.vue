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
         'https://via.placeholder.com/400x300?text=Sem+Imagem';
});

// Computeds seguros para garantir que o card renderize mesmo se faltar dado
const titulo = computed(() => props.item.titulo || 'Sem Título');
const colecao = computed(() => props.item.colecao || 'Acervo Geral');
const materia = computed(() => props.item.materia || props.item.materia_prima || '');
const subtipo = computed(() => props.item.subtipo || '');
const numeroInv = computed(() => props.item.numero_acervo || props.item.id);
const procedencia = computed(() => props.item.procedencia || 'Origem não registrada');
const datacao = computed(() => props.item.datacao || 'Data desc.');

// --- NAVEGAÇÃO ---
const irParaDetalhe = () => {
  if (props.item.id) {
    // Nome da rota deve bater com router/index.js ('item-detail')
    router.push({ name: 'item-detail', params: { id: props.item.id } });
  } else {
    console.warn('Item sem ID, impossível navegar:', props.item);
  }
};

// --- LÓGICA VISUAL (LOADING) ---
const imageLoaded = ref(false);

const handleImageLoad = () => {
  imageLoaded.value = true;
};

const handleImageError = (e) => {
  // Fallback visual caso a imagem quebre
  e.target.src = 'https://wallpapers.com/images/featured-full/bart-simpson-menino-triste-b4vj9t4dwkc9hk4t.jpg';
  imageLoaded.value = true; 
};
</script>

<template>
  <div 
    @click="irParaDetalhe"
    class="group flex flex-col gap-4 cursor-pointer select-none bg-white h-full relative transition-transform duration-300 hover:-translate-y-1"
  >
    <!-- ÁREA DA FOTO (4:3 Ratio Fixo) -->
    <!-- 'style' inline garante a proporção mesmo se o Tailwind falhar -->
    <div 
      class="overflow-hidden bg-gray-100 relative rounded-sm w-full border border-gray-100"
      style="aspect-ratio: 4/3;"
    >
      <!-- Imagem com efeito Fade-In -->
      <img 
        :src="imagemUrl" 
        @load="handleImageLoad"
        @error="handleImageError"
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
        :class="imageLoaded ? 'opacity-100' : 'opacity-0'" 
        loading="lazy"
        :alt="titulo"
      />
      
      <!-- Skeleton (Loading State) -->
      <div v-if="!imageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center">
         <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
         </svg>
      </div>

      <!-- Badge de Matéria Prima (Estilo Louvre) -->
      <div 
        v-if="materia" 
        class="absolute bottom-0 left-0 bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-t border-r border-gray-100 shadow-sm z-10"
      >
        {{ materia }}
      </div>
    </div>

    <!-- INFORMAÇÕES DO ITEM -->
    <div class="px-1 flex flex-col gap-2">
      
      <!-- 1. Coleção e Subtipo -->
      <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <span class="truncate max-w-[60%]">{{ colecao }}</span>
        <span v-if="subtipo" class="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
        <span v-if="subtipo" class="truncate text-gray-500">{{ subtipo }}</span>
      </div>

      <!-- 2. Título (Serifado) -->
      <h3 class="font-serif text-lg md:text-xl text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2 h-[3.2em]">
        {{ titulo }}
      </h3>

      <!-- 3. Dados Técnicos (Data, Lugar, ID) -->
      <div class="flex flex-col gap-1 pt-1 border-t border-gray-50 mt-auto">
        <!-- Data e Lugar -->
        <p class="text-xs text-gray-600 font-medium truncate">
          {{ datacao }} <span class="text-gray-300 mx-1">|</span> {{ procedencia }}
        </p>
        
        <!-- Número de Inventário -->
        <p class="text-[10px] text-gray-400 font-mono mt-1">
          Inv. {{ numeroInv }}
        </p>
      </div>

    </div>

  </div>
</template>