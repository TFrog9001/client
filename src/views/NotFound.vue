<template>
  <v-container fluid class="not-found-container">
    <v-row justify="center" align="center" class="not-found-row">
      <v-col class="text-center text-white">
        <v-img
          src="../assets/images/404.png"
          max-width="300"
          class="mb-4"
        ></v-img>
        <h1 class="display-1">404</h1>
        <h2>Page Not Found</h2>
        <p class="mt-4">Sorry, the page you're looking for doesn't exist.</p>
        <v-btn color="primary" @click="goHome">Go to Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push({ name: "Home" });
};
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  background-image: url("../assets/images/404.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.not-found-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Màu đen mờ phủ lên ảnh nền */
  backdrop-filter: blur(3px); /* Làm mờ background */
  z-index: 1;
}

.not-found-row {
  height: 100%;
  align-self: center;
  z-index: 2; /* Đảm bảo nội dung nằm trên lớp phủ */
  position: relative;
}
</style>
