<template>
  <div class="container">
    <v-row>
      <v-col>
        <div v-if="booking" class="booking-details">
          <h3 class="mt-4 mx-3">
            Chi tiết phiếu đặt sân <strong>#{{ booking.id }}</strong>
          </h3>
          <div class="booking-info mx-6">
            <p>
              <strong>Người đặt</strong> <span>{{ booking.user.name }}</span>
            </p>
            <p>
              <strong>Số điện thoại:</strong>
              <span>{{ booking.user.phone }}</span>
            </p>
            <p>
              <strong>Email:</strong>
              <span>{{ booking.user.email ?? "null" }}</span>
            </p>
          </div>
          <div class="booking-info mx-6">
            <p>
              <strong>Sân:</strong> <span>{{ booking.field.name }}</span>
            </p>
            <p>
              <strong>Ngày đặt:</strong>
              <span>{{ formatDate(booking.booking_date) }}</span>
            </p>
            <p>
              <strong>Khung giờ:</strong>
              <span
                >{{ formatTime(booking.start_time) }} -
                {{ formatTime(booking.end_time) }}</span
              >
            </p>
            <p>
              <strong>Phí sân:</strong>
              <span>{{ formatCurrency(booking.field_price) }}</span>
            </p>
            <p v-if="booking.bill.services && booking.bill.services.length > 0">
              <strong>Phí dịch vụ:</strong>
              <span>{{ formatCurrency(serviceFees) }}</span>
            </p>
            <p v-if="booking.bill.supplies && booking.bill.supplies.length > 0">
              <strong>Phí tiện ích:</strong>
              <span>{{ formatCurrency(supplyFees) }}</span>
            </p>
            <p>
              <strong>Tiền đã cọc:</strong>
              <span class="status-cancelled currency-amount">{{
                '- '+formatCurrency(booking.deposit)
              }}</span>
            </p>
            <p>
              <strong>Thanh toán:</strong>
              <span class="text-success currency-amount">{{
                formatCurrency(totalAmountDue)
              }}</span>
            </p>

            <p v-if="booking.bill.status == 'Đã thanh toán'">
              <strong>Tổng:</strong>
              <span :class="getStatusClass(booking.bill.status)">
                {{ formatCurrency(booking.bill.total_amount) }}
              </span>
            </p>

            <p>
              <strong>Trạng thái:</strong>
              <span :class="getStatusClass(booking.bill.status)">
                {{ booking.bill.status }}
              </span>
            </p>
          </div>
          <div class="booking-info mx-6 mb-5">
            <v-progress-linear
              color="light-blue"
              height="20"
              :model-value="progress"
              :striped="progress != 100"
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
          </div>
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
                hoveredMessageIndex =
                  hoveredMessageIndex === index ? null : index
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
    <v-row>
      <v-col cols="5">
        <div v-if="services && services.length" class="service-table">
          <h4 class="mb-3">Dịch vụ đã chọn</h4>
          <table class="table table-bordered table-responsive">
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Mô tả</th>
                <th>Nhân viên</th>
                <th>Phí</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td>{{ service.service.service }}</td>
                <td>{{ service.service.description }}</td>
                <td>
                  <v-avatar
                    :image="
                      service.staff.avatar ||
                      'https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png'
                    "
                  ></v-avatar>
                  {{ service.staff.name }}
                </td>
                <td>{{ formatCurrency(service.fee) }} VND</td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <SupplyTable
          v-if="booking"
          :booking-id="bookingId"
          :bill="bill"
          :totalAmountDue="totalAmountDue"
          @payment-success="fetchBooking"
          @updateBooking="fetchBooking"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import chatService from "../../services/chatService";
import bookingService from "../../services/bookingService";

import SupplyTable from "./SupplyTable.vue";

const route = useRoute();
const bookingId = route.params.id;

const booking = ref(null);
const bill = ref(null);
const services = ref(null);
const messages = ref([]);
const newMessage = ref("");
const hoveredMessageIndex = ref(null);
const progress = ref(0);
const calculateProgress = () => {
  const now = new Date();
  const startTime = new Date(
    `${booking.value.booking_date}T${booking.value.start_time}`
  );
  const endTime = new Date(
    `${booking.value.booking_date}T${booking.value.end_time}`
  );

  // Tính tổng thời gian và thời gian đã trôi qua
  const totalTime = endTime - startTime;
  const elapsedTime = now - startTime;

  if (elapsedTime > 0 && totalTime > 0) {
    progress.value = Math.min((elapsedTime / totalTime) * 100, 100);
  } else {
    progress.value = 0;
  }
};
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

    bill.value = booking.value.bill;

    services.value = booking.value.bill.services;
    calculateProgress();
  } catch (error) {
    console.error("Error fetching booking:", error);
  }
};

// Tính tổng phí dịch vụ
const serviceFees = computed(() => {
  if (!booking.value || !booking.value.bill || !booking.value.bill.services)
    return 0;
  return booking.value.bill.services.reduce(
    (total, service) => total + parseFloat(service.fee),
    0
  );
});

// Tính tổng phí tiện ích
const supplyFees = computed(() => {
  if (!booking.value || !booking.value.bill || !booking.value.bill.supplies)
    return 0;
  return booking.value.bill.supplies.reduce(
    (total, supply) => total + supply.quantity * parseFloat(supply.price),
    0
  );
});

// Tính tổng số tiền cần thanh toán sau khi trừ cọc
const totalAmountDue = computed(() => {
  if (!booking.value) return 0;
  const fieldPrice = parseFloat(booking.value.field_price);
  const deposit = parseFloat(booking.value.deposit) || 0;
  const totalBill = fieldPrice + serviceFees.value + supplyFees.value;
  return totalBill - deposit;
});

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
    weekday: "long",
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

const getStatusClass = (status) => {
  switch (status) {
    case "Đã thanh toán":
      return "status-paid";
    case "Đã đặt":
      return "status-booked";
    case "Đã cọc":
      return "status-deposited";
    case "Hủy":
      return "status-cancelled";
    case "Chưa thanh toán":
      return "status-cancelled";
    default:
      return "";
  }
};

// Lắng nghe tin nhắn mới qua WebSocket
function listenForMessages() {
  const instance = getCurrentInstance();
  if (instance) {
    const echo = instance.proxy.$echo;
    echo
      .private(`booking.${bookingId}`)
      .listen("MessageSent", async (event) => {
        console.log(event);

        messages.value.push({
          message: event.message,
          user_id: event.user_id,
          user: event.user,
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
  setInterval(calculateProgress, 60000);
});
</script>

<style scoped>
.booking-details {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 550px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* align-items: flex-start; */
  flex-wrap: wrap;
  margin-bottom: 30px;
  align-content: space-between;
}

.booking-info p {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.booking-info p strong {
  min-width: 150px;
}

.booking-info > p > span {
  display: inline-block;
  min-width: 100px;
  text-align: right;
}

.booking-info p {
  display: flex;
  justify-content: space-between;
  margin: 0;
}
.chat-box {
  display: flex;
  flex-direction: column;
  height: 550px;
  border-radius: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.messages {
  flex-grow: 1;
  max-height: 470px;
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
