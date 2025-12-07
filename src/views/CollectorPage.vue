<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useColecoesStore } from '@/stores/colecoes'
const colecaoStore = useColecoesStore()
onMounted( async() => {
  await colecaoStore.fetchColecoes()
})
const searchCollectionQuery = ref('')
const showCollectionModal = ref(false)
const modalMode = ref('create') 
const currentItem = ref({}) 
const filteredCollections = computed(() => {
  const q = searchCollectionQuery.value.toLowerCase()
  return colecaoStore.colecoes.filter(c =>
    c.nome_colecao?.toLowerCase().includes(q)
  )
})
const openCollectionModal = (mode, item = null) => {
  modalMode.value = mode
  if (mode === 'create') {
    currentItem.value = {
      id: null,
      nome_colecao: '',
      nome_colecionador: '',
      descricao_origem: '',
      data_aquisicao: null
    }
  } else {
    currentItem.value = { ...item }
  }
  showCollectionModal.value = true
}
const saveCollection = async () => {
  if (modalMode.value === 'create') {
    await colecaoStore.createColecao(currentItem.value)
  } else {
    await colecaoStore.updateColecao(currentItem.value)
  }
  showCollectionModal.value = false
}
const deleteCollection = (id) => {
  if (confirm('Tem certeza que deseja excluir esta coleção? ATENÇÃO: Todos os itens vinculados a ela também serão excluídos permanentemente.')) {
    colecaoStore.deleteColecao(id)
  }
}
function formatarData(dataIso) {
  if (!dataIso) return ''
  const data = new Date(dataIso)
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
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
        <div class="flex gap-3">
          <button @click="openCollectionModal('create')"
                  class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Nova Coleção
          </button>
        </div>
      </header>
      <section class="mb-12">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-[#1C1C1C]">Lista de Coleções</h2>
          <div class="relative w-72">
            <input
              v-model="searchCollectionQuery"
              type="text"
              placeholder="Pesquisar coleções..."
              class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Coleção
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Colecionador(es)
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Criação
              </th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
            <tr v-for="col in filteredCollections" :key="col.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ col.nome_colecao }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="block">{{ col.nome_colecionador || 'Sem colecionador' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatarData(col.data_registro_sistema) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-3">
                  <button @click="openCollectionModal('edit', col)"
                          class="text-[#0F766E] hover:text-[#0F3D3E] transition-colors p-2 rounded-lg hover:bg-[#0F766E]/10" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="deleteCollection(col.id)" class="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Excluir">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    <div v-if="showCollectionModal"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">{{ modalMode === 'create' ? 'Nova Coleção' : 'Editar Coleção'
            }}</h3>
          <button @click="showCollectionModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Coleção</label>
            <input v-model="currentItem.nome_colecao" type="text"
                   class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Colecionador</label>
            <input v-model="currentItem.nome_colecionador" type="text"
                   class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input v-model="currentItem.descricao" type="text"
                   class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showCollectionModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar
          </button>
          <button @click="saveCollection"
                  class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">
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