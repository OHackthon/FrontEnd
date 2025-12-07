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

const imageUrl = computed(() => {
  if (props.item.imagem) {
    // If it's an object with url property (some setups)
    if (typeof props.item.imagem === 'object' && props.item.imagem.url) {
      return props.item.imagem.url;
    }
    // If it's a direct string URL (DRF default)
    if (typeof props.item.imagem === 'string') {
      return props.item.imagem;
    }
  }
  return 'https://placehold.co/400x300?text=Sem+Imagem';
});

const irParaDetalhe = () => {

  if (props.item.id) {
    router.push({ name: "detalhe-item", params: { id: props.item.id } });
  } else {
    console.warn("Item sem ID, impossível navegar para detalhes:", props.item);
  }
};
</script>

<template>
  <div
    @click="irParaDetalhe"
    class="group flex flex-col gap-3 cursor-pointer select-none bg-white h-full relative"
  >
    <div
      class="overflow-hidden bg-gray-100 relative rounded-sm w-full"
      style="aspect-ratio: 4/3"
    >
      <img
        :src="imageUrl"
        :alt="item.titulo"
        class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 absolute inset-0"
      />

      <div
        v-if="item.materia_prima"
        class="absolute bottom-0 left-0 bg-white/95 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-t border-r border-gray-100 shadow-sm z-10"
      >
        {{ item.materia_prima.materia || item.materia_prima.nome }}
      </div>
    </div>

    <div class="px-1 flex flex-col gap-1">
      <h3
        class="font-serif text-lg text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2"
      >
        {{ item.titulo }}
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