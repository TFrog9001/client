<template>
  <div>
    <div class="chat-box">
      <div v-for="(msg, index) in messages" :key="index">{{ msg.message }}</div>
    </div>
    <input
      v-model="newMessage"
      @keyup.enter="handleSendMessage"
      placeholder="Type a message..."
    />
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import chatService from "../../services/chatService";

const route = useRoute();
const bookingId = "18";

const messages = ref([]);
const newMessage = ref("");

// Gửi tin nhắn
async function handleSendMessage() {
  if (newMessage.value.trim()) {
    try {
      await chatService.sendMessage(newMessage.value, 18); // Gửi tin nhắn
      newMessage.value = ""; // Reset input
    } catch (error) {
      console.error("Không thể gửi tin nhắn:", error);
    }
  }
}

// Lắng nghe tin nhắn mới
function listenForMessages() {
  const instance = getCurrentInstance();
  if (instance) {
    const echo = instance.proxy.$echo;
    echo.private(`booking.${bookingId}`).listen("MessageSent", (event) => {
      messages.value.push({ message: event.message });
    });
  }
}

// Khởi động lắng nghe khi component được mount
onMounted(() => {
  listenForMessages();
});
</script>

<style scoped>
.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 300px;
  overflow-y: scroll;
}
</style>
