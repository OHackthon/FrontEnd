<script setup>
import { ref, computed, onMounted } from "vue";
import { useItensAcervoStore } from "@/stores/itensAcervo";
import { useColecoesStore } from "@/stores/colecoes";
import { useCategoriasStore } from "@/stores/categorias";
import { useLocalizacoesStore } from "@/stores/localizacoes";

const itensStore = useItensAcervoStore();
const colecoesStore = useColecoesStore();
const categoriasStore = useCategoriasStore();
const localizacoesStore = useLocalizacoesStore();

onMounted(async () => {
  await Promise.all([
    itensStore.fetchItens(),
    colecoesStore.fetchColecoes(),
    categoriasStore.fetchCategorias(),
    localizacoesStore.fetchLocalizacoes(),
  ]);
});

// --- ESTADO DA UI ---
const searchQuery = ref("");
const selectedColecao = ref("");
const selectedCategoria = ref("");
const selectedLocalizacao = ref("");
const showModal = ref(false);
const modalMode = ref("create"); // 'create' | 'edit'
const currentItem = ref({});

// --- LÓGICA COMPUTADA (FILTROS) ---
const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return itensStore.itensAcervo.filter((item) => {
    const matchesSearch =
      item.titulo?.toLowerCase().includes(q) ||
      item.colecao?.nome_colecao?.toLowerCase().includes(q);

    const matchesColecao = selectedColecao.value
      ? (item.colecao?.id || item.colecao) == selectedColecao.value
      : true;

    const matchesCategoria = selectedCategoria.value
      ? (item.categoria_acervo?.id || item.categoria_acervo) == selectedCategoria.value
      : true;

    const matchesLocalizacao = selectedLocalizacao.value
      ? (item.localizacao_atual?.id || item.localizacao_atual) ==
        selectedLocalizacao.value
      : true;

    return matchesSearch && matchesColecao && matchesCategoria && matchesLocalizacao;
  });
});

// --- AÇÕES ---
const openModal = (mode, item = null) => {
  modalMode.value = mode;
  if (mode === "create") {
    currentItem.value = {
      id: null,
      titulo: "",
      colecao: null,
      categoria_acervo: null,
      localizacao_atual: null,
      descricao: "",
      estado_conservacao: "",
    };
  } else {
    // Clone item to avoid direct mutation
    // Ensure IDs are used for selects if objects are returned
    currentItem.value = {
      ...item,
      colecao: item.colecao?.id || item.colecao,
      categoria_acervo: item.categoria_acervo?.id || item.categoria_acervo,
      localizacao_atual: item.localizacao_atual?.id || item.localizacao_atual,
    };
  }
  showModal.value = true;
};

const saveItem = async () => {
  // Prepare payload (ensure IDs are sent)
  const payload = { ...currentItem.value };

  if (modalMode.value === "create") {
    await itensStore.createItemAcervo(payload);
  } else {
    // Assuming update action exists, if not we might need to add it to store
    // await itensStore.updateItemAcervo(payload)
    console.warn("Update not implemented in store yet");
  }
  showModal.value = false;
  await itensStore.fetchItens();
};

const deleteItem = async (id) => {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    // await itensStore.deleteItemAcervo(id)
    console.warn("Delete not implemented in store yet");
  }
};

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const result = await itensStore.uploadExcel(file);
    alert(result.message || 'Importação concluída!');
    if (result.errors && result.errors.length > 0) {
      console.warn('Erros na importação:', result.errors);
      alert('Alguns itens não foram importados. Verifique o console para detalhes.');
    }
  } catch (error) {
    alert('Erro ao importar arquivo: ' + (error.response?.data?.error || error.message));
  } finally {
    event.target.value = ''; // Reset input
  }
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
      <!-- PAGE HEADER -->
      <header
        class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">
            Gestão de Artefatos
          </h1>
          <p class="text-gray-500 mt-1">Administre os itens do acervo</p>
        </div>
        <div class="flex gap-3">
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".xlsx, .xls"
            @change="handleFileUpload"
          />
          <button
            @click="triggerFileInput"
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar Excel
          </button>
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
            Novo Artefato
          </button>
        </div>
      </header>

      <!-- LISTA -->
      <section class="mb-12">
        <div
          class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4"
        >
          <h2 class="text-xl font-bold text-[#1C1C1C]">Lista de Artefatos</h2>

          <div class="flex flex-col md:flex-row gap-2 w-full xl:w-auto">
            <!-- Filtro Coleção -->
            <select
              v-model="selectedColecao"
              class="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
              <option value="">Todas Coleções</option>
              <option v-for="col in colecoesStore.colecoes" :key="col.id" :value="col.id">
                {{ col.nome_colecao }}
              </option>
            </select>

            <!-- Filtro Categoria -->
            <select
              v-model="selectedCategoria"
              class="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
              <option value="">Todas Categorias</option>
              <option
                v-for="cat in categoriasStore.categorias"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.nome }}
              </option>
            </select>

            <!-- Filtro Localização -->
            <select
              v-model="selectedLocalizacao"
              class="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
              <option value="">Todas Localizações</option>
              <option
                v-for="loc in localizacoesStore.localizacoes"
                :key="loc.id"
                :value="loc.id"
              >
                {{ loc.nome_local }}
              </option>
            </select>

            <div class="relative w-full md:w-64">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Pesquisar artefatos..."
                class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
              />
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
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
        </div>

        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Título
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Coleção
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Categoria
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Localização
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
                  {{ item.titulo }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.colecao?.nome_colecao || "-" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.categoria_acervo?.nome || "-" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.localizacao_atual?.nome_local || "-" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-3">
                    <button
                      @click="openModal('edit', item)"
                      class="text-[#0F766E] hover:text-[#0F3D3E] transition-colors p-2 rounded-lg hover:bg-[#0F766E]/10"
                      title="Editar"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="deleteItem(item.id)"
                      class="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Excluir"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">
            {{ modalMode === "create" ? "Novo Artefato" : "Editar Artefato" }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              v-model="currentItem.titulo"
              type="text"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Coleção</label>
            <select
              v-model="currentItem.colecao"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            >
              <option :value="null">Selecione...</option>
              <option v-for="col in colecoesStore.colecoes" :key="col.id" :value="col.id">
                {{ col.nome_colecao }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              v-model="currentItem.categoria_acervo"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            >
              <option :value="null">Selecione...</option>
              <option
                v-for="cat in categoriasStore.categorias"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Localização Atual</label
            >
            <select
              v-model="currentItem.localizacao_atual"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            >
              <option :value="null">Selecione...</option>
              <option
                v-for="loc in localizacoesStore.localizacoes"
                :key="loc.id"
                :value="loc.id"
              >
                {{ loc.nome_local }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Estado de Conservação</label
            >
            <input
              v-model="currentItem.estado_conservacao"
              type="text"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              v-model="currentItem.descricao"
              rows="3"
              class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
            ></textarea>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            @click="showModal = false"
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
