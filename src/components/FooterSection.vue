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
  <footer class="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 fixed w-full">
    <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <router-link to="/"
            class="text-xl font-serif font-light tracking-wider text-gray-900 uppercase hover:text-teal-600 transition-colors duration-200">
            Museu do Sambaqui
          </router-link>
          <p class="mt-3 text-sm text-gray-600 font-light leading-relaxed">
            Preservando a história milenar dos construtores de sambaquis do litoral brasileiro.
          </p>
        </div>
        <div class="lg:col-span-1">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Institucional</h3>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.name">
              <router-link :to="link.path"
                class="text-sm text-gray-600 hover:text-teal-600 font-light transition-colors duration-200 ease-in-out">
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>
        <div class="lg:col-span-1">
          <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contato</h3>
          <p class="text-sm text-gray-600 font-light mb-2">E-mail: {{ contactInfo.email }}</p>
          <p class="text-sm text-gray-600 font-light mb-2">Telefone: {{ contactInfo.phone }}</p>
          <p class="text-sm text-gray-600 font-light">{{ contactInfo.address }}</p>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-gray-300 text-center">
        <p class="text-sm text-gray-500 font-light">
          © {{ new Date().getFullYear() }} Museu do Sambaqui. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
<style scoped>
footer {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>