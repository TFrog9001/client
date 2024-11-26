<template>
  <v-app-bar>
    <!-- Chỉ hiển thị nút menu icon khi màn hình nhỏ -->
    <v-app-bar-nav-icon
      class="d-sm-none"
      @click="drawer = !drawer"
    ></v-app-bar-nav-icon>

    <!-- Logo và tiêu đề -->
    <img
      src="../assets/images/logo.png"
      alt="Logo"
      style="height: 50px;"
      class="ma-3"
    />
    <v-toolbar-title>Sân Bóng AT</v-toolbar-title>

    <v-row class="d-none d-md-flex justify-center">
      <template v-for="(item, index) in menuItems" :key="index">
        <v-btn :to="item.href" text :class="{ active: isActive(item.href) }">
          {{ item.title }}
        </v-btn>
      </template>
    </v-row>

    <!-- Tài khoản và đăng xuất -->
    <v-col cols="2" class="d-none d-md-flex justify-end">
      <template v-if="!isAuthenticated">
        <v-btn text to="/login">Đăng nhập</v-btn>
        <v-btn text to="/register">Đăng ký</v-btn>
      </template>
      <template v-else>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn text v-bind="props">
              <v-avatar :image="userAvatar" class="mr-2"></v-avatar>
              {{ userName }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/account">
              <v-list-item-title>Tài Khoản</v-list-item-title>
            </v-list-item>
            <v-list-item to="/user-booking">
              <v-list-item-title>Lịch sử đặt sân</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-title>Đăng xuất</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-col>
  </v-app-bar>

  <!-- Drawer dùng chung menuItems -->
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item
        v-for="(item, index) in menuItems"
        :key="index"
        :to="item.href"
        :class="{ active: isActive(item.href) }"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <template v-if="!isAuthenticated">
        <v-list-item to="/login">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item to="/register">
          <v-list-item-title>Register</v-list-item-title>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item to="/account">
          <v-list-item-title>My account</v-list-item-title>
        </v-list-item>
        <v-list-item to="/user-booking">
          <v-list-item-title>My Booking History</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const drawer = ref(false);
const userAvatar = ref(
  "https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png"
);
const userName = ref("Tên Người Dùng");

const menuItems = ref([
  { title: "Trang chủ", href: "/home" },
  { title: "Lịch sân", href: "/booking" },
  { title: "Đánh giá", href: "/reviews" },
  { title: "Liên hệ", href: "/contact" },
]);

const isActive = (path) => route.path === path;

const fecthUserInfor = () => {
  const user = JSON.parse(localStorage.getItem("user"));  
  if (user) {
    userName.value = user.name;
    if (user.avatar != null && user.avatar != "") {
      userAvatar.value = user.avatar;
    }
  }
};

// Watch trạng thái đăng nhập
watchEffect(() => {
  if (authStore.user) {
    fecthUserInfor();
  }
});

const logout = () => {
  authStore.logout();
  router.push("/login");
};

onMounted(() => {
  fecthUserInfor();
});
</script>

<style scoped>
.v-toolbar-title {
  font-weight: bold;
}

.active {
  color: #00897B !important;
}

@media (max-width: 960px) {
  .v-toolbar-title {
    font-size: 16px;
  }
}
</style>
