<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SideFilter from '../components/SideFilter.vue';
import AcervoCard from '../components/AcervoCard.vue';
import NavBar from '../components/NavBar.vue';
import { useItensAcervoStore } from '@/stores/itensAcervo'; 
import { useLoading } from '@/stores/loading';
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

const loadingStore = useLoading()
const itensAcervoStore = useItensAcervoStore();
const route = useRoute();
const router = useRouter();
const store = useAcervoStore(); // Iniciando a Store

onMounted( async () => {
  loadingStore.isLoading = true;
  await itensAcervoStore.fetchItens();
  loadingStore.isLoading = false
});

// --- 2. OPÇÕES DE FILTRO ---
const opcoesFiltro = ref({
  colecao: ["Tiburtius", "Sambaqui", "Etnologia", "Outros"],
  materia: ["Mineral", "Vegetal", "Animal"],
  subtipo: ["Cerâmica", "Rocha Lascada", "Rocha Polida", "Cestaria", "Adorno", "Osso", "Fóssil"],
});

const filtrosAtivos = ref({ colecao: [], materia: [], subtipo: [], localizacao: [], estado: [] });
const paginaAtual = ref(1);
const itensPorPagina = ref(9); // Padrão 9 para grid 3x3

// --- 2. INICIALIZAÇÃO ---
onMounted(async () => {
  // Carrega os dados da store (simula backend)
  await store.fetchItens();
  syncFiltersFromUrl();
});

// Sincroniza URL -> Filtros
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

// Resetar página se mudar filtros ou itens p/ página
watch([filtrosAtivos, itensPorPagina], () => {
  paginaAtual.value = 1;
});

// --- 3. DADOS COMPUTADOS (Da Store) ---
// Pega as opções de filtro dinamicamente da store (não mais hardcoded)
const opcoesFiltro = computed(() => store.opcoesDeFiltro);

// Lógica de Filtragem usando os dados da Store
const itensProcessados = computed(() => {
  // Usa 'store.itensCompletos' que já vem com os nomes (Coleção X, Material Y) em vez de IDs
  return store.itensCompletos.filter(item => {

    // A. BUSCA TEXTUAL (URL ?q=...)
    const termoBusca = (route.query.q || "").toLowerCase();

    // Cria uma "Super String" de busca com todos os campos ricos
    const superStringItem = [
      item.titulo,
      item.colecao,
      item.materia,
      item.subtipo,
      item.numero_acervo, // Busca pelo inventário (Ex: E 32548)
      item.procedencia,   // Busca por lugar (Ex: Louxor)
      item.datacao,       // Busca por data (Ex: 1800)
      item.id.toString()
    ].join(' ').toLowerCase();

    const matchTexto = termoBusca === "" || superStringItem.includes(termoBusca);

    // B. FILTROS LATERAIS
    const matchFiltros = Object.keys(filtrosAtivos.value).every(chave => {
      const selecionados = filtrosAtivos.value[chave];
      if (!selecionados || selecionados.length === 0) return true;

      // Mapeia chaves do filtro para chaves do item da store
      const valorItem = item[chave] || item['materia'] || item['subtipo'];
      return selecionados.includes(valorItem);
    });

    return matchTexto && matchFiltros;
  });
});

// --- 4. PAGINAÇÃO ---
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
  <div class="min-h-screen bg-white font-sans text-gray-900 pb-20">

    <NavBar />

    <div class="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row pt-8">

      <!-- Filtros Laterais (Puxados da Store) -->
      <SideFilter :options="opcoesFiltro" @update:selection="val => filtrosAtivos = val" />

      <main class="flex-1 pl-0 lg:pl-10 mt-6 lg:mt-0">

        <!-- Barra de Controles -->
        <div class="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">

          <div class="text-sm text-gray-600 flex items-center gap-2">
            <span v-if="route.query.q">Busca: <strong>"{{ route.query.q }}"</strong> • </span>
            <span><strong>{{ itensProcessados.length }}</strong> resultados</span>

            <button v-if="Object.values(filtrosAtivos).some(a => a.length > 0) || route.query.q"
              @click="limparTudo(); router.replace('/acervototal')"
              class="ml-3 text-xs font-bold text-red-600 uppercase hover:underline lg:hidden">
              Limpar Filtros
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400">Exibir:</label>
            <select v-model="itensPorPagina"
              class="text-sm border-gray-300 rounded bg-gray-50 focus:border-black cursor-pointer py-1">
              <option :value="6">6</option>
              <option :value="9">9</option>
              <option :value="12">12</option>
              <option :value="24">24</option>
            </select>
          </div>

        </div>

        <!-- Grid de Cards -->
        <div  v-if="itensAcervoStore.itensAcervo.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          <AcervoCard v-for="item in itensAcervoStore.itensAcervo" :key="item.id" :item="item" />
        </div>

        <!-- Empty State -->
        <div v-else
          class="text-center py-20 flex flex-col items-center border border-dashed border-gray-200 rounded bg-gray-50">
          <p class="text-gray-500 text-lg mb-2">Nenhum item encontrado.</p>
          <button type="button" @click="limparTudo" class="text-black font-bold underline hover:no-underline">Limpar
            filtros</button>
        </div>

        <!-- Paginação -->
        <div v-if="totalPaginas > 1" class="mt-16 flex justify-center gap-2 border-t border-gray-100 pt-8 select-none">
          <button type="button" @click="mudarPagina(paginaAtual - 1)" :disabled="paginaAtual === 1"
            class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors">&larr;</button>

          <button type="button" v-for="p in totalPaginas" :key="p" @click="mudarPagina(p)"
            class="w-10 h-10 flex items-center justify-center border transition-colors font-medium rounded text-sm"
            :class="paginaAtual === p ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black text-gray-600'">
            {{ p }}
          </button>

          <button type="button" @click="mudarPagina(paginaAtual + 1)" :disabled="paginaAtual === totalPaginas"
            class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors">&rarr;</button>
        </div>

      </main>
    </div>
  </div>
</template>