<template>
    <el-container style="height: 100vh;">
        <!-- Navbar bên trái -->
        <el-aside :width="isCollapsed ? '64px' : '200px'" class="navbar" style="transition: width 0.3s;">
            <el-menu :default-active="activeMenu" :collapse="isCollapsed" @select="onMenuSelect"
                class="el-menu-vertical-demo">
                <el-menu-item index="dashboard">
                    <i class="fa-sharp-duotone fa-solid fa-bars"></i> 
                    Dashboard
                </el-menu-item>
                <el-menu-item index="users"><i class="fa-regular fa-user"></i> Users</el-menu-item>
                <el-menu-item index="logout">Logout</el-menu-item>
            </el-menu>
        </el-aside>

        <!-- Container chính -->
        <el-container>
            <!-- Topbar -->
            <el-header
                style="background-color: #f5f5f5; display: flex; justify-content: space-between; padding: 10px 20px;">
                <button type="button" class="btn btn-primary" @click="toggleCollapse" icon="el-icon-menu"></button>
                <div style="display: flex; align-items: center;">
                    <el-avatar :size="40" src="https://via.placeholder.com/40" />
                    <span style="margin-left: 10px;">John Doe</span>
                </div>
            </el-header>

            <!-- Content -->
            <el-main style="padding: 20px;">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const isCollapsed = ref(false);
const activeMenu = ref('dashboard');

const authStore = useAuthStore();
const router = useRouter();

// Hàm để thu gọn và mở rộng navbar
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

// Hàm xử lý sự kiện chọn menu
const onMenuSelect = (key) => {
    activeMenu.value = key;
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

<style scoped>
.navbar.is-collapsed {
    width: 64px !important;
}

.el-avatar {
    border-radius: 50%;
}
</style>