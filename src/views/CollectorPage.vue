<script setup>
import { ref, reactive, computed } from 'vue';
import Sidebar from '../components/SideBar.vue'; // Importando o novo componente

// --- MOCK DATA: COLEÇÕES ---
const collections = ref([
  { 
    id: 1, 
    name: 'Artefatos Líticos', 
    collectors: ['Ana Beatriz Lemos'], 
    itemsCount: 152, 
    createdAt: '2023-03-15' 
  },
  { 
    id: 2, 
    name: 'Cerâmica TupiGuarani', 
    collectors: ['Carlos Eduardo Vieira'], 
    itemsCount: 89, 
    createdAt: '2022-11-20' 
  },
  { 
    id: 3, 
    name: 'Ferramentas de Pesca', 
    collectors: ['Mariana Costa'], 
    itemsCount: 210, 
    createdAt: '2024-01-05' 
  }
]);

// --- MOCK DATA: COLECIONADORES ---
const collectors = ref([
  { 
    id: 1, 
    name: 'Ana Beatriz Lemos', 
    description: 'Arqueóloga especialista em período pré-colonial.', 
    collectionsCount: 1, 
    totalItems: 152 
  },
  { 
    id: 2, 
    name: 'Carlos Eduardo Vieira', 
    description: 'Historiador e pesquisador de culturas indígenas.', 
    collectionsCount: 1, 
    totalItems: 89 
  },
  { 
    id: 3, 
    name: 'Mariana Costa', 
    description: 'Antropóloga focada em tecnologias ancestrais.', 
    collectionsCount: 1, 
    totalItems: 210 
  }
]);

// --- ESTADO DA UI ---
const searchCollectionQuery = ref('');
const searchCollectorQuery = ref('');

// Modais
const showCollectionModal = ref(false);
const showCollectorModal = ref(false);
const showLinkModal = ref(false);
const modalMode = ref('create'); // 'create' | 'edit'
const currentItem = ref({}); // Item sendo editado/vinculado

// --- LÓGICA COMPUTADA (FILTROS) ---
const filteredCollections = computed(() => {
  const q = searchCollectionQuery.value.toLowerCase();
  return collections.value.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.collectors.some(col => col.toLowerCase().includes(q))
  );
});

const filteredCollectors = computed(() => {
  const q = searchCollectorQuery.value.toLowerCase();
  return collectors.value.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.description.toLowerCase().includes(q)
  );
});

// --- AÇÕES (CRUD MOCK) ---

// 1. Coleções
const openCollectionModal = (mode, item = null) => {
  modalMode.value = mode;
  if (mode === 'create') {
    currentItem.value = { name: '', collectors: [], itemsCount: 0, createdAt: new Date().toISOString().split('T')[0] };
  } else {
    currentItem.value = { ...item }; // Clone
  }
  showCollectionModal.value = true;
};

const saveCollection = () => {
  if (modalMode.value === 'create') {
    const newId = Math.max(...collections.value.map(c => c.id)) + 1;
    collections.value.push({ ...currentItem.value, id: newId, collectors: ['Sem colecionador'] });
  } else {
    const index = collections.value.findIndex(c => c.id === currentItem.value.id);
    if (index !== -1) collections.value[index] = { ...currentItem.value };
  }
  showCollectionModal.value = false;
};

const deleteCollection = (id) => {
  if(confirm('Tem certeza que deseja excluir esta coleção?')) {
    collections.value = collections.value.filter(c => c.id !== id);
  }
};

// 2. Colecionadores
const openCollectorModal = (mode, item = null) => {
  modalMode.value = mode;
  if (mode === 'create') {
    currentItem.value = { name: '', description: '', collectionsCount: 0, totalItems: 0 };
  } else {
    currentItem.value = { ...item };
  }
  showCollectorModal.value = true;
};

const saveCollector = () => {
  if (modalMode.value === 'create') {
    const newId = Math.max(...collectors.value.map(c => c.id)) + 1;
    collectors.value.push({ ...currentItem.value, id: newId });
  } else {
    const index = collectors.value.findIndex(c => c.id === currentItem.value.id);
    if (index !== -1) collectors.value[index] = { ...currentItem.value };
  }
  showCollectorModal.value = false;
};

const deleteCollector = (id) => {
  if(confirm('Tem certeza que deseja remover este colecionador?')) {
    collectors.value = collectors.value.filter(c => c.id !== id);
  }
};

// 3. Vinculação
const openLinkModal = (item) => {
  currentItem.value = item;
  showLinkModal.value = true;
};

</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans text-[#1C1C1C]">
    
    <!-- ================= SIDEBAR (Componente) ================= -->
    <Sidebar active-page="gestao" />

    <!-- ================= MAIN CONTENT ================= -->
    <main class="flex-1 py-8 px-6 md:ml-64 w-full">
      
      <!-- PAGE HEADER -->
      <header class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">Gestão de Coleções e Colecionadores</h1>
          <p class="text-gray-500 mt-1">Administre coleções, colecionadores e suas associações</p>
        </div>
        <div class="flex gap-3">
          <button @click="openCollectionModal('create')" class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
            Nova Coleção
          </button>
          <button @click="openCollectorModal('create')" class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
            Novo Colecionador
          </button>
        </div>
      </header>

      <!-- SECTION 1: LISTA DE COLEÇÕES -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-[#1C1C1C]">Lista de Coleções</h2>
          
          <!-- Search Bar -->
          <div class="relative w-72">
            <input 
              v-model="searchCollectionQuery"
              type="text" 
              placeholder="Pesquisar coleções..." 
              class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        <!-- Tabela Coleções -->
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Coleção</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Colecionador(es)</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Itens</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Criação</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <tr v-for="col in filteredCollections" :key="col.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ col.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-for="(c, idx) in col.collectors" :key="idx" class="block">{{ c }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ col.itemsCount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ col.createdAt }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-3">
                    <!-- Editar -->
                    <button @click="openCollectionModal('edit', col)" class="text-gray-400 hover:text-[#0F766E] transition" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                     
                    <!-- Excluir -->
                    <button @click="deleteCollection(col.id)" class="text-gray-400 hover:text-red-500 transition" title="Excluir">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION 2: LISTA DE COLECIONADORES -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-[#1C1C1C]">Lista de Colecionadores</h2>
          
          <!-- Search Bar -->
          <div class="relative w-72">
            <input 
              v-model="searchCollectorQuery"
              type="text" 
              placeholder="Pesquisar colecionadores..." 
              class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] shadow-sm"
            >
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        <!-- Tabela Colecionadores -->
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Coleções<br>Associadas</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total de<br>Itens</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <tr v-for="col in filteredCollectors" :key="col.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ col.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ col.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{{ col.collectionsCount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{{ col.totalItems }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-3">
                    <!-- Editar -->
                    <button @click="openCollectorModal('edit', col)" class="text-gray-400 hover:text-[#0F766E] transition" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    
                    <!-- Excluir -->
                    <button @click="deleteCollector(col.id)" class="text-gray-400 hover:text-red-500 transition" title="Excluir">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>

    <!-- ================= MODAIS ================= -->
    
    <!-- Modal Coleção -->
    <div v-if="showCollectionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">{{ modalMode === 'create' ? 'Nova Coleção' : 'Editar Coleção' }}</h3>
          <button @click="showCollectionModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Coleção</label>
            <input v-model="currentItem.name" type="text" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
            <input v-model="currentItem.createdAt" type="date" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showCollectionModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
          <button @click="saveCollection" class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal Colecionador -->
    <div v-if="showCollectorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">{{ modalMode === 'create' ? 'Novo Colecionador' : 'Editar Colecionador' }}</h3>
          <button @click="showCollectorModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input v-model="currentItem.name" type="text" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea v-model="currentItem.description" rows="3" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"></textarea>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showCollectorModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
          <button @click="saveCollector" class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal Vinculação -->
    <div v-if="showLinkModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">Vincular Colecionador</h3>
          <button @click="showLinkModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">Selecione um colecionador para vincular à coleção <strong>{{ currentItem.name }}</strong>:</p>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label v-for="col in collectors" :key="col.id" class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-100">
              <input type="radio" name="collector" :value="col.name" class="text-[#0F766E] focus:ring-[#0F766E]">
              <span class="ml-3 text-sm text-gray-700">{{ col.name }}</span>
            </label>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showLinkModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
          <button @click="showLinkModal = false" class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">Vincular</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Animação suave para modais */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>