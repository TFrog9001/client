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
                <el-form-item label="Email" :error="errors.email?.[0]">
                    <el-input v-model="loginForm.email">
                        <template #prefix>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Password" :error="errors.password?.[0]">
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
// import { ElNotification } from 'element-plus';
import { User, Message, Lock, Right } from '@element-plus/icons-vue';
import { showNotification } from '../utils/notification';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

const loginForm = reactive({
    email: '',
    password: '',
});

const errors = reactive({
    email: null,
    password: null,
});

const handleLogin = async () => {

    errors.email = null;
    errors.password = null;

    if (!loginForm.email || !loginForm.password) {
        showNotification({
            title: 'Cảnh báo',
            message: 'Vui lòng nhập đầy đủ email và mật khẩu',
            type: 'warning'
        });
        return;
    }

    loading.value = true;
    try {
        await authStore.login(loginForm);
        showNotification({
            title: 'Thành công',
            message: 'Đăng nhập thành công',
            type: 'success'
        });
        router.push({ name: 'Home' });
    } catch (error) {
        if (error.response && error.response.data.errors) {
            errors.email = error.response.data.errors.email || null;
            errors.password = error.response.data.errors.password || null;
        } else {
            showNotification({
                title: 'Lỗi',
                message: error.response.data.error || 'Đăng nhập thất bại',
                type: 'error'
            });
        }
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
    font-size: 24px;
}
</style>