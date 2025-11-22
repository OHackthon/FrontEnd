<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SideBar from '../components/SideBar.vue'; // Ajuste o caminho conforme sua estrutura real

const route = useRoute();
const router = useRouter();

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
  { id: 1, user: 'Ana', action: 'editou o Artefato', target: '#2024', time: '2 min ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
  { id: 2, user: 'Roberto', action: 'adicionou um novo usuário:', target: 'Carla', time: '1 hour ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto' },
  { id: 3, user: 'Maria', action: 'exportou o relatório de', target: 'Movimentações', time: '3 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { id: 4, user: 'Ana', action: 'registrou novo artefato:', target: 'Ponta de Lança Lítica', time: 'Yesterday', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana2' },
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  });

  // Limpa o formulário
  movementForm.artefatoId = '';
  movementForm.novaLocalizacao = '';
  movementForm.notas = '';
  
  alert('Movimentação registrada com sucesso!');
};
</script>

<template>
  <!-- Wrapper Principal: Flex Row + Altura Total -->
  <div class="flex h-screen bg-[#FDFBF7] font-sans overflow-hidden">
    
    <!-- 1. Sidebar (Fixa à esquerda) -->
    <!-- Importante: Como a Sidebar tem 'fixed', ela não ocupa espaço no fluxo flex nativo.
         Por isso, precisamos adicionar margem no conteúdo ao lado. -->
    <SideBar /> 
    
    <!-- 2. Wrapper de Conteúdo (Lado Direito) -->
    <!-- md:ml-64 empurra o conteúdo para não ficar embaixo da sidebar fixa -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-64 relative">
      
      <!-- Header -->
      <header class="flex items-center justify-between px-8 py-5 bg-[#FDFBF7] shrink-0 border-b border-gray-100/50">
        <h1 class="text-2xl font-bold text-gray-800 truncate">Welcome, Administrator</h1>

        <div class="flex items-center gap-6">
          <div class="relative hidden md:block">
            <!-- Ícone Lupa (SVG Inline para garantir funcionamento sem dependência externa) -->
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            
            <input 
              type="text" 
              placeholder="Search..." 
              class="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] transition-all"
            />
          </div>

          <div class="relative">
            <button @click="toggleDropdown" class="focus:outline-none flex items-center">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser" 
                alt="Admin" 
                class="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:ring-2 hover:ring-[#0F3D3E] transition-all cursor-pointer bg-gray-200"
              />
            </button>

            <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Perfil</a>
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content (Com Scroll Interno) -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-8 pt-2 scroll-smooth">
        
        <!-- Stats Grid -->
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

        <!-- Split View Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Atividade Recente -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Atividade Recente</h2>
            <div class="flex flex-col space-y-6">
              <div v-for="item in activities" :key="item.id" class="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0 last:border-none">
                <img :src="item.avatar" :alt="item.user" class="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0 border border-gray-200" />
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

          <!-- Movimentação Rápida -->
          <div class="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <h2 class="text-lg font-bold text-gray-800 mb-6">Movimentação Rápida</h2>
            <form @submit.prevent="submitMovement" class="flex flex-col gap-5 flex-1">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">ID do Artefato</label>
                <input 
                  v-model="movementForm.artefatoId"
                  type="text" 
                  placeholder="Ex: #2024" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all placeholder-gray-400 bg-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nova Localização</label>
                <input 
                  v-model="movementForm.novaLocalizacao"
                  type="text" 
                  placeholder="Ex: Sala de Restauro B" 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all placeholder-gray-400 bg-white"
                />
              </div>

              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Notas</label>
                <textarea 
                  v-model="movementForm.notas"
                  rows="3"
                  placeholder="Adicione uma observação..." 
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E]/20 focus:border-[#0F3D3E] outline-none transition-all resize-none placeholder-gray-400 bg-white"
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