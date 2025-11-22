<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SideFilter from "../components/SideFilter.vue";
import AcervoCard from "../components/AcervoCard.vue";
import { useItensAcervoStore } from "@/stores/itensAcervo";
import { useLoading } from "@/stores/loading";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import HeaderNav from '@/components/HeaderNav.vue'

const loadingStore = useLoading();
const itensAcervoStore = useItensAcervoStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  loadingStore.isLoading = true;
  await itensAcervoStore.fetchItens();
  loadingStore.isLoading = false;
});

// --- 2. OPÇÕES DE FILTRO DINÂMICAS ---
// Computed que extrai opções únicas dos dados carregados
const opcoesFiltro = computed(() => {
  if (itensAcervoStore.itensAcervo.length === 0) {
    // Sem dados, sem opções de filtro
    return {
      colecao: [],
      materia: [],
      subtipo: [],
      localizacao: [],
      estado: [],
    };
  }

  // === EXTRAI OPÇÕES ÚNICAS DOS DADOS REAIS ===
  const colecoes = [
    ...new Set(
      itensAcervoStore.itensAcervo
        .map((item) => item.colecao?.nome_colecao || item.colecao?.nome || item.colecao)
        .filter(Boolean)
    ),
  ];

  const materias = [
    ...new Set(
      itensAcervoStore.itensAcervo
        .map((item) => item.materia_prima?.nome || item.materia_prima)
        .filter(Boolean)
    ),
  ];

  const subtipos = [
    ...new Set(
      itensAcervoStore.itensAcervo
        .map((item) => item.subtipo?.termo || item.subtipo?.nome || item.subtipo)
        .filter(Boolean)
    ),
  ];

  const localizacoes = [
    ...new Set(
      itensAcervoStore.itensAcervo
        .map(
          (item) =>
            item.localizacao_atual?.nome_local ||
            item.localizacao_atual?.nome ||
            item.localizacao_atual ||
            item.localizacao?.nome_local ||
            item.localizacao?.nome ||
            item.localizacao
        )
        .filter(Boolean)
    ),
  ];

  const estados = [
    ...new Set(
      itensAcervoStore.itensAcervo
        .map((item) => item.estado_conservacao || item.estado)
        .filter(Boolean)
    ),
  ];

  return {
    colecao: colecoes.sort(),
    materia: materias.sort(),
    subtipo: subtipos.sort(),
    localizacao: localizacoes.sort(),
    estado: estados.sort(),
  };
});

const paginaAtual = ref(1);
const itensPorPagina = ref(6);

const syncFiltersFromUrl = () => {
  const query = route.query;
  const novosFiltros = {
    colecao: [],
    materia: [],
    subtipo: [],
    localizacao: [],
    estado: [],
  };
  Object.keys(query).forEach((key) => {
    if (key !== "q" && novosFiltros.hasOwnProperty(key)) {
      const valor = Array.isArray(query[key]) ? query[key] : [query[key]];
      novosFiltros[key] = valor;
    }
  });
  itensAcervoStore.atualizarFiltros(novosFiltros);
};

onMounted(syncFiltersFromUrl);
watch(() => route.query, syncFiltersFromUrl);

watch([() => itensAcervoStore.filtrosAtivos, itensPorPagina], () => {
  paginaAtual.value = 1;
});

const itensProcessados = computed(() => {
  return itensAcervoStore.itensAcervoFiltrados.filter((item) => {
    const termoBusca = (route.query.q || "").toLowerCase();
    if (termoBusca === "") return true;

    const superStringItem = [
      item.titulo,
      item.nome,
      item.colecao?.nome_colecao || item.colecao?.nome || item.colecao,
      item.materia_prima?.nome || item.materia_prima || item.materia,
      item.subtipo?.termo || item.subtipo?.nome || item.subtipo,
      item.id.toString(),
    ]
      .join(" ")
      .toLowerCase();

    return superStringItem.includes(termoBusca);
  });
});

const itensPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina.value;
  const fim = inicio + itensPorPagina.value;
  return itensProcessados.value.slice(inicio, fim);
});

const totalPaginas = computed(() =>
  Math.ceil(itensProcessados.value.length / itensPorPagina.value)
);

const mudarPagina = (p) => {
  paginaAtual.value = p;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const limparTudo = () => {
  itensAcervoStore.limparFiltros();
  router.replace({ query: { q: route.query.q } });
};

const atualizarFiltros = (novosFiltros) => {
  itensAcervoStore.atualizarFiltros(novosFiltros);
};
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 pb-20">
    <HeaderNav />

    <div class="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row pt-8">
      <SideFilter
        :options="opcoesFiltro"
        :filtrosAtivos="itensAcervoStore.filtrosAtivos"
        @update:selection="atualizarFiltros"
      />

      <main class="flex-1 pl-0 lg:pl-10 mt-6 lg:mt-0">
        <!-- Barra de Controles -->
        <div
          class="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4"
        >
          <!-- Info de Resultados -->
          <div class="text-sm text-gray-600 flex items-center gap-2">
            <span v-if="route.query.q"
              >Busca: <strong>"{{ route.query.q }}"</strong> •
            </span>
            <span
              ><strong>{{ itensProcessados.length }}</strong> resultados</span
            >
          </div>

          <!-- Seletor de Paginação -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold uppercase tracking-widest text-gray-400"
              >Exibir:</label
            >
            <select
              v-model="itensPorPagina"
              class="text-sm border-gray-300 rounded bg-gray-50 focus:border-black cursor-pointer py-1"
            >
              <option :value="6">6 itens</option>
              <option :value="9">9 itens</option>
              <option :value="12">12 itens</option>
              <option :value="24">24 itens</option>
            </select>
          </div>
        </div>

        <!-- ✅ GRID DE CARDS - DADOS FILTRADOS EM TEMPO REAL -->
        <!-- Os dados aqui já passaram por todos os filtros:
             1. Filtros de checkbox (store)
             2. Filtro de busca por texto
             3. Paginação -->
        <div
          v-if="itensPaginados.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
        >
          <AcervoCard v-for="item in itensPaginados" :key="item.id" :item="item" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="itensAcervoStore.itensAcervo.length === 0"
          class="text-center py-20 flex flex-col items-center"
        >
          <p class="text-gray-500 text-lg mb-2">Nenhum item encontrado.</p>
          <button
            type="button"
            @click="limparTudo"
            class="text-black font-bold underline"
          >
            Limpar filtros
          </button>
        </div>

        <!-- Estado quando não há itens após filtros -->
        <div v-else class="text-center py-20 flex flex-col items-center">
          <p class="text-gray-500 text-lg mb-2">
            Nenhum item corresponde aos filtros selecionados.
          </p>
          <button
            type="button"
            @click="limparTudo"
            class="text-black font-bold underline"
          >
            Limpar filtros
          </button>
        </div>

        <!-- Paginação -->
        <div
          v-if="totalPaginas > 1"
          class="mt-16 flex justify-center gap-2 border-t border-gray-100 pt-8 select-none"
        >
          <button
            type="button"
            @click="mudarPagina(paginaAtual - 1)"
            :disabled="paginaAtual === 1"
            class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors"
          >
            &larr;
          </button>

          <button
            type="button"
            v-for="p in totalPaginas"
            :key="p"
            @click="mudarPagina(p)"
            class="w-10 h-10 flex items-center justify-center border transition-colors font-medium rounded"
            :class="
              paginaAtual === p
                ? 'bg-black text-white border-black'
                : 'border-gray-200 hover:border-black text-gray-600'
            "
          >
            {{ p }}
          </button>

          <button
            type="button"
            @click="mudarPagina(paginaAtual + 1)"
            :disabled="paginaAtual === totalPaginas"
            class="h-10 px-4 flex items-center justify-center border border-gray-200 rounded hover:border-black disabled:opacity-30 transition-colors"
          >
            &rarr;
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
