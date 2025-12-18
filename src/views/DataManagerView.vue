<script setup>
import { ref, onMounted } from 'vue'
import { useColecoesStore } from '@/stores/colecoes.js'
import { useCategoriasStore } from '@/stores/categorias.js'
import { useLocalizacoesStore } from '@/stores/localizacoes.js'
import { useItensAcervoStore } from '@/stores/itensAcervo.js'
import { useMateriasPrimasStore } from '@/stores/materiasPrimas.js'
import { useSubtiposStore } from '@/stores/subtipos.js'
import { useReservasStore } from '@/stores/reservas.js'
import { useColecionadoresStore } from '@/stores/colecionadores.js'

const colecoesStore = useColecoesStore()
const categoriasStore = useCategoriasStore()
const localizacoesStore = useLocalizacoesStore()
const itensAcervoStore = useItensAcervoStore()
const materiasPrimasStore = useMateriasPrimasStore()
const subtiposStore = useSubtiposStore()
const reservasStore = useReservasStore()
const colecionadoresStore = useColecionadoresStore()

const activeTab = ref('colecoes')
const showModal = ref(false)
const modalMode = ref('create')
const currentModel = ref(null)
const currentItem = ref({})

const models = {
  colecoes: {
    name: 'Coleções',
    icon: '📚',
    store: colecoesStore,
    fetchMethod: 'fetchColecoes',
    createMethod: 'createColecao',
    fields: ['nome_colecao', 'nome_colecionador', 'data_aquisicao']
  },
  categorias: {
    name: 'Categorias',
    icon: '🏷️',
    store: categoriasStore,
    fetchMethod: 'fetchCategorias',
    createMethod: 'createCategoria',
    fields: ['nome_categoria', 'descricao']
  },
  localizacoes: {
    name: 'Localizações',
    icon: '📍',
    store: localizacoesStore,
    fetchMethod: 'fetchLocalizacoes',
    createMethod: 'createLocalizacao',
    fields: ['nome_local', 'cidade', 'bairro']
  },
  itens: {
    name: 'Itens/Artefatos',
    icon: '🏺',
    store: itensAcervoStore,
    fetchMethod: 'fetchItens',
    createMethod: 'createItemAcervo',
    fields: ['numero_acervo', 'titulo', 'colecao']
  },
  materiasPrimas: {
    name: 'Matérias Primas',
    icon: '🪨',
    store: materiasPrimasStore,
    fetchMethod: 'fetchMateriasPrimas',
    createMethod: 'createMateriaPrima',
    fields: ['materia']
  },
  subtipos: {
    name: 'Subtipos',
    icon: '🔖',
    store: subtiposStore,
    fetchMethod: 'fetchSubtipos',
    createMethod: 'createSubtipo',
    fields: ['termo', 'materia_prima']
  },
  reservas: {
    name: 'Reservas/Movimentações',
    icon: '📋',
    store: reservasStore,
    fetchMethod: 'fetchReservas',
    createMethod: 'createReserva',
    fields: ['item', 'tipo_movimento', 'local_destino']
  },
  colecionadores: {
    name: 'Colecionadores',
    icon: '👤',
    store: colecionadoresStore,
    fetchMethod: 'fetchColecionadores',
    createMethod: 'createColecionador',
    fields: ['nome', 'email', 'telefone']
  }
}

onMounted(async () => {
  // Carregar todos os dados
  await Promise.all([
    colecoesStore.fetchColecoes(),
    categoriasStore.fetchCategorias(),
    localizacoesStore.fetchLocalizacoes(),
    itensAcervoStore.fetchItens(),
    materiasPrimasStore.fetchMateriasPrimas(),
    subtiposStore.fetchSubtipos(),
    reservasStore.fetchReservas(),
    colecionadoresStore.fetchColecionadores()
  ])
})

const getItems = () => {
  const model = models[activeTab.value]
  const storeData = model.store
  // Diferentes stores têm diferentes nomes para os arrays
  if (activeTab.value === 'colecoes') return storeData.colecoes || []
  if (activeTab.value === 'categorias') return storeData.categorias || []
  if (activeTab.value === 'localizacoes') return storeData.localizacoes || []
  if (activeTab.value === 'itens') return storeData.itensAcervo || []
  if (activeTab.value === 'materiasPrimas') return storeData.materiasPrimas || []
  if (activeTab.value === 'subtipos') return storeData.subtipos || []
  if (activeTab.value === 'reservas') return storeData.reservas || []
  if (activeTab.value === 'colecionadores') return storeData.colecionadores || []
  return []
}

const openModal = (mode, item = null) => {
  modalMode.value = mode
  currentModel.value = activeTab.value
  
  if (mode === 'create') {
    currentItem.value = {}
  } else {
    currentItem.value = { ...item }
  }
  
  showModal.value = true
}

const saveItem = async () => {
  if (!currentModel.value || !models[currentModel.value]) {
    console.error('Model não selecionado')
    alert('Erro: Modelo não selecionado')
    return
  }

  const model = models[currentModel.value]
  const store = model.store
  
  try {
    if (modalMode.value === 'create') {
      if (typeof store[model.createMethod] === 'function') {
        await store[model.createMethod](currentItem.value)
      } else {
        console.warn(`Método ${model.createMethod} não existe no store`)
        alert('Método de criação não implementado')
        return
      }
    }
    // TODO: Implementar update
    
    showModal.value = false
    
    if (typeof store[model.fetchMethod] === 'function') {
      await store[model.fetchMethod]()
    }
  } catch (error) {
    console.error('Erro ao salvar:', error)
    alert('Erro ao salvar item: ' + error.message)
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-black">Gerenciador de Dados</h1>
      <p class="text-gray-500 mt-1">Adicione e gerencie todas as informações do acervo</p>
    </div>

    <!-- Cards para cada modelo -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="(model, key) in models"
        :key="key"
        @click="activeTab = key"
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-300 transition-all duration-300 cursor-pointer"
        :class="{ 'border-teal-500 bg-teal-50': activeTab === key }"
      >
        <div class="text-4xl mb-3">{{ model.icon }}</div>
        <h3 class="text-lg font-semibold text-gray-900">{{ model.name }}</h3>
        <p class="text-3xl font-bold text-teal-600 mt-2">{{ getItems().length }}</p>
        <button
          @click.stop="openModal('create')"
          class="mt-4 w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          + Adicionar
        </button>
      </div>
    </div>

    <!-- Tabela de itens -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-900">{{ models[activeTab].name }}</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th
                v-for="field in models[activeTab].fields"
                :key="field"
                class="px-6 py-3 text-left text-sm font-semibold text-gray-700"
              >
                {{ field }}
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in getItems()"
              :key="item.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td
                v-for="field in models[activeTab].fields"
                :key="field"
                class="px-6 py-4 text-sm text-gray-700"
              >
                {{ item[field] || '-' }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="openModal('edit', item)"
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  ✏️
                </button>
                <!-- <button class="text-red-600 hover:text-red-800">🗑️</button> -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="getItems().length === 0" class="p-6 text-center text-gray-500">
        Nenhum item registrado
      </div>
    </div>

    <!-- Modal para adicionar/editar -->
    <div v-if="showModal && currentModel && models[currentModel]" class="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-xs flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-bold mb-4">
          {{ modalMode === 'create' ? 'Adicionar' : 'Editar' }} {{ models[currentModel]?.name }}
        </h3>

        <div class="space-y-4">
          <div
            v-for="field in models[currentModel]?.fields"
            :key="field"
          >
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ field }}
            </label>
            <input
              v-model="currentItem[field]"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="showModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="saveItem"
            class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
