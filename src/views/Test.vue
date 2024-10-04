<template>
  <v-row>
    <v-col>
      <div v-if="booking" class="booking-details">
        <h3 class="mx-2">Booking Detail</h3>
        <div class="booking-info ma-6">
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
          <hr />
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
      </div>
      <div v-else class="booking-details pa-10">
        <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      </div>
    </v-col>
    <v-col>
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
            <div class="message-content">
              <div class="avatar" v-if="!isSentMessage(msg)">
                <img :src="msg.user.avatar" alt="Avatar" />
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
          <button @click="handleSendMessage">Send</button>
        </div>
      </div>
    </v-col>
    <v-col>
      <div class="chat-box">
        <v-row justify="space-around d-flex flex-column">
        <v-card v-for="message in messages" :key="message.time" flat>              
                <v-list-item
                    :key="message.time"
                    v-if="message.from != 'You'"
                    class=""
                  >
                    <v-list-item-avatar class="align-self-start mr-2">                     
                      <v-avatar size="40">
                        <v-img src="https://via.placeholder.com/50"></v-img>
                      </v-avatar>                     
                    </v-list-item-avatar>
                    <v-list-item-content class="received-message">
                      <v-card color="success" class="flex-none">                        
                        <v-card-text class="white--text pa-2 d-flex flex-column">
                          <span class="text-caption">{{message.from}} </span>                                                 
                          <span class="align-self-start text-subtitle-1">{{ message.message }}</span>
                          <span class="text-caption font-italic align-self-end">{{
                            message.time
                          }}</span> 
                        </v-card-text>
                      </v-card>                   
                    </v-list-item-content>
                </v-list-item>
              </v-card>
      </v-row>
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
import chatService from "../services/chatService";
import bookingService from "../services/bookingService";

const route = useRoute();
const bookingId = 55;

const booking = ref(null);
const messages = ref([]);
const newMessage = ref("");

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
    console.log(response);
    messages.value = response.data;
  } catch (error) {
    console.error("Error fetching message:", error);
  }
};

// Gửi tin nhắn
async function handleSendMessage() {
  if (newMessage.value.trim()) {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user.id);

      await chatService.sendMessage(newMessage.value, bookingId, user.id);
      newMessage.value = "";
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
    echo.private(`booking.${bookingId}`).listen("MessageSent", (event) => {
      messages.value.push({ message: event.message, user_id: event.user_id });
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
  height: 450px;
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
}

.booking-info p {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.booking-info p strong {
  min-width: 150px;
}

/* .chat-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
} */

.chat-message {
  display: unset !important;
  white-space: break-spaces;
}
.chat-screen {
  max-height: 320px;
  overflow-y: auto;
}
.flex-none {
  flex: unset;
}
.received-message::after {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
  left: 54px;  
  right: auto;
  top: 12px;
  bottom: auto;
  border: 12px solid;
  border-color: #4caf50 transparent transparent transparent;
}
.sent-message::after {
    content: ' ';
    position: absolute;
    width: 0;
    height: 0;
    left: auto;    
    right: 54px;
    top: 12px;
    bottom: auto;
    border: 12px solid;
    border-color: #1976d2 transparent transparent transparent;
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
