<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

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
    router.push({ name: 'item-detail', params: { id: props.item.id } });
  } else {
    console.warn("Item sem ID, impossível navegar para detalhes:", props.item);
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
        :src="item.imagem.url"
        :alt="item.nome"
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
      />
      <div
        v-if="item.materia_prima"
        class="absolute bottom-0 left-0 bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-t border-r border-gray-100 shadow-sm z-10"
      >
        {{ item.materia_prima.nome }}
      </div>
    <div class="px-1 flex flex-col gap-1">
      <h3
        class="font-serif text-lg text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2"
      >
        {{ item.nome }}
      </h3>

      <div
        class="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 uppercase tracking-wide"
      >
        <span class="truncate max-w-[150px]">{{ item.colecao.nome_colecao }}</span>
        <span v-if="item.subtipo" class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span v-if="item.subtipo" class="text-gray-900 truncate">{{ item.subtipo.termo }}</span>
      </div>
    </div>
  </div>
</template>
