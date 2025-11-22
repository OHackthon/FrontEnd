<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Squares2X2Icon, 
  BookOpenIcon, 
  ArrowsRightLeftIcon, 
  UsersIcon, 
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();

// --- LÓGICA DA SIDEBAR ---
const menuItems = [
  { name: 'Dashboard', icon: Squares2X2Icon, path: '/' },
  { name: 'Acervo', icon: BookOpenIcon, path: '/acervo' },
  { name: 'Movimentação', icon: ArrowsRightLeftIcon, path: '/movimentacao' },
  { name: 'Usuários', icon: UsersIcon, path: '/usuarios' },
];

const handleLogout = () => {
  // Adicione sua lógica de logout aqui (ex: authStore.logout())
  console.log("Logout efetuado");
  router.push('/login');
};

// --- LÓGICA DO TOPBAR ---
const isDropdownOpen = ref(false);
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// --- DADOS DOS CARDS (STATS) ---
const stats = [
  { title: 'Total no Acervo', value: '12,450', subtext: null, isGreen: false },
  { title: 'Itens em Restauro', value: '34', subtext: null, isGreen: false },
  { title: 'Novos Registros', value: '12', subtext: '+ this week', isGreen: true },
  { title: 'Usuários Ativos', value: '8', subtext: null, isGreen: false },
];

// --- DADOS DA ATIVIDADE RECENTE ---
const activities = ref([
  { id: 1, user: 'Ana', action: 'editou o Artefato', target: '#2024', time: '2 min ago', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, user: 'Roberto', action: 'adicionou um novo usuário:', target: 'Carla', time: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 3, user: 'Maria', action: 'exportou o relatório de', target: 'Movimentações', time: '3 hours ago', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 4, user: 'Ana', action: 'registrou novo artefato:', target: 'Ponta de Lança Lítica', time: 'Yesterday', avatar: 'https://i.pravatar.cc/150?img=5' },
]);

// --- LÓGICA DO FORMULÁRIO DE MOVIMENTAÇÃO ---
const movementForm = reactive({
  artefatoId: '',
  novaLocalizacao: '',
  notas: ''
});

const submitMovement = () => {
  if (!movementForm.artefatoId || !movementForm.novaLocalizacao) {
    alert("Preencha o ID e a Localização");
    return;
  }
  
  // Aqui você enviaria para o Backend/Supabase
  console.log('Enviando movimentação:', { ...movementForm });
  
  // Adiciona uma atividade fake para feedback visual imediato
  activities.value.unshift({
    id: Date.now(),
    user: 'Você',
    action: 'moveu o artefato',
    target: movementForm.artefatoId,
    time: 'Just now',
    avatar: 'https://i.pravatar.cc/150?img=11'
  });

  // Limpa o formulário
  movementForm.artefatoId = '';
  movementForm.novaLocalizacao = '';
  movementForm.notas = '';
  
  alert('Movimentação registrada com sucesso!');
};
</script>

<template>
  <div class="flex h-screen bg-[#FDFBF7] font-sans overflow-hidden">
    
    <aside class="flex flex-col w-64 h-full bg-[#0F3D3E] text-white shadow-xl z-50">
      <div class="flex items-center gap-3 p-6 border-b border-white/10">
        <div class="w-10 h-10 rounded-full bg-[#ECE5D5] flex items-center justify-center text-[#0F3D3E] font-bold text-lg shrink-0">
          M
        </div>
        <div class="flex flex-col overflow-hidden">
          <span class="text-sm font-bold leading-tight whitespace-nowrap">Museu do<br>Sambaqui</span>
          <span class="text-xs text-gray-400">Admin System</span>
        </div>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <router-link 
          v-for="item in menuItems" 
          :key="item.name" 
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group"
          :class="route.path === item.path ? 'bg-[#1A4D4E] text-white shadow-md' : 'text-gray-300 hover:bg-[#1A4D4E] hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="p-4 border-t border-white/10">
        <button 
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-300 hover:text-white hover:bg-[#1A4D4E] rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon class="w-5 h-5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <header class="flex items-center justify-between px-8 py-5 bg-[#FDFBF7] shrink-0">
        <h1 class="text-2xl font-bold text-gray-800 truncate">Welcome, Administrator</h1>

        <div class="flex items-center gap-6">
          <div class="relative hidden md:block">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              class="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] transition-all"
            />
          </div>

          <div class="relative">
            <button @click="toggleDropdown" class="focus:outline-none flex items-center">
              <img 
                src="https://i.pravatar.cc/150?img=11" 
                alt="Admin" 
                class="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:ring-2 hover:ring-[#0F3D3E] transition-all cursor-pointer"
              />
            </button>

            <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Perfil</a>
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
            </div>
          </div>
        </div>
      </header>
      
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 pt-2">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-40"
          >
            <h3 class="text-sm font-medium text-gray-600">{{ stat.title }}</h3>
            <div>
              <p class="text-4xl font-bold text-gray-900 mb-2">{{ stat.value }}</p>
              <span 
                v-if="stat.subtext" 
                class="text-sm font-medium"
                :class="stat.isGreen ? 'text-green-600' : 'text-gray-500'"
              >
                {{ stat.subtext }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Atividade Recente</h2>
            <div class="flex flex-col space-y-6">
              <div v-for="item in activities" :key="item.id" class="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0 last:border-none">
                <img :src="item.avatar" :alt="item.user" class="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-700 leading-relaxed">
                    <span class="font-bold text-gray-900">{{ item.user }}</span> 
                    {{ item.action }} 
                    <span class="font-semibold text-gray-900">{{ item.target }}</span>
                  </p>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ item.time }}</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Movimentação Rápida</h2>
            <form @submit.prevent="submitMovement" class="flex flex-col gap-5 flex-1">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">ID do Artefato</label>
                <input 
                  v-model="movementForm.artefatoId"
                  type="text" 
                  placeholder="Ex: #2024" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nova Localização</label>
                <input 
                  v-model="movementForm.novaLocalizacao"
                  type="text" 
                  placeholder="Ex: Sala de Restauro B" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea 
                  v-model="movementForm.notas"
                  rows="3"
                  placeholder="Adicione uma observação..." 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all resize-none placeholder-gray-400"
                ></textarea>
              </div>

              <button 
                type="submit" 
                class="w-full bg-[#0F3D3E] text-white font-medium py-3 rounded-lg hover:bg-[#0a2b2c] transition-colors shadow-lg shadow-[#0F3D3E]/20 active:transform active:scale-[0.98] mt-auto"
              >
                Registrar Movimentação
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>