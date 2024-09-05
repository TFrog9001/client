<script setup>
import Sidebar from './components/Sidebar.vue';
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
</script>

<template>
  <v-responsive class="border rounded">
    <v-app id="inspire">

      <Sidebar v-if="isAuthenticated && isAdmin"/>
    
      <v-main class="ma-4">
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-responsive>
</template>


<style scoped></style>