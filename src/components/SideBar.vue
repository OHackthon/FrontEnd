<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const emit = defineEmits(['logout']);

// Itens do Menu com rotas definidas
const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'layout' },
  { label: 'Gestão', path: '/dashboard/gestao', icon: 'collection' },
  { label: 'Categorias', path: '/dashboard/categorias', icon: 'category' },
  { label: 'Artefatos', path: '/dashboard/artefatos', icon: 'box' },
  { label: 'Reservas', path: '/dashboard/reservas', icon: 'arrows' },
  { label: 'Usuários', path: '/dashboard/usuarios', icon: 'users' },
];

// Função para verificar se a rota está ativa
const isActive = (path) => {
  // Verifica se a rota atual é exatamente o path ou se começa com o path (para sub-rotas)
  if (path === '/dashboard') {
    return route.path === path;
  }
  // Garante que a rota fique ativa mesmo se houver sub-rotas (ex: /gestao/novo)
  return route.path === path || route.path.startsWith(path + '/');
};

// Função de Logout
const handleLogout = () => {
  emit('logout');
  console.log('Logout realizado');
};
</script>

<template>
  <aside class="hidden w-64 flex-col border-r border-gray-200 bg-white py-6 md:flex fixed h-full overflow-y-auto">
    
    <!-- Logo Area -->

    <div class="px-6 mb-10">
    <router-link to="/">
      <div class="flex items-center gap-3">
        <!-- Imagem da Logo -->

        <div class="flex flex-col">
          <img src="../assets/images/INTEIROPRETO.png" alt="">
        </div>
      </div>
    </router-link>
    </div>

    <!-- Menu de Navegação -->
    <nav class="flex-1 px-3 space-y-1">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path" 
        class="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 mb-1"
        :class="isActive(item.path) 
          ? 'bg-[#DDF9F7] text-[#0F766E]' 
          : 'text-gray-600 hover:bg-[#DDF9F7] hover:text-[#0F766E]'"
      >
        <!-- Ícones SVG -->
        <svg class="mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200" 
             :class="isActive(item.path) ? 'text-[#0F766E]' : 'text-gray-400 group-hover:text-[#0F766E]'" 
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          
          <template v-if="item.icon === 'layout'">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </template>
          
          <template v-if="item.icon === 'collection'">
            <path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 8v13a2 2 0 0 0 2 2h13"/>
          </template>

          <template v-if="item.icon === 'box'">
            <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
          </template>

          <template v-if="item.icon === 'category'">
            <path d="M19 11H5m14-7H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 7v4m6-4v4"/>
          </template>

          <template v-if="item.icon === 'arrows'">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </template>

          <template v-if="item.icon === 'users'">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </template>

          <template v-if="item.icon === 'chart'">
            <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
          </template>

          <template v-if="item.icon === 'settings'">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
          </template>
        </svg>
        
        <span class="truncate">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Footer Sidebar (Sair) -->
    <div class="px-3 mt-auto">
      <button 
        @click="handleLogout"
        class="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-[#FEF2F2] hover:text-red-600 transition-colors cursor-pointer"
      >
        <svg class="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        Sair
      </button>
    </div>
  </aside>
</template> 