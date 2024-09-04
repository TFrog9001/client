<script setup>
import Sidebar from './components/Sidebar.vue';
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>

<template>
  <v-responsive class="border rounded">
    <v-app id="inspire">

      <Sidebar v-if="isAuthenticated"/>
    
      <v-main>
        <router-view></router-view>
      </v-main>
    </v-app>
  </v-responsive>
</template>


<style scoped></style>