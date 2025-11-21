<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// --- IMPORTS CORRETOS (Baseados nos arquivos existentes) ---
import { useAcervoStore } from '../stores/acervo'; // Store correta
import SideFilter from '../components/SideFilter.vue';
import AcervoCard from '../components/AcervoCard.vue';
import HeaderNav from '@/components/HeaderNav.vue';

// Se você tiver o FooterSection criado, descomente a linha abaixo:
// import FooterSection from '@/components/FooterSection.vue';
// Se tiver o Loading Overlay instalado, descomente:
// import Loading from 'vue-loading-overlay';
// import 'vue-loading-overlay/dist/css/index.css';

const route = useRoute();
const router = useRouter();
const store = useAcervoStore(); // Store unificada

// --- ESTADOS ---
const filtrosAtivos = ref({ colecao: [], materia: [], subtipo: [], localizacao: [], estado: [] });
const paginaAtual = ref(1);
const itensPorPagina = ref(9);

// --- INICIALIZAÇÃO UNIFICADA ---
onMounted(async () => {
  // store.loading = true; // Se usar loading store externa
  await store.fetchItens();
  syncFiltersFromUrl();
  // store.loading = false;
});

// --- SINCRONIZAÇÃO URL <-> FILTROS ---
const syncFiltersFromUrl = () => {
  const query = route.query;
  filtrosAtivos.value = { colecao: [], materia: [], subtipo: [], localizacao: [], estado: [] };
  Object.keys(query).forEach(key => {
    if (key !== 'q' && filtrosAtivos.value.hasOwnProperty(key)) {
      const valor = Array.isArray(query[key]) ? query[key] : [query[key]];
      filtrosAtivos.value[key] = valor;
    }
  });
};

watch(() => route.query, syncFiltersFromUrl);

// Reseta para página 1 se filtrar
watch([filtrosAtivos, itensPorPagina], () => {
  paginaAtual.value = 1;
});

// --- LÓGICA DE FILTRAGEM (COMPUTED) ---
const opcoesFiltro = computed(() => store.opcoesDeFiltro);

const itensProcessados = computed(() => {
  return store.itensCompletos.filter(item => {
    // 1. Busca Texto
    const termoBusca = (route.query.q || "").toLowerCase();
    const superStringItem = [
      item.titulo, item.colecao, item.materia, item.subtipo, 
      item.numero_acervo, item.procedencia, item.datacao, item.id.toString()
    ].join(' ').toLowerCase();
    
    const matchTexto = termoBusca === "" || superStringItem.includes(termoBusca);

    // 2. Filtros Laterais
    const matchFiltros = Object.keys(filtrosAtivos.value).every(chave => {
      const selecionados = filtrosAtivos.value[chave];
      if (!selecionados || selecionados.length === 0) return true;
      // Mapeia para garantir que encontre o valor (ex: materia vs materia_prima)
      const valorItem = item[chave] || item['materia'] || item['subtipo'];
      return selecionados.includes(valorItem);
    });

    return matchTexto && matchFiltros;
  });
});

// --- PAGINAÇÃO ---
const totalPaginas = computed(() => Math.ceil(itensProcessados.value.length / itensPorPagina.value));

const itensDaPagina = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value;
  return itensProcessados.value.slice(inicio, inicio + itensPorPagina.value);
});

const mudarPagina = (p) => {
  if (p >= 1 && p <= totalPaginas.value) {
    paginaAtual.value = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const limparTudo = () => {
  filtrosAtivos.value = { colecao: [], materia: [], subtipo: [], localizacao: [], estado: [] };
  router.replace({ query: { q: route.query.q } });
};
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 pb-20 flex flex-col">

    <HeaderNav />

    <div class="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row pt-8 w-full flex-1">

      <!-- Filtros Laterais -->
      <SideFilter 
        :options="opcoesFiltro" 
        @update:selection="val => filtrosAtivos = val" 
      />

      <main class="flex-1 pl-0 lg:pl-10 mt-6 lg:mt-0">

        <!-- Barra de Controles -->
        <div class="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">

          <div class="text-sm text-gray-600 flex items-center gap-2">
            <span v-if="route.query.q">Busca: <strong>"{{ route.query.q }}"</strong> • </span>
            <span><strong>{{ itensProcessados.length }}</strong> resultados</span>

            <button 
              v-if="Object.values(filtrosAtivos).some(a => a.length > 0) || route.query.q"
              @click="limparTudo(); router.replace('/acervototal')"
              class="ml-3 text-xs font-bold text-red-600 uppercase hover:underline lg:hidden"
            >
              Limpar Filtros
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Exibir:</label>
            <select 
              v-model="itensPorPagina"
              class="text-sm border-gray-300 rounded bg-gray-50 focus:border-black cursor-pointer py-1 outline-none"
            >
              <option :value="6">6</option>
              <option :value="9">9</option>
              <option :value="12">12</option>
              <option :value="24">24</option>
            </select>
          </div>

        </div>

        <!-- Loading State -->
        <div v-if="store.loading" class="py-20 text-center">
           <div class="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-2"></div>
           <p class="text-xs uppercase tracking-widest text-gray-400">Carregando acervo...</p>
        </div>

        <!-- Grid de Cards -->
        <!-- CORREÇÃO: Usamos 'itensDaPagina' para que o filtro funcione. -->
        <!-- Se usarmos 'store.itens' direto, o filtro e a paginação são ignorados. -->
        <div v-else-if="itensDaPagina.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          <AcervoCard 
            v-for="item in itensDaPagina" 
            :key="item.id" 
            :item="item" 
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 flex flex-col items-center border border-dashed border-gray-200 rounded bg-gray-50">
          <p class="text-gray-500 text-lg mb-2">Nenhum item encontrado.</p>
          <button type="button" @click="limparTudo" class="text-black font-bold underline hover:no-underline">Limpar filtros</button>
        </div>

        <!-- Paginação -->
        <div v-if="totalPaginas > 1" class="mt-16 flex justify-center gap-2 border-t border-gray-100 pt-8 select-none">
          <button type="button" @click="mudarPagina(paginaAtual - 1)" :disabled="paginaAtual === 1" class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors">&larr;</button>

          <button 
            v-for="p in totalPaginas" 
            :key="p" 
            @click="mudarPagina(p)"
            class="w-10 h-10 flex items-center justify-center border transition-colors font-medium rounded text-sm"
            :class="paginaAtual === p ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black text-gray-600'"
          >
            {{ p }}
          </button>

          <button type="button" @click="mudarPagina(paginaAtual + 1)" :disabled="paginaAtual === totalPaginas" class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors">&rarr;</button>
        </div>

      </main>
    </div>

    <!-- Footer (Descomente se o componente existir) -->
    <!-- <FooterSection /> -->
    <footer v-if="!$slots.footer" class="mt-auto border-t border-gray-100 py-8 text-center text-gray-400 text-xs uppercase tracking-widest">
      Museu Sambaqui de Joinville &copy; 2025
    </footer>

  </div>
</template>