<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();

// --- TOPBAR ---
const isDropdownOpen = ref(false);
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleLogout = () => {
  router.push('/login');
};

// --- CARDS (Apenas 2) ---
const stats = [
  { title: 'Total no Acervo', value: '12,450', subtext: 'Peças catalogadas', isGreen: false },
  { title: 'Usuários Ativos', value: '8', subtext: 'Online agora', isGreen: true },
];

// --- ATIVIDADE (Sem imagens) ---
const activities = ref([
  { id: 1, user: 'Ana', action: 'editou o Artefato', target: '#2024', time: '2 min ago' },
  { id: 2, user: 'Roberto', action: 'adicionou um novo usuário:', target: 'Carla', time: '1 hour ago' },
  { id: 3, user: 'Maria', action: 'exportou o relatório de', target: 'Movimentações', time: '3 horas atrás' },
  { id: 4, user: 'Ana', action: 'registrou novo artefato:', target: 'Ponta de Lança', time: 'Ontem' },
]);

// --- FORMULÁRIO ---
const movementForm = reactive({
  artefatoId: '',
  novaLocalizacao: '',
  notas: ''
});

const submitMovement = () => {
  if (!movementForm.artefatoId || !movementForm.novaLocalizacao) return;
  
  // Adiciona na lista localmente para feedback visual
  activities.value.unshift({
    id: Date.now(),
    user: 'Admin',
    action: 'moveu o artefato',
    target: movementForm.artefatoId,
    time: 'Agora'
  });

  // Limpa
  movementForm.artefatoId = '';
  movementForm.novaLocalizacao = '';
  movementForm.notas = '';
};
</script>

<template>
  <div class="flex-1 flex flex-col h-screen font-sans overflow-hidden">
      
      <header class="flex items-center justify-between px-8 py-5 shrink-0 border-b border-gray-200">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p class="text-sm text-gray-500">Sistema de Gestão de Acervo</p>
        </div>

        <div class="flex items-center gap-6">
          <div class="relative hidden md:block">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              class="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0F3D3E] transition-all"
            />
          </div>

          <div class="relative">
            <button @click="toggleDropdown" class="focus:outline-none flex items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-[#0F3D3E] text-white flex items-center justify-center hover:bg-[#1A4D4E] transition-colors">
                <UserIcon class="w-5 h-5" />
              </div>
            </button>

            <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sair</button>
            </div>
          </div>
        </div>
      </header>
      
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-32"
          >
            <h3 class="text-sm font-medium text-gray-500">{{ stat.title }}</h3>
            <div class="flex items-end justify-between">
              <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
              <span v-if="stat.isGreen" class="flex h-3 w-3 relative">
                 <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Atividade Recente</h2>
            <div class="flex flex-col space-y-6">
              <div v-for="item in activities" :key="item.id" class="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0">
                
                <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ item.user.charAt(0) }}
                </div>

                <div class="flex-1">
                  <p class="text-sm text-gray-700">
                    <span class="font-bold text-gray-900">{{ item.user }}</span> 
                    {{ item.action }} 
                    <span class="font-semibold text-gray-900">{{ item.target }}</span>
                  </p>
                </div>
                <span class="text-xs text-gray-400">{{ item.time }}</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Movimentação Rápida</h2>
            <form @submit.prevent="submitMovement" class="flex flex-col gap-4 flex-1">
              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-500 uppercase">ID Artefato</label>
                <input 
                  v-model="movementForm.artefatoId"
                  type="text" 
                  placeholder="#2024" 
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all"
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-semibold text-gray-500 uppercase">Destino</label>
                <input 
                  v-model="movementForm.novaLocalizacao"
                  type="text" 
                  placeholder="Ex: Reserva Técnica" 
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all"
                />
              </div>

              <div class="space-y-1 flex-1">
                <label class="text-xs font-semibold text-gray-500 uppercase">Notas</label>
                <textarea 
                  v-model="movementForm.notas"
                  rows="3"
                  placeholder="Observações..." 
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] outline-none transition-all resize-none h-full"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="w-full bg-[#0F3D3E] text-white font-medium py-3 rounded-lg hover:bg-[#0a2b2c] transition-all mt-2"
              >
                Registrar
              </button>
            </form>
          </div>

        </div>
      </main>
  </div>
</template>