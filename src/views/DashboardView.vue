<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideBar from '../components/SideBar.vue' // Ajuste o caminho conforme sua estrutura real
import { useItensAcervoStore } from '@/stores/itensAcervo.js'
import { useColecoesStore } from '@/stores/colecoes.js'
import { useReservasStore } from '@/stores/reservas.js'

const reservasStore = useReservasStore()
const colecoesStore = useColecoesStore()
const itensAcervoStore = useItensAcervoStore()

onMounted(async () => {
  await colecoesStore.fetchColecoes()
  await itensAcervoStore.fetchItens()
  await reservasStore.fetchReservas()
})

const router = useRouter()

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
  <div class="flex h-full bg-gray-50 font-sans">

    <SideBar />
    <div class="w-full h-full flex-1 py-8 px-6 flex flex-col min-w-0 md:ml-64 relative">

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
            <span class="font-bold text-gray-900 ml-1">{{ reserva.responsavel.name }}</span>
          </span>
                    <span class="block mb-1">
            <span class="text-gray-500">Movimento:</span>
            <span class="text-gray-800 font-semibold ml-1">{{ reserva.tipo_movimento }}</span>
          </span>
                    <span class="block mb-1">
            <span class="text-gray-500">Origem:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ reserva.local_origem.nome_local }}</span>
          </span>
                    <span class="block">
            <span class="text-gray-500">Destino:</span>
            <span class="font-semibold text-gray-900 ml-1">{{ reserva.local_destino.nome_local }}</span>
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
  </div>
</template>