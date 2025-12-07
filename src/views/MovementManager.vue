<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useReservasStore } from "@/stores/reservas.js";
import { useItensAcervoStore } from "@/stores/itensAcervo.js";
import { useLocalizacoesStore } from "@/stores/localizacoes.js";
const localizacoesStore = useLocalizacoesStore();
const itensAcervoStore = useItensAcervoStore();
const reservaStore = useReservasStore();
const filters = reactive({
  search: "",
  tipo: "",
  status: "",
});
const currentItem = ref(null);
const showReservaModal = ref(false);
onMounted(async () => {
  await reservaStore.fetchReservas();
  await itensAcervoStore.fetchItens();
  await localizacoesStore.fetchLocalizacoes();
});
function formatarData(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
const reservasFiltradas = computed(() => {
  let data = reservaStore.reservas;
  const { search, tipo, status } = filters;
  const today = new Date();
  if (search) {
    const s = search.toLowerCase();
    data = data.filter(
      (r) =>
        (r.item_data?.titulo && r.item_data.titulo.toLowerCase().includes(s)) ||
        (r.item_data?.numero_acervo && r.item_data.numero_acervo.toString().includes(s))
    );
  }
  if (tipo) {
    data = data.filter((r) => r.tipo_movimento === tipo);
  }
  return data;
});
function handleSearch(e) {
  filters.search = e.target.value;
}
const openReservaModal = () => {
  currentItem.value = reservaStore.newReserva;
  showReservaModal.value = true;
};
const saveReserva = async () => {
  const success = await reservaStore.createReserva(currentItem.value);
  if (success) {
    showReservaModal.value = false;
  }
};
</script>
<template>
  <div class="font-sans text-gray-800">
    <div class="flex-1 flex flex-col transition-all duration-300">
      <main class="w-full">
        <header
          class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4"
        >
          <div>
            <h1 class="text-3xl font-bold text-black tracking-tight">
              Gestão de Reservas
            </h1>
            <p class="text-gray-500 mt-1">
              Administre as reservas e movimentações do acervo
            </p>
          </div>
          <div class="flex justify-between items-center mb-6">
            <button
              @click="openReservaModal()"
              class="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 transition-all shadow-sm flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nova
            </button>
          </div>
        </header>
        <div
          class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm mb-6 p-4 flex flex-wrap items-center gap-4"
        >
          <input
            @input="handleSearch"
            :value="filters.search"
            type="text"
            placeholder="Buscar..."
            class="border border-gray-200 bg-[#F9FAFB] rounded px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] outline-none transition-all font-medium"
          />
          <select
            v-model="filters.tipo"
            class="border border-gray-200 bg-[#F9FAFB] rounded px-4 py-2 text-sm w-40 focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] outline-none transition-all font-semibold"
          >
            <option value="">Todos Tipos</option>
            <option value="INTERNO">Interno</option>
            <option value="EXTERNA">Externo</option>
          </select>
        </div>
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Fluxo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Responsável
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <tr v-if="reservasFiltradas.length < 1" class="text-center">
                <td colspan="5" class="p-8 text-gray-500">Sem registros.</td>
              </tr>
              <tr
                v-for="reserva in reservasFiltradas"
                :key="reserva.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatarData(reserva.data_movimentacao) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-sm">{{ reserva.item_data?.titulo }}</div>
                  <div class="text-xs text-gray-500">
                    #{{ reserva.item_data?.numero_acervo }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-gray-100"
                  >
                    {{ reserva.local_origem_data?.nome_local }}
                  </span>
                  <span class="text-gray-400 font-bold">→</span>
                  <span
                    class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-white border"
                  >
                    {{ reserva.local_destino_data?.nome_local }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-sm text-gray-900">
                    {{ reserva.responsavel_data?.first_name }}
                    {{ reserva.responsavel_data?.last_name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-sm text-gray-700">
                    {{ reserva.tipo_movimento }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="showReservaModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <div
            class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in"
          >
            <div
              class="px-6 py-4 border-b border-gray-100 flex justify-between items-center"
            >
              <h3 class="text-lg font-bold text-[#1C1C1C]">Nova reserva</h3>
              <button
                @click="showReservaModal = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Item</label>
                  <select
                    v-model="currentItem.item"
                    class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  >
                    <option disabled value="">Item</option>
                    <option
                      v-for="item in itensAcervoStore.itensAcervo"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.titulo }}
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Local de origem</label
                >
                <select
                  v-model="currentItem.local_origem"
                  class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                >
                  <option
                    v-for="l in localizacoesStore.localizacoes"
                    :key="l.id"
                    :value="l.id"
                  >
                    {{ l.nome_local }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Local de destino</label
                >
                <select
                  v-model="currentItem.local_destino"
                  class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                >
                  <option
                    v-for="l in localizacoesStore.localizacoes"
                    :key="l.id"
                    :value="l.id"
                  >
                    {{ l.nome_local }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  v-model="currentItem.tipo_movimento"
                  class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                >
                  <option disabled value="">Tipo de movimento</option>
                  <option
                    v-for="t in reservaStore.movimentoOptions"
                    :key="t.value"
                    :value="t.value"
                  >
                    {{ t.label }}
                  </option>
                </select>
              </div>
            </div>
            <div
              class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3"
            >
              <button
                @click="showReservaModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                @click="saveReserva"
                class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>