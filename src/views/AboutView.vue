<script setup>
import { ref } from 'vue'
import HeaderNav from '../components/HeaderNav.vue'
import FooterSection from '../components/FooterSection.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <HeaderNav />

    <main class="flex-grow">
      <div class="bg-gray-100 py-20">
        <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-4">Sobre o Museu do Sambaqui</h1>
          <p class="text-lg text-gray-600 font-light">Nossa missão, história e dedicação à arqueologia costeira.</p>
        </div>
      </div>

      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <h2 class="text-3xl font-serif font-light text-gray-800 mb-6">A História Vinda do Mar</h2>
          <p class="text-gray-600 font-light leading-relaxed mb-6">
            O Museu do Sambaqui foi fundado com o propósito de ser o principal centro de pesquisa e divulgação da cultura dos construtores de sambaquis no Brasil. Nossa coleção abrange milhares de artefatos que datam de 8.000 anos , oferecendo uma perspectiva única sobre a vida, rituais e a adaptação dessas populações ao ambiente litorâneo.
          </p>
          <p class="text-gray-600 font-light leading-relaxed mb-6">
            Nossa missão é preservar, educar e inspirar o público e a comunidade científica, utilizando as tecnologias de conservação e exibição mais modernas.
          </p>
          <blockquote class="border-l-4 border-gray-200 pl-4 py-2 italic text-gray-500 mt-8">
            "Cada concha, cada osso, cada ferramenta de pedra nos conta uma história de resiliência e engenhosidade." - Curadoria.
          </blockquote>
        </div>

        <aside class="lg:col-span-1">
          <div class="p-6 bg-gray-50 border border-gray-200">
            <h3 class="text-lg font-serif font-medium text-gray-900 mb-4 border-b pb-2">Informações Chave</h3>
            <ul class="space-y-3 text-sm text-gray-600">
              <li><span class="font-medium text-gray-800">Fundação:</span> 1972</li>
              <li><span class="font-medium text-gray-800">Acervo:</span> Mais de 15.000 peças catalogadas</li>
              <li><span class="font-medium text-gray-800">Parceiros:</span> Universidade Federal de SC, IPHAN</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>

    <FooterSection />
  </div>
</template>