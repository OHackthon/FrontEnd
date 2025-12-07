<script setup>
import { onMounted, computed } from 'vue'
import { useItensAcervoStore } from '@/stores/itensAcervo.js'
import { useColecoesStore } from '@/stores/colecoes.js'
import { useReservasStore } from '@/stores/reservas.js'
import { useCategoriasStore } from '@/stores/categorias.js'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement)

const reservasStore = useReservasStore()
const colecoesStore = useColecoesStore()
const itensAcervoStore = useItensAcervoStore()
const categoriasStore = useCategoriasStore()

onMounted(async () => {
  await colecoesStore.fetchColecoes()
  await itensAcervoStore.fetchItens()
  await reservasStore.fetchReservas()
  await categoriasStore.fetchCategorias()
})

// --- Chart Data Computations ---

const collectionChartData = computed(() => {
  const counts = {}
  itensAcervoStore.itensAcervo.forEach(item => {
    const name = item.colecao?.nome_colecao || 'Sem Coleção'
    counts[name] = (counts[name] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Itens por Coleção',
        backgroundColor: '#0F766E',
        data: Object.values(counts)
      }
    ]
  }
})

const categoryChartData = computed(() => {
  const counts = {}
  itensAcervoStore.itensAcervo.forEach(item => {
    const name = item.categoria_acervo?.nome || 'Sem Categoria'
    counts[name] = (counts[name] || 0) + 1
  })

  return {
    labels: Object.keys(counts),
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#f87979', '#0F766E'],
        data: Object.values(counts)
      }
    ]
  }
})

const groupByMonth = (items, dateField) => {
  const counts = {}
  items.forEach(item => {
    if (!item[dateField]) return
    const date = new Date(item[dateField])
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    counts[key] = (counts[key] || 0) + 1
  })

  const sortedKeys = Object.keys(counts).sort()

  return {
    labels: sortedKeys.map(k => {
      const [year, month] = k.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
    }),
    data: sortedKeys.map(k => counts[k])
  }
}

const collectionsOverTimeChartData = computed(() => {
  const { labels, data } = groupByMonth(colecoesStore.colecoes, 'data_registro')
  return {
    labels,
    datasets: [
      {
        label: 'Novas Coleções',
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        data,
        fill: false,
        tension: 0.1
      }
    ]
  }
})

const movementsOverTimeChartData = computed(() => {
  const { labels, data } = groupByMonth(reservasStore.reservas, 'data_movimentacao')
  return {
    labels,
    datasets: [
      {
        label: 'Movimentações',
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
        data,
        fill: false,
        tension: 0.1
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
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
  <div>
      <div>
        <h1 class="text-3xl font-bold text-black">Painel de administração</h1>
        <p class="text-gray-500 mt-1">Administre o acervo</p>
      </div>

      <!-- Main Content (Com Scroll Interno) -->
      <main class="flex-1 pt-2 scroll-smooth">

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-40"
          >
            <h3 class="text-sm font-medium text-gray-600">Itens no acervo</h3>
            <div>
              <p class="text-4xl font-bold text-gray-900 mb-2">{{ itensAcervoStore.itensAcervo.length }}</p>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-40"
          >
            <h3 class="text-sm font-medium text-gray-600">Total de coleções</h3>
            <div>
              <p class="text-4xl font-bold text-gray-900 mb-2">{{ colecoesStore.colecoes.length }}</p>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-40"
          >
            <h3 class="text-sm font-medium text-gray-600">Categorias</h3>
            <div>
              <p class="text-4xl font-bold text-gray-900 mb-2">{{ categoriasStore.categorias.length }}</p>
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-40"
          >
            <h3 class="text-sm font-medium text-gray-600">Reservas Ativas</h3>
            <div>
              <p class="text-4xl font-bold text-gray-900 mb-2">{{ reservasStore.reservas.length }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Itens por Coleção</h3>
                <div class="h-64">
                    <Bar :data="collectionChartData" :options="chartOptions" />
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Distribuição por Categoria</h3>
                <div class="h-64">
                    <Doughnut :data="categoryChartData" :options="chartOptions" />
                </div>
            </div>
        </div>

        <!-- Line Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Crescimento de Coleções</h3>
                <div class="h-64">
                    <Line :data="collectionsOverTimeChartData" :options="chartOptions" />
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Movimentações ao Longo do Tempo</h3>
                <div class="h-64">
                    <Line :data="movementsOverTimeChartData" :options="chartOptions" />
                </div>
            </div>
        </div>

        <!-- Split View Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Atividade Recente -->
          <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Atividade Recente</h2>
            <div class="flex flex-col space-y-6">
              <div
                v-for="reserva in reservasStore.reservas"
                :key="reserva.id"
                class="flex items-center gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0 last:border-none"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-700 leading-relaxed">
          <span class="block mb-1">
            <span class="text-gray-500">Responsável:</span>
            <span class="font-bold text-gray-900 ml-1">
              {{ reserva.responsavel_data?.first_name }} {{ reserva.responsavel_data?.last_name }}
            </span>
          </span>
                    <span class="block mb-1">
            <span class="text-gray-500">Movimento:</span>
            <span class="text-gray-800 font-semibold ml-1">{{ reserva.tipo_movimento }}</span>
          </span>
                    <span class="block mb-1">
            <span class="text-gray-500">Origem:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ reserva.local_origem_data.nome_local }}</span>
          </span>
                    <span class="block">
            <span class="text-gray-500">Destino:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ reserva.local_destino_data.nome_local }}</span>
          </span>
                  </p>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap mt-1">
        {{ formatarData(reserva.data_movimentacao) }}
      </span>
              </div>
            </div>
          </div>
        </div>
      </main>
  </div>
</template>
