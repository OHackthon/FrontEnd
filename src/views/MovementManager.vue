<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAcervoStore } from '@/stores/acervos.js'
import SideBar from '@/components/SideBar.vue'
import NavBar from '@/components/NavBar.vue'
import { useReservasStore } from '@/stores/reservas.js'

const reservaStore = useReservasStore()
const acervoStore = useAcervoStore()

// ESTADO DOS FILTROS
const filters = reactive({
  search: '',
  tipo: '',
  status: ''
})

onMounted(async () => {
  await acervoStore.fetchAcervos()
  await reservaStore.fetchReservas()
})

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

// FILTRAGEM DINÂMICA
const reservasFiltradas = computed(() => {
  let data = reservaStore.reservas
  const { search, tipo, status } = filters
  const today = new Date()

  if (search) {
    const s = search.toLowerCase()
    data = data.filter(r =>
      r.item.nome.toLowerCase().includes(s) ||
      (r.item.numero_acervo && r.item.numero_acervo.toString().includes(s))
    )
  }
  if (tipo) {
    data = data.filter(r => r.tipo_movimento === tipo)
  }
  return data
})

function handleSearch(e) {
  filters.search = e.target.value
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 font-sans text-gray-800">
    <SideBar />
    <div class="flex-1 flex flex-col md:ml-64 transition-all duration-300">
      <NavBar />
      <main class="p-6 max-w-7xl mx-auto w-full">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Movimentações</h1>
          <button @click="openModal('create')"
                  class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50 transition-all shadow-sm flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nova
          </button>
        </div>

        <!-- Filtros -->
        <div class="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4">
          <input @input="handleSearch" :value="filters.search" type="text" placeholder="Buscar..."
                 class="border rounded px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
          <select v-model="filters.tipo"
                  class="border rounded px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all">
            <option value="">Todos Tipos</option>
            <option value="INTERNO">Interno</option>
            <option value="EXTERNA">Externo</option>
          </select>
        </div>

        <!-- Tabela filtrada-->
        <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Data
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Item
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Fluxo
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">
                Responsável
              </th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b">Tipo
              </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
            <tr v-if="reservasFiltradas.length < 1" class="text-center"><td colspan="5" class="p-8 text-gray-500">Sem registros.</td></tr>
            <tr v-for="reserva in reservasFiltradas" :key="reserva.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm">{{ formatarData(reserva.data_movimentacao) }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-sm">{{ reserva.item.nome }}</div>
                <div class="text-xs text-gray-500">#{{ reserva.item.numero_acervo }}</div>
              </td>
              <td class="px-6 py-4 text-sm flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-gray-100">{{ reserva.local_origem.nome_local
                  }}</span> →
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium inline-block bg-white border">{{ reserva.local_destino.nome_local
                  }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-sm">{{ reserva.responsavel.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-sm">{{ reserva.tipo_movimento }}</div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>
