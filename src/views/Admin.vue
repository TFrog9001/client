<template>
    <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, {{ authStore.user.name }}!</p>
        <p>{{ authStore.user.email }}</p>
    </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>