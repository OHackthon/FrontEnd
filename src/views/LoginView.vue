<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoading } from "@/stores/loading";
import { OctagonX } from "lucide-vue-next";
import { useAuth } from "@/stores/auth";

import logoMuseu from "@/assets/LOGO1.png";

const router = useRouter();
const loadingStore = useLoading();
const authStore = useAuth();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  await authStore.login(email.value, password.value);
  if (!authStore.error) {
    router.push("/");
  }
};
</script>

<template>
 

  <div class="h-screen flex bg-white overflow-hidden">
    
    <div class="hidden lg:flex lg:w-1/2 bg-gray-100 relative overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1200" 
        alt="Acervo Arqueológico" 
        class="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
      />
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="relative z-10 p-12 flex flex-col justify-end h-full text-white">
        <h2 class="text-4xl font-serif italic font-light mb-2">Gestão de Acervo Digital.</h2>
      </div>
    </div>

    <main class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white">
      <div class="w-full max-w-md flex flex-col gap-6">
        
        <div class="w-full flex justify-center mb-4">
          <img 
            :src="logoMuseu" 
            alt="Museu Arqueológico de Sambaqui de Joinville" 
            class="h-16 w-auto object-contain" 
          />
        </div>

        <div class="login-container flex flex-col gap-6">
          <div>
            <h2 class="text-3xl font-serif font-medium text-gray-900 text-center">Bem-vindo de volta</h2>
            <p class="text-gray-500 mt-2 text-center">Insira suas credenciais para acessar o acervo.</p>
          </div>

          <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
            
            <div class="space-y-1">
              <label for="email" class="text-sm font-medium text-gray-700">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="ex: nome@gmail.com"
                v-model="email"
                @input="emailError = ''" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': emailError }"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label for="password" class="text-sm font-medium text-gray-700">Senha</label>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                v-model="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
              />
            </div>

            <div v-if="authStore.error" class="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100 animate-pulse">
              <OctagonX :size="20" class="text-red-700 shrink-0" />
              <p class="text-red-700 text-sm font-medium">{{ authStore.error }}</p>
            </div>

            <button type="submit" class="w-full py-3.5 mt-2 rounded-lg bg-gray-900 text-white font-medium text-sm uppercase tracking-wider hover:bg-black transform active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gray-300">
              Acessar Sistema
            </button>
          </form>

          <section class="text-center mt-4 pt-6 border-t border-gray-100">
            <div class="flex flex-row gap-2 justify-center text-sm">
              <p class="text-gray-600">Não possui uma conta?</p>
              <router-link to="/register" class="text-gray-900 font-bold hover:underline decoration-2 decoration-gray-900 underline-offset-2">
                Registrar-se
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>