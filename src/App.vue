<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<!-- App.vue -->
<template>
  <div id="app">
    <v-app>
      <Navbar />
      <v-main minHeight="698">
        <router-view></router-view>
      </v-main>
      <v-footer>
        <Footer />
      </v-footer>
    </v-app>
    <ChatbotWidget />
  </div>
</template>


<script>
import ChatbotWidget from './components/ChatbotWidget.vue';

export default {
  components: {
    ChatbotWidget,
  },
};

</script>

<style scope>
#main-content {
  background-color: #eee;
}

.status-paid {
  color: #2d8d30; /* Màu xanh lá cây cho Đã thanh toán */
}

.status-booked {
  color: #2196f3; /* Màu xanh dương cho Đã đặt */
}

.status-deposited {
  color: #ff9800; /* Màu cam cho Đã cọc */
}

.status-cancelled {
  color: #f44336; /* Màu đỏ cho Hủy */
}
</style>
