<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="login-header">
                    <el-icon class="login-icon">
                        <User />
                    </el-icon>
                    <h2 class="login-title">Đăng nhập</h2>
                </div>
            </template>
            <el-form @submit.prevent="handleLogin" :model="loginForm" label-position="top">
                <el-form-item label="Email">
                    <el-input v-model="loginForm.email">
                        <template #prefix>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Mật khẩu">
                    <el-input type="password" v-model="loginForm.password" show-password>
                        <template #prefix>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" native-type="submit" class="login-button" :loading="loading">
                        <el-icon v-if="!loading">
                            <Right />
                        </el-icon>
                        <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</span>
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ElNotification } from 'element-plus';
import { User, Message, Lock, Right } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

const loginForm = reactive({
    email: '',
    password: '',
});

const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
        ElNotification({
            title: 'Cảnh báo',
            message: 'Vui lòng nhập đầy đủ email và mật khẩu',
            type: 'warning',
            position: 'top-right',
            duration: 5000
        });
        return;
    }

    loading.value = true;
    try {
        await authStore.login(loginForm);
        ElNotification({
            title: 'Thành công',
            message: 'Đăng nhập thành công',
            type: 'success',
            position: 'top-right',
            duration: 5000
        });
        router.push({ name: 'Admin' });
    } catch (error) {
        ElNotification({
            title: 'Lỗi',
            message: error.message || 'Đăng nhập thất bại',
            type: 'error',
            position: 'top-right',
            duration: 5000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-card {
    width: 100%;
    max-width: 400px;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-icon {
    font-size: 24px;
    color: #409EFF;
    margin-right: 10px;
}

.login-title {
    text-align: center;
    color: #409EFF;
    margin: 0;
}

.login-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-button .el-icon {
    margin-right: 5px;
}

.el-form-item {
    margin-bottom: 20px;
}

.el-input-group__prepend {
    background-color: #fff;
}

.el-input__prefix {
    display: flex;
    align-items: center;
}

.el-input__prefix .el-icon {
    font-size: 16px;
}
</style>