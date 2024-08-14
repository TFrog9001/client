<script setup>
import NavBar from './components/NavBar.vue';
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <div>
    <NavBar v-if="isAuthenticated"/>
    <router-view/>
  </div>
</template>

<style scoped>
/* Các style của bạn */
</style>