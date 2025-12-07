<script setup>
import HeaderNav from './components/HeaderNav.vue';
import FooterSection from './components/FooterSection.vue';
import NotificationContainer from './components/NotificationContainer.vue';
import { useAuth } from '@/stores/auth';
import { onMounted } from 'vue';

const authStore = useAuth();

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await authStore.fetchCurrentUser();
  }
});
</script>

<template>
  <router-view />
  <NotificationContainer />

</template>