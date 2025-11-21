<script setup>
import { reactive } from 'vue'

const contactInfo = reactive({
  email: 'contato@museudosambaqui.br',
  phone: '(47) 3433-0114',
  address: 'R. Dona Francisca, 600 - Centro, Joinville - SC'
})

const quickLinks = reactive([
  { name: 'Política de Privacidade', path: '/privacy' },
  { name: 'Termos de Uso', path: '/terms' },
  { name: 'Acessibilidade', path: '/accessibility' },
  { name: 'Imprensa', path: '/press' },
])
</script>

<template>
  <footer class="bg-gray-50 border-t border-gray-100 mt-20">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <router-link to="/" class="text-xl font-serif font-light tracking-wider text-gray-900 uppercase">
            Museu do **Sambaqui**
          </router-link>
          <p class="mt-4 text-sm text-gray-600 font-light">
            Preservando a história milenar dos construtores de sambaquis do litoral brasileiro.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Institucional</h3>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.name">
              <router-link 
                :to="link.path" 
                class="text-sm text-gray-600 hover:text-gray-900 font-light transition duration-150 ease-in-out"
              >
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contato</h3>
          <p class="text-sm text-gray-600 font-light mb-1">E-mail: {{ contactInfo.email }}</p>
          <p class="text-sm text-gray-600 font-light mb-1">Telefone: {{ contactInfo.phone }}</p>
          <p class="text-sm text-gray-600 font-light">{{ contactInfo.address }}</p>
        </div>

         

      </div>
      
      <div class="mt-10 pt-8 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-500 font-light">
          © {{ new Date().getFullYear() }} Museu do Sambaqui. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>