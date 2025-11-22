<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Sidebar from '../components/SideBar.vue' // Importando o novo componente
import { useColecoesStore } from '@/stores/colecoes'
import { useColecionadoresStore } from '@/stores/colecionadores.js'

const colecionadorStore = useColecionadoresStore()
const colecaoStore = useColecoesStore()

onMounted( async() => {
  await colecaoStore.fetchColecoes()
  await colecionadorStore.fetchColecionadores()
})

// --- ESTADO DA UI ---
const searchCollectionQuery = ref('')
const searchCollectorQuery = ref('')

// Modais
const showCollectionModal = ref(false)
const showCollectorModal = ref(false)
const showLinkModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const currentItem = ref({}) // Item sendo editado/vinculado

// --- LÓGICA COMPUTADA (FILTROS) ---
const filteredCollections = computed(() => {
  const q = searchCollectionQuery.value.toLowerCase()
  return colecaoStore.colecoes.filter(c =>
    c.nome_colecao.toLowerCase().includes(q)
  )
})

const filteredCollectors = computed(() => {
  const q = searchCollectorQuery.value.toLowerCase()
  return colecionadorStore.colecionadores.filter(c =>
    c.nome.toLowerCase().includes(q) ||
    c.contato.toLowerCase().includes(q)
  )
})

// --- AÇÕES (CRUD MOCK) ---

// 1. Coleções
const openCollectionModal = (mode, item = null) => {
  modalMode.value = mode
  if (mode === 'create') {
    currentItem.value = {
      id: null,
      nome_colecao: '',
      colecionador: null, // Pode ser um objeto vazio ou id, depende do form
      descricao: '',
      data_registro: null
    }
  } else {
    currentItem.value = { ...item }
  }
  showCollectionModal.value = true
}


const saveCollection = async () => {
  if (modalMode.value === 'create') {
    await colecaoStore.createColecao(currentItem.value)
    console.log(currentItem.value)
  } else {
    await colecaoStore.updateColecao(currentItem.value)
  }
  showCollectionModal.value = false
}


const deleteCollection = (id) => {
  if (confirm('Tem certeza que deseja excluir esta coleção?')) {
    colecaoStore.deleteColecao(id)
  }
}

// 2. Colecionadores
const openCollectorModal = (mode, item = null) => {
  modalMode.value = mode
  if (mode === 'create') {
    currentItem.value = {
      id: null,
      nome: '',
      contato: '',
    }
  } else {
    currentItem.value = { ...item }
  }
  showCollectorModal.value = true
}

const saveCollector = async () => {
  if (modalMode.value === 'create') {
    await colecionadorStore.createColecionador(currentItem.value)
  } else {
    await colecionadorStore.updateColecionador(currentItem.value)
  }
  showCollectorModal.value = false
}

const deleteCollector = (id) => {
  if (confirm('Tem certeza que deseja excluir esta coleção?')) {
    colecionadorStore.deleteColecionador(id)
  }
}

// 3. Vinculação
const openLinkModal = (item) => {
  currentItem.value = item
  showLinkModal.value = true
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
  <div class="flex min-h-screen bg-gray-100 font-sans text-[#1C1C1C]">

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
          <button @click="openCollectionModal('create')"
                  class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Nova Coleção
          </button>
          <button @click="openCollectorModal('create')"
                  class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
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
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Tabela Coleções -->
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Coleção
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Colecionador(es)
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Itens</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data de Criação
              </th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
            <tr v-for="col in filteredCollections" :key="col.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ col.nome_colecao }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="block">{{ col.colecionador_data.nome }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ col.quantidade_itens }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatarData(col.data_registro) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-3">
                  <!-- Editar -->
                  <button @click="openCollectionModal('edit', col)"
                          class="text-gray-400 hover:text-[#0F766E] transition" title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <!-- Excluir -->
                  <button @click="deleteCollection(col.id)" class="text-gray-400 hover:text-red-500 transition"
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
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Tabela Colecionadores -->
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo
              </th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contato</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Coleções<br>Associadas
              </th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
            <tr v-for="col in filteredCollectors" :key="col.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ col.nome }}</td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ col.contato }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {{ colecaoStore.findColecoesByColecionador(col.nome) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-3">
                  <!-- Editar -->
                  <button @click="openCollectorModal('edit', col)" class="text-gray-400 hover:text-[#0F766E] transition"
                          title="Editar">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <!-- Excluir -->
                  <button @click="deleteCollector(col.id)" class="text-gray-400 hover:text-red-500 transition"
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

    <!-- ================= MODAIS ================= -->

    <!-- Modal Coleção -->
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Colecionador</label>
            <select v-model="currentItem.colecionador"
                    class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
              <option disabled value="">Selecione o colecionador</option>
              <option v-for="c in colecionadorStore.colecionadores" :key="c.id" :value="c.id">
                {{ c.nome }}
              </option>
            </select>
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

    <!-- Modal Colecionador -->
    <div v-if="showCollectorModal"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">
            {{ modalMode === 'create' ? 'Novo Colecionador' : 'Editar Colecionador' }}</h3>
          <button @click="showCollectorModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input v-model="currentItem.nome" type="text"
                   class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contato</label>
            <textarea v-model="currentItem.contato" rows="3"
                      class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"></textarea>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showCollectorModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar
          </button>
          <button @click="saveCollector"
                  class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">
            Salvar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Vinculação -->
    <div v-if="showLinkModal"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">Vincular Colecionador</h3>
          <button @click="showLinkModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">Selecione um colecionador para vincular à coleção
            <strong>{{ currentItem.name }}</strong>:</p>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <label v-for="col in collectors" :key="col.id"
                   class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer border border-transparent hover:border-gray-100">
              <input type="radio" name="collector" :value="col.name" class="text-[#0F766E] focus:ring-[#0F766E]">
              <span class="ml-3 text-sm text-gray-700">{{ col.name }}</span>
            </label>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showLinkModal = false"
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancelar
          </button>
          <button @click="showLinkModal = false"
                  class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">
            Vincular
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Animação suave para modais */
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