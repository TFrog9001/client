<template>
    <el-menu mode="horizontal" @select="onMenuSelect">
        <el-menu-item index="dashboard">Dashboard</el-menu-item>
        <el-menu-item index="users">Users</el-menu-item>
        <el-menu-item index="logout">Logout</el-menu-item>
    </el-menu>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const onMenuSelect = (key) => {
    if (key === 'logout') {
        authStore.logout();
        router.push({ name: 'Login' }); 
    } else if (key === 'users') {
        router.push({ name: 'Users' });
    } else if (key === 'dashboard') {
        router.push({ name: 'Admin' });
    }
};
</script>
