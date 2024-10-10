<template>
  <div class="signup-container">
    <el-card class="signup-card">
      <template #header>
        <div class="signup-header">
          <el-icon class="signup-icon">
            <User />
          </el-icon>
          <h2 class="signup-title">Đăng ký tài khoản</h2>
        </div>
      </template>

      <el-form
        @submit.prevent="handleSignUp"
        :model="signUpForm"
        label-position="top"
        autocomplete="off"
      >
        <el-form-item label="Tên" :error="errors.name?.[0]">
          <el-input v-model="signUpForm.name" placeholder="Nhập tên"></el-input>
        </el-form-item>

        <el-form-item label="Email" :error="errors.email?.[0]">
          <el-input
            v-model="signUpForm.email"
            placeholder="Nhập email"
          ></el-input>
        </el-form-item>

        <el-form-item label="Số điện thoại" :error="errors.phone?.[0]">
          <el-input
            v-model="signUpForm.phone"
            placeholder="Nhập số điện thoại"
          ></el-input>
        </el-form-item>

        <el-form-item label="Mật khẩu" :error="errors.password?.[0]">
          <el-input
            type="password"
            v-model="signUpForm.password"
            placeholder="Nhập mật khẩu"
            show-password
            autocomplete="new-password"
          ></el-input>
        </el-form-item>

        <el-form-item
          label="Xác nhận mật khẩu"
          :error="errors.password_confirmation?.[0]"
        >
          <el-input
            type="password"
            v-model="signUpForm.password_confirmation"
            placeholder="Nhập lại mật khẩu"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            class="signup-button"
            :loading="loading"
          >
            <el-icon v-if="!loading">
              <Right />
            </el-icon>
            <span>{{ loading ? "Đang đăng ký..." : "Đăng ký" }}</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { showNotification } from "../utils/notification";
import { User, Right } from "@element-plus/icons-vue";
import api from "../axios/api";

const router = useRouter();
const loading = ref(false);

const signUpForm = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
});

const errors = reactive({
  name: null,
  email: null,
  phone: null,
  password: null,
  password_confirmation: null,
});

const handleSignUp = async () => {
  errors.name = null;
  errors.email = null;
  errors.phone = null;
  errors.password = null;
  errors.password_confirmation = null;

  if (signUpForm.password !== signUpForm.password_confirmation) {
    errors.password_confirmation = ["Mật khẩu xác nhận không khớp"];
    return;
  }

  loading.value = true;
  try {
    console.log(signUpForm);

    const response = await api.post("/auth/register", signUpForm);
    showNotification({
      title: "Thành công",
      message: "Đăng ký thành công!",
      type: "success",
    });
    router.push({ name: "Login" });
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.name = error.response.data.errors.name || null;
      errors.email = error.response.data.errors.email || null;
      errors.phone = error.response.data.errors.phone || null;
      errors.password = error.response.data.errors.password || null;
    } else {
      showNotification({
        title: "Lỗi",
        message: error.response.data.error || "Đăng ký thất bại",
        type: "error",
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url("../assets/images/bg-login.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.signup-card {
  width: 100%;
  max-width: 400px;
}

.signup-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-icon {
  font-size: 24px;
  color: #00897b;
  margin-right: 10px;
}

.signup-title {
  text-align: center;
  color: #00897b;
  margin: 0;
}

.signup-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-button .el-icon {
  margin-right: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
