<template>
  <v-row>
    <v-col>
      <div v-if="booking" class="booking-details">
        <h3 class="mt-4 mx-3">Booking Detail</h3>
        <div class="booking-info mx-6">
          <p>
            <strong>Customer Name:</strong> <span>{{ booking.user.name }}</span>
          </p>
          <p>
            <strong>Phone:</strong> <span>{{ booking.user.phone }}</span>
          </p>
          <p>
            <strong>Email:</strong> <span>{{ booking.user.email }}</span>
          </p>
        </div>
        <div class="booking-info mx-6">
          <p>
            <strong>Field:</strong> <span>{{ booking.field.name }}</span>
          </p>
          <p>
            <strong>Booking Date:</strong>
            <span>{{ formatDate(booking.booking_date) }}</span>
          </p>
          <p>
            <strong>Time Frame:</strong>
            <span
              >{{ formatTime(booking.start_time) }} &nbsp---&nbsp
              {{ formatTime(booking.end_time) }}</span
            >
          </p>
          <p>
            <strong>Field Fee:</strong>
            <span>{{ formatCurrency(booking.field_price) }} VND</span>
          </p>
          <p>
            <strong>Deposit:</strong>
            <span class="text-error"
              >{{ formatCurrency(booking.deposit) }} VND</span
            >
          </p>
          <p>
            <strong>Status:</strong> <span>{{ booking.status }}</span>
          </p>
        </div>
        <div class="booking-info mx-6 mb-5">
          <v-progress-linear
            color="light-blue"
            height="20"
            model-value="10"
            striped
          >
            <template v-slot:default="{ value }">
              <strong>{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
        </div>
      </div>
      <div v-else class="booking-details pa-10">
        <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      </div>
    </v-col>
    <v-col>
      <div class="chat-box">
        <div class="messages" ref="messagesContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message-container"
            :class="{
              'message-sent': isSentMessage(msg),
              'message-received': !isSentMessage(msg),
            }"
            @click="
              hoveredMessageIndex = hoveredMessageIndex === index ? null : index
            "
          >
            <div class="avatar" v-if="!isSentMessage(msg)">
              <img
                :src="
                  msg.user.avatar ||
                  'https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png'
                "
                alt="Avatar"
              />
            </div>

            <div class="message-content">
              <div
                class="user-name text-capitalize text-decoration-underline"
                v-if="!isSentMessage(msg)"
              >
                {{ msg.user.name }}
              </div>
              <div class="message-text">{{ msg.message }}</div>
              <div class="timestamp" v-if="hoveredMessageIndex === index">
                {{ formatDateTooltip(msg.created_at) }}
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            placeholder="Type a message..."
          />
          <v-btn
            prepend-icon="mdi-send"
            size="large"
            @click="handleSendMessage"
          ></v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, nextTick } from "vue";
import { useRoute } from "vue-router";
import chatService from "../../services/chatService";
import bookingService from "../../services/bookingService";

const route = useRoute();
const bookingId = route.params.id;

const booking = ref(null);
const messages = ref([]);
const newMessage = ref("");
const hoveredMessageIndex = ref(null);

// Lấy tham chiếu đến container tin nhắn
const messagesContainer = ref(null);

const fetchData = () => {
  fetchBooking();
  fecthMessage();
};

// Fetch booking details
const fetchBooking = async () => {
  try {
    const response = await bookingService.getBookingById(bookingId);
    booking.value = response.data;
  } catch (error) {
    console.error("Error fetching booking:", error);
  }
};

const fecthMessage = async () => {
  try {
    const response = await chatService.getMessages(bookingId);
    messages.value = response.data;
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching message:", error);
  }
};

// Cuộn xuống cuối cùng của hộp chat
const scrollToBottom = () => {
  const container = messagesContainer.value;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// Gửi tin nhắn
async function handleSendMessage() {
  if (newMessage.value.trim()) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      await chatService.sendMessage(newMessage.value, bookingId, user.id);
      newMessage.value = "";

      // Sau khi gửi tin nhắn, cuộn xuống cuối
      await nextTick();
      scrollToBottom();
    } catch (error) {
      console.error("Không thể gửi tin nhắn:", error);
    }
  }
}

// Xác định xem tin nhắn là tin gửi hay nhận
function isSentMessage(msg) {
  const user = JSON.parse(localStorage.getItem("user"));
  return msg.user_id === user.id;
}

// Định dạng ngày thành dd/mm/yyyy
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

// Định dạng thời gian thành HH:MM
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

const formatDateTooltip = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: "long", // Thứ
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleDateString("en-GB", options);
};

// Định dạng tiền tệ
const formatCurrency = (amount) => {
  return parseFloat(amount)
    .toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
    .replace("₫", "");
};

// Lắng nghe tin nhắn mới qua WebSocket
function listenForMessages() {
  const instance = getCurrentInstance();
  if (instance) {
    const echo = instance.proxy.$echo;
    echo
      .private(`booking.${bookingId}`)
      .listen("MessageSent", async (event) => {
        messages.value.push({
          message: event.message,
          user_id: event.user_id,
          user: event.user, // Gửi user cùng với tin nhắn từ event
          created_at: event.created_at,
        });

        // Cuộn xuống cuối khi có tin nhắn mới
        await nextTick();
        scrollToBottom();
      });
  }
}

// Khi component được mounted
onMounted(() => {
  fetchData();
  listenForMessages();
});
</script>

<style scoped>
.booking-details {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 487px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 55px;
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
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.messages {
  flex-grow: 1;
  max-height: 383px;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 15px;
}

.message-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 10px;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.user-name {
  font-size: 12px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  max-width: 60%;
  position: relative;
  padding: 10px;
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message-sent .message-content {
  background-color: #e0f7fa;
  align-self: flex-end;
}

.message-received .message-content {
  background-color: #ffffff;
  align-self: flex-start;
}

.message-text {
  font-size: 16px;
  color: #333;
}

.timestamp {
  /* position: absolute; */
  /* bottom: -20px; */
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  z-index: 2;
}

.chat-input {
  display: flex;
  gap: 5px;
}

input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

button {
  padding: 10px;
  border-radius: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
</style>
