<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/stores/auth'
import UsersApi from '@/services/usersApi'

const authStore = useAuth()
const usersApi = new UsersApi()
const users = ref([])
const loading = ref(false)
const error = ref(null)

// Modal State
const showModal = ref(false)
const showDeleteModal = ref(false)
const showInfoModal = ref(false)
const infoMessage = ref('')
const userToDelete = ref(null)
const modalMode = ref('create') // 'create' | 'edit'
const currentUser = ref({
  id: null,
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  is_staff: false
})

const isManager = computed(() => {
  return authStore.user?.is_staff || authStore.user?.is_superuser
})

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await usersApi.fetchUsers()
  } catch (e) {
    console.error(e)
    error.value = "Erro ao carregar usuários. Verifique se você tem permissão."
  } finally {
    loading.value = false
  }
}

const openModal = (mode, user = null) => {
  modalMode.value = mode
  if (mode === 'create') {
    currentUser.value = {
      id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_staff: false
    }
  } else {
    currentUser.value = { ...user, password: '' } // Don't fill password on edit
  }
  showModal.value = true
}

const saveUser = async () => {
  try {
    if (modalMode.value === 'create') {
      await usersApi.createUser(currentUser.value)
    } else {
      const payload = { ...currentUser.value }
      if (!payload.password) delete payload.password // Don't send empty password
      await usersApi.updateUser(payload.id, payload)
    }
    showModal.value = false
    await fetchUsers()
  } catch (e) {
    console.error(e)
    alert("Erro ao salvar usuário. Verifique os dados.")
  }
}

const confirmDeleteUser = (user) => {
  if (user.username === 'admin') {
    infoMessage.value = "Não é possível excluir o administrador principal."
    showInfoModal.value = true
    return
  }
  if (user.id === authStore.user?.id) {
    infoMessage.value = "Você não pode excluir seu próprio usuário."
    showInfoModal.value = true
    return
  }
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    await usersApi.deleteUser(userToDelete.value.id)
    await fetchUsers()
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (e) {
    console.error(e)
    alert("Erro ao excluir usuário.")
  }
}

onMounted(async () => {
  if (isManager.value) {
    await fetchUsers()
  }
})
</script>

<template>
  <div class="font-sans text-[#1C1C1C]">
    <main class="w-full">
      <header class="flex flex-col md:flex-row md:items-start md:justify-between mb-10 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-black tracking-tight">
            Gerenciamento de Usuários
          </h1>
          <p class="text-gray-500 mt-1">Gerencie o acesso dos funcionários</p>
        </div>
        <div v-if="isManager" class="flex gap-3">
          <button
            @click="openModal('create')"
            class="bg-[#0F3D3E] hover:bg-[#0A2A2B] text-white font-semibold py-2 px-4 rounded shadow-sm text-sm transition flex items-center gap-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
            </svg>
            Novo Usuário
          </button>
        </div>
      </header>

      <div v-if="!isManager" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              Você não tem permissão para gerenciar usuários.
            </p>
          </div>
        </div>
      </div>

      <section v-else class="mb-12">
        <div class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div v-if="loading" class="p-8 text-center text-gray-500">Carregando usuários...</div>
            <table v-else class="min-w-full divide-y divide-gray-100">
            <thead class="bg-[#F9FAFB]">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.first_name }} {{ user.last_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span v-if="user.is_superuser" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Owner
                    </span>
                    <span v-else :class="user.is_staff ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ user.is_staff ? 'Gerente' : 'Funcionário' }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-3">
                    <button @click="openModal('edit', user)" class="text-[#0F766E] hover:text-[#0F3D3E] transition-colors p-2 rounded-lg hover:bg-[#0F766E]/10" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="confirmDeleteUser(user)" class="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50" title="Excluir">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

    <!-- INFO MODAL -->
    <div v-if="showInfoModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="p-6 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aviso</h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ infoMessage }}
          </p>
          <div class="flex justify-center">
            <button @click="showInfoModal = false" class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] rounded-lg hover:bg-[#0A2A2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]">
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div class="p-6 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Excluir Usuário</h3>
          <p class="text-sm text-gray-500 mb-6">
            Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.username }}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div class="flex justify-center gap-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]">
              Cancelar
            </button>
            <button @click="deleteUser" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Sim, excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#1C1C1C]">
            {{ modalMode === 'create' ? 'Novo Usuário' : 'Editar Usuário' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuário (Login)</label>
            <input v-model="currentUser.username" type="text" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="currentUser.email" type="email" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input v-model="currentUser.first_name" type="text" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
              <input v-model="currentUser.last_name" type="text" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Senha {{ modalMode === 'edit' ? '(Deixe em branco para não alterar)' : '' }}
            </label>
            <input v-model="currentUser.password" type="password" class="w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" :value="false" v-model="currentUser.is_staff" class="w-4 h-4 text-[#0F766E] border-gray-300 focus:ring-[#0F766E]" />
                <span class="text-sm text-gray-700">Funcionário</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" :value="true" v-model="currentUser.is_staff" class="w-4 h-4 text-[#0F766E] border-gray-300 focus:ring-[#0F766E]" />
                <span class="text-sm text-gray-700">Gerente</span>
              </label>
            </div>
          </div>

        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">
            Cancelar
          </button>
          <button @click="saveUser" class="px-4 py-2 text-sm font-medium text-white bg-[#0F3D3E] hover:bg-[#0A2A2B] rounded-lg transition">
            Salvar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
