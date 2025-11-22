<script setup>
import HeaderNav from  './components/HeaderNav.vue';
import FooterSection from './components/FooterSection.vue';
import NotificationContainer from './components/NotificationContainer.vue';
</script>

<template>
  <router-view />
  <NotificationContainer />
</template>