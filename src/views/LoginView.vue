<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoading } from "@/stores/loading";
import { OctagonX } from "lucide-vue-next";
import Loading from "vue-loading-overlay";
import { useAuth } from "@/stores/auth";

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
  <loading
    v-model:active="loadingStore.isLoading"
    :is-full-page="loadingStore.fullPage"
  />
  <main
    class="w-80 h-fit absolute m-auto top-0 bottom-0 left-0 right-0 flex flex-col gap-8"
  >
    <div class="logo-container w-16 mx-auto">
      <h1>LOGO AQUI</h1>
    </div>
    <div class="login-container flex flex-col gap-8">
      <h1 class="text-3xl font-medium mx-auto">Seja bem-vindo!</h1>
      <form @submit.prevent="handleLogin" class="flex flex-col">
        <input
          type="email"
          placeholder="Email"
          v-model="email"
          class="w-full h-15 flex items-center p-4 mb-8 border border-solid border-black rounded-xl"
        />
        <input
          type="password"
          placeholder="Senha"
          v-model="password"
          class="w-full h-15 flex items-center p-4 mb-4 border border-solid border-black rounded-xl"
        />
        <div
          v-if="authStore.error"
          class="error-message flex gap-2 mt--4 justify-center align-center"
        >
          <OctagonX :size="16" class="text-red-800" />
          <p class="text-red-800 text-sm">{{ authStore.error }}</p>
        </div>
        <button
          type="submit"
          class="w-full h-15 mt-4 rounded-xl bg-indigo-500 text-white font-bold cursor-pointer hover:bg-indigo-700 transition delay-150ms ease-in-out"
        >
          Logar
        </button>
      </form>

      <section>
        <div class="flex flex-row gap-2">
          <p>Não possúi uma conta?</p>
          <router-link to="/register" class="text-indigo-500 hover:underline">
            Registre-se aqui
          </router-link>
        </div>
      </section>
    </div>
  </main>
</template>
