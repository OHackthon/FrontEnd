<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de Fundo -->
      <div class=" bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Truque para centralizar o conteúdo do modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Painel do Modal -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Adicionar Novo(a) {{ modalTitle }}
              </h3>
              <div class="mt-2">

                <!-- Formulário de Simulação -->
                <div class="mt-4">
                  <label for="new-item-name" class="block text-sm font-medium text-gray-700">Nome do Novo(a) {{ modalTitle }}</label>
                  <input
                    type="text"
                    id="new-item-name"
                    v-model="newItemName"
                    class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Ex: Novo Acervo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            @click="simulateCreate"
          >
            Criar e Selecionar
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            @click="closeModal"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification.js'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  itemType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])
const notificationStore = useNotificationStore()
const newItemName = ref('')

const modalTitle = computed(() => {
  switch (props.itemType) {
    case 'acervo':
      return 'Acervo'
    case 'colecao':
      return 'Coleção'
    case 'categoria_acervo':
      return 'Categoria do Acervo'
    case 'subtipo':
      return 'Subtipo'
    case 'localizacao_atual':
      return 'Localização'
    default:
      return 'Item'
  }
})

// Limpa o campo de nome ao abrir o modal
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    newItemName.value = ''
  }
})

const closeModal = () => {
  emit('close')
}

const simulateCreate = () => {
  if (!newItemName.value.trim()) {
    notificationStore.showWarning('O nome do item não pode ser vazio.')
    return
  }

  // Simulação de criação:
  // Na implementação real, você faria a chamada à API aqui.
  // Após o sucesso da API, você chamaria o fetch da store correspondente
  // para atualizar a lista de seleção no ArtefatoView.vue.

  const simulatedId = Math.floor(Math.random() * 1000) + 100

  notificationStore.showSuccess(Simulação: Novo(a) ${modalTitle.value} "${newItemName.value}" criado(a) com ID ${simulatedId}.)

  // Emite o evento para o componente pai (ArtefatoView.vue)
  emit('created', {
    type: props.itemType,
    id: simulatedId,
    name: newItemName.value,
  })

  closeModal()
}
</script>

<style scoped>
/* Estilos do modal (Tailwind CSS classes já aplicadas no template) */
</style>