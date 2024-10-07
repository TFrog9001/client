<template>
  <div>
    <h1>Your Profile</h1>
    <p>Name: {{ authStore.user.name }}</p>
    <p>Email: {{ authStore.user.email }}</p>
    <!-- You can also add more profile-related details here -->
  </div>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth";
const authStore = useAuthStore();
</script>
