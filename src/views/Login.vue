<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <el-icon class="login-icon">
            <User />
          </el-icon>
          <h2 class="login-title teal-darken-2">Đăng nhập</h2>
        </div>
      </template>
      <el-form
        @submit.prevent="handleLogin"
        :model="loginForm"
        label-position="top"
      >
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
          <el-button
            type="primary"
            native-type="submit"
            class="login-button"
            :loading="loading"
          >
            <el-icon v-if="!loading">
              <Right />
            </el-icon>
            <span>{{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}</span>
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="handleGoogleLogin"
            type="success"
            class="google-login-button"
            :loading="googleLoading"
          >
            <el-icon v-if="!googleLoading">
              <v-icon>mdi-google</v-icon>
            </el-icon>
            <span>{{
              googleLoading
                ? "Đang đăng nhập bằng Google..."
                : "Đăng nhập bằng Google"
            }}</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { User, Message, Lock, Right } from "@element-plus/icons-vue";
import { showNotification } from "../utils/notification";
import Cookies from "js-cookie";

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const googleLoading = ref(false); 

const loginForm = reactive({
  email: "",
  password: "",
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
      title: "Cảnh báo",
      message: "Vui lòng nhập đầy đủ email và mật khẩu",
      type: "warning",
    });
    return;
  }

  loading.value = true;
  try {
    await authStore.login(loginForm);
    showNotification({
      title: "Thành công",
      message: "Đăng nhập thành công",
      type: "success",
    });
    router.push({ name: "Home" });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.email = error.response.data.errors.email || null;
      errors.password = error.response.data.errors.password || null;
    } else {
      showNotification({
        title: "Lỗi",
        message: error.response.data.error || "Đăng nhập thất bại",
        type: "error",
      });
    }
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = () => {
  const googleLoginUrl = "http://127.0.0.1:8000/api/auth/google";
  const popup = window.open(googleLoginUrl, "_blank", "width=500,height=600");
  window.addEventListener(
    "message",
    (event) => {
      console.log(event);

      if (
        event.origin !== "http://localhost:8000" ||
        event.origin !== "http://localhost:8000"
      )
        return;

      const { token, refreshToken, user } = event.data;

      if (token && refreshToken) {
        authStore.token = token;
        authStore.refreshToken = refreshToken;
        authStore.user = user;

        Cookies.set("token", token);
        Cookies.set("refresh_token", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        // showNotification({
        //   title: "Thành công",
        //   message: "Đăng nhập bằng Google thành công",
        //   type: "success",
        // });
        router.push({ name: "Home" });
      } else {
        showNotification({
          title: "Lỗi",
          message: "Không thể nhận token từ Google",
          type: "error",
        });
      }
    },
    { once: true }
  );
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* background-color: #f0f2f5; */
  background-image: url("../assets//images/bg-login.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  color: #00897b;
  margin-right: 10px;
}

.login-title {
  text-align: center;
  color: #00897b;
  margin: 0;
}

.login-button,
.google-login-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-login-button {
  background-color: #de5246;
  color: #fff;
}

.google-login-button .el-icon {
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
