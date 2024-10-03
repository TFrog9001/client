<template>
  <v-row>
    <v-col cols="6">
      <div v-if="booking" class="booking-details">
        <h3>Booking Detail</h3>
        <div class="booking-info">
          <p>
            <strong>Customer Name:</strong> <span>{{ booking.user.name }}</span>
          </p>
          <p>
            <strong>Phone:</strong> <span>{{ booking.user.phone }}</span>
          </p>
          <p>
            <strong>Email:</strong> <span>{{ booking.user.email }}</span>
          </p>
          <!-- <v-divider :thickness="7"></v-divider> -->
           <hr/>
          <p>
            <strong>Field:</strong> <span>{{ booking.field.name }}</span>
          </p>
          <p>
            <strong>Booking Date:</strong>
            <span>{{ formatDate(booking.booking_date) }}</span>
          </p>
          <p>
            <strong>Start Time:</strong> <span>{{ formatTime(booking.start_time) }}</span>
          </p>
          <p>
            <strong>End Time:</strong> <span>{{ formatTime(booking.end_time) }}</span>
          </p>
          <p>
            <strong>Status:</strong> <span>{{ booking.status }}</span>
          </p>
          <p>
            <strong>Field Fee:</strong>
            <span>{{ formatCurrency(booking.field_price) }} VND</span>
          </p>
          <p>
            <strong>Deposit:</strong> <span class="text-error">{{ formatCurrency(booking.deposit) }} VND</span>
          </p>
        </div>
      </div>
      <div v-else>Loading...</div>
    </v-col>
    <v-col cols="6">
      <div class="chat-box">
        <div class="messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message"
            :class="{
              'message-sent': isSentMessage(msg),
              'message-received': !isSentMessage(msg),
            }"
          >
            {{ msg.message }}
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            placeholder="Type a message..."
          />
          <button @click="handleSendMessage">Send</button>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import chatService from "../../services/chatService";
import bookingService from "../../services/bookingService";

const route = useRoute();
const bookingId = route.params.id;

const booking = ref(null);
const messages = ref([]);
const newMessage = ref("");

// Fetch booking details
const fetchBooking = async () => {
  try {
    const response = await bookingService.getBookingById(bookingId);
    booking.value = response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
  }
};

// Gửi tin nhắn
async function handleSendMessage() {
  if (newMessage.value.trim()) {
    try {
      await chatService.sendMessage(newMessage.value, bookingId);
      newMessage.value = "";
    } catch (error) {
      console.error("Không thể gửi tin nhắn:", error);
    }
  }
}

// Xác định xem tin nhắn là tin gửi hay nhận
function isSentMessage(msg) {
  // Giả sử user_id của người dùng hiện tại là 9
  const user = localStorage.getItem('user');
  return msg.user_id === user.id;
}

// Định dạng ngày thành dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // "en-GB" sẽ trả về format dd/mm/yyyy
};

// Định dạng thời gian thành HH:MM
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

// Định dạng tiền tệ
const formatCurrency = (amount) => {
  return parseFloat(amount).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).replace("₫", ""); // Loại bỏ ký hiệu tiền "₫" nếu không muốn hiển thị
};


// Lắng nghe tin nhắn mới qua WebSocket
function listenForMessages() {
  const instance = getCurrentInstance();
  if (instance) {
    const echo = instance.proxy.$echo;
    echo.private(`booking.${bookingId}`).listen("MessageSent", (event) => {
      messages.value.push({ message: event.message, user_id: event.user_id });
    });
  }
}

// Khi component được mounted
onMounted(() => {
  fetchBooking();
  listenForMessages();
});
</script>

<style scoped>
.booking-details {
  font-family: Arial, sans-serif;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.booking-info p {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.booking-info p strong {
  min-width: 150px;
}

.chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
}

.message-sent {
  background-color: #dcf8c6;
  align-self: flex-end;
}

.message-received {
  background-color: #fff;
  border: 1px solid #ddd;
  align-self: flex-start;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
}

.chat-input button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #45a049;
}
</style>
