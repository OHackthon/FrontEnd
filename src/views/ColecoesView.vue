<script setup>
import { ref, computed, onMounted } from "vue";
import { useColecoesStore } from "@/stores/colecoes";

const colecoesStore = useColecoesStore();

onMounted(async () => {
  await colecoesStore.fetchColecoes();
});

const searchQuery = ref("");
const showModal = ref(false);
const modalMode = ref("create");
const currentItem = ref({});

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return colecoesStore.colecoes.filter((item) => {
    const matchesSearch =
      item.nome_colecao?.toLowerCase().includes(q) ||
      item.nome_colecionador?.toLowerCase().includes(q);
    return matchesSearch;
  });
});

const openModal = (mode, item = null) => {
  modalMode.value = mode;
  if (mode === "create") {
    currentItem.value = {
      id: null,
      nome_colecao: "",
      nome_colecionador: "",
      data_aquisicao: "",
      descricao_origem: "",
    };
  } else {
    currentItem.value = { ...item };
  }
  showModal.value = true;
};

const saveItem = async () => {
  const payload = { ...currentItem.value };
  if (modalMode.value === "create") {
    await colecoesStore.createColecao(payload);
  } else {
    console.warn("Update not implemented in store yet");
  }
  showModal.value = false;
  await colecoesStore.fetchColecoes();
};

function formatarData(dataIso) {
  if (!dataIso) return "";
  const data = new Date(dataIso);
  return data.toLocaleDateString("pt-BR");
}
</script>

<template>
  <div class="font-sans text-[#1C1C1C]">
    <main class="w-full">
      <header class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Gestão de Coleções</h1>
          <p class="text-gray-500 mt-1">Administre as coleções do acervo</p>
        </div>
        <button
          @click="openModal('create')"
          class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nova Coleção
        </button>
      </header>

      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar coleções..."
            class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              class="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-[#F9FAFB]">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Nome da Coleção
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Colecionador
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Data de Aquisição
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 bg-white">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.nome_colecao }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.nome_colecionador || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatarData(item.data_aquisicao) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-3">
                  <button
                    @click="openModal('edit', item)"
                    class="text-[#0F766E] hover:text-[#0F3D3E] transition-colors p-2 rounded-lg hover:bg-[#0F766E]/10"
                    title="Editar"
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredItems.length === 0" class="p-6 text-center text-gray-500">
          Nenhuma coleção encontrada
        </div>
      </div>

      <!-- Modal para adicionar/editar -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <div
          class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto"
        >
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#1C1C1C]">
              {{ modalMode === "create" ? "Nova Coleção" : "Editar Coleção" }}
            </h3>
            <button @click="showModal = false; currentItem = {}" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Coleção</label>
              <input
                v-model="currentItem.nome_colecao"
                type="text"
                class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Colecionador</label>
              <input
                v-model="currentItem.nome_colecionador"
                type="text"
                class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data de Aquisição</label>
              <input
                v-model="currentItem.data_aquisicao"
                type="date"
                class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição da Origem</label>
              <textarea
                v-model="currentItem.descricao_origem"
                rows="3"
                class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              ></textarea>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              @click="showModal = false; currentItem = {}"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              @click="saveItem"
              class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
