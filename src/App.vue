<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<!-- App.vue -->
<template>
  <div id="app">
    <v-app>
        <Navbar />
      <v-main minHeight="698">
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer>
        <Footer />
      </v-footer>
    </v-app>
  </div>
</template>

<script>
</script>

<style scoped>
</style>
