<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  options: { type: Object, required: true }
});

const emit = defineEmits(['update:selection']);

const selected = ref({
  colecao: [], materia: [], subtipo: [], localizacao: [], estado: []
});

const openSections = ref({
  colecao: true, materia: true, subtipo: true, localizacao: true, estado: true
});

const isMobileOpen = ref(false);

const toggle = (key) => openSections.value[key] = !openSections.value[key];

const labels = {
  colecao: 'Coleção', materia: 'Matéria Prima', subtipo: 'Sub-tipo', 
  localizacao: 'Localização Física', estado: 'Conservação'
};

let timeout = null;

watch(selected, (newVal) => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    emit('update:selection', JSON.parse(JSON.stringify(newVal)));
  }, 400); 
}, { deep: true });

const limparFiltros = () => {
  selected.value = { colecao: [], materia: [], subtipo: [], localizacao: [], estado: [] };
};
</script>

<template>
  <aside class="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 py-4 flex flex-col">
    
    <button 
      type="button"
      @click="isMobileOpen = !isMobileOpen"
      class="lg:hidden flex justify-between items-center w-full py-2 mb-2 group outline-none"
    >
      <div class="flex items-center gap-2">
        <span class="font-serif font-bold text-lg text-gray-900">Filtros</span>
        <span class="bg-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-600">
          {{ isMobileOpen ? 'Fechar' : 'Expandir' }}
        </span>
      </div>
      <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-300" :class="isMobileOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div class="hidden lg:flex justify-between items-baseline mb-6">
      <h2 class="font-serif font-bold text-xl text-gray-900">Filtros</h2>
      <button 
        type="button"
        v-if="Object.values(selected).some(arr => arr.length > 0)"
        @click="limparFiltros" 
        class="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors border-b border-transparent hover:border-red-800"
      >
        Limpar
      </button>
    </div>

    <div 
      class="flex-1 transition-all duration-300 ease-in-out overflow-hidden"
      :class="[
        isMobileOpen ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100 lg:mb-0'
      ]"
    >
      <div class="lg:hidden mb-4 pb-4 border-b border-gray-100" v-if="Object.values(selected).some(arr => arr.length > 0)">
         <button type="button" @click="limparFiltros" class="text-xs font-bold text-red-600 uppercase w-full text-left py-2">
           Limpar todos os filtros
         </button>
      </div>

      <div class="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-0">
        
        <div v-for="(lista, key) in options" :key="key" class="border-b border-gray-100 py-4 last:border-0">
          
          <button type="button" @click="toggle(key)" class="w-full flex justify-between items-center text-left mb-2 outline-none group select-none">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-900 group-hover:text-gray-600 transition-colors">
              {{ labels[key] || key }}
            </span>
            <span class="text-gray-400 text-[10px] transform transition-transform duration-200" :class="openSections[key] ? 'rotate-180' : ''">
              ▼
            </span>
          </button>

          <div v-if="openSections[key]" class="space-y-2.5 mt-3 pl-1">
            <label v-for="opt in lista" :key="opt" class="flex items-start cursor-pointer group select-none">
              <div class="relative flex items-center h-5">
                <input 
                  type="checkbox" 
                  :value="opt" 
                  v-model="selected[key]" 
                  class="peer h-4 w-4 border border-gray-300 rounded-none text-black focus:ring-1 focus:ring-black focus:ring-offset-0 cursor-pointer appearance-none checked:bg-black checked:border-black transition-colors" 
                />
                <svg class="absolute w-3 h-3 text-white left-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="ml-3 text-sm text-gray-600 group-hover:text-black transition-colors leading-tight">
                {{ opt }}
              </span>
            </label>
          </div>
        </div>

      </div>

    </div>

  </aside>
</template>