<script setup>
import { onMounted, ref, computed } from "vue";
import { useCategoriasStore } from "@/stores/categorias";
import { useModalStore } from "@/stores/modal";
import { useLoading } from "@/stores/loading";

const categoriasStore = useCategoriasStore();
const modalStore = useModalStore();
const loadingStore = useLoading();

const searchQuery = ref("");

const filteredCategorias = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return categoriasStore.categorias.filter(
    (categoria) =>
      categoria.nome.toLowerCase().includes(q) ||
      (categoria.descricao && categoria.descricao.toLowerCase().includes(q))
  );
});

const handleCreateCategoria = async () => {
  if (!modalStore.editingItem.nome.trim()) {
    return;
  }

  if (modalStore.isEditing) {
    await categoriasStore.updateCategoria();
  } else {
    await categoriasStore.createCategoria(modalStore.editingItem);
  }
};

const handleEditCategoria = (categoria) => {
  modalStore.openCreateModal(categoria);
};

const handleDeleteCategoria = async () => {
  if (modalStore.itemToDelete) {
    await categoriasStore.deleteCategoria(modalStore.itemToDelete);
  }
};

onMounted(() => {
  categoriasStore.fetchCategorias();
});
</script>

<template>
  <div class="font-sans text-[#1C1C1C]">
    <!-- ================= MAIN CONTENT ================= -->
    <main class="w-full">
      <!-- PAGE HEADER -->
      <header
        class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">
            Gestão de Categorias do Acervo
          </h1>
          <p class="text-gray-500 mt-1">
            Administre as categorias dos itens do seu acervo
          </p>
        </div>
        <button
          @click="modalStore.openCreateModal()"
          class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nova Categoria
        </button>
      </header>

      <!-- SEARCH BAR -->
      <div class="mb-6">
        <div class="relative w-full max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar categorias..."
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

      <!-- CATEGORIAS TABLE -->
      <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div v-if="loadingStore.isLoading" class="p-8 text-center">
          <div class="inline-flex items-center gap-2 text-gray-600">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Carregando categorias...
          </div>
        </div>

        <div
          v-else-if="filteredCategorias.length === 0"
          class="p-8 text-center text-gray-500"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p class="text-lg font-medium">Nenhuma categoria encontrada</p>
          <p class="text-sm">
            {{
              searchQuery
                ? "Tente um termo de busca diferente"
                : "Comece adicionando uma nova categoria"
            }}
          </p>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-100">
          <thead class="bg-[#F9FAFB]">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Nome
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Descrição
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-50">
            <tr
              v-for="categoria in filteredCategorias"
              :key="categoria.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ categoria.nome }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 max-w-xs truncate">
                  {{ categoria.descricao || "Sem descrição" }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-mono text-gray-500">#{{ categoria.id }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="handleEditCategoria(categoria)"
                    class="text-[#0F766E] hover:text-[#0F3D3E] transition-colors p-2 rounded-lg hover:bg-[#0F766E]/10"
                    title="Editar categoria"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="modalStore.openConfirmDeleteModal(categoria.id)"
                    class="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Excluir categoria"
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
    </main>

    <!-- CREATE/EDIT MODAL -->
    <div
      v-if="modalStore.createModal"
      class="fixed bg-black/40 backdrop-blur-sm inset-0 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ modalStore.isEditing ? "Editar Categoria" : "Nova Categoria" }}
          </h3>

          <form @submit.prevent="handleCreateCategoria" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Nome da Categoria *</label
              >
              <input
                v-model="modalStore.editingItem.nome"
                type="text"
                placeholder="Ex: Arqueológico, Histórico..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Descrição</label
              >
              <textarea
                v-model="modalStore.editingItem.descricao"
                rows="3"
                placeholder="Descreva brevemente esta categoria..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="modalStore.closeCreateModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!modalStore.editingItem.nome.trim() || loadingStore.isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] border border-transparent rounded-lg hover:bg-[#0A2A2B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ modalStore.isEditing ? "Salvar Alterações" : "Criar Categoria" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div
      v-if="modalStore.confirmDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex-shrink-0">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
          </div>

          <p class="text-sm text-gray-600 mb-6">
            Tem certeza que deseja excluir esta categoria? Esta ação não pode ser
            desfeita.
          </p>

          <div class="flex justify-end gap-3">
            <button
              @click="modalStore.closeConfirmDeleteModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleDeleteCategoria"
              :disabled="loadingStore.isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal backdrop animation */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Modal content animation */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}
</style>
