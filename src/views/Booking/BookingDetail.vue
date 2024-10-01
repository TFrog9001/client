<template>
    <v-row>
      <!-- Booking Details -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <v-card-title>Booking Details</v-card-title>
          <v-card-text>
            <v-table id="booking-detail">
              <tr>
                <td class="font-weight-bold">Booker:</td>
                <td>{{ booking.user?.name }} - {{ booking.user?.phone }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Booking Time:</td>
                <td>{{ formatDate(booking.booking_date) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">Field Fee:</td>
                <td>&#160;&#160;{{ formatNumber(booking.field_price) }} VND</td>
              </tr>
              <tr>
                <td class="font-weight-bold ">Deposit</td>
                <td class="text-red-darken-2">- {{ formatNumber(booking.deposit) }} VND</td>
              </tr>
              <tr>
                <td class="font-weight-bold"></td>
                <td></td>
              </tr>
              <tr>
                <td class="font-weight-bold"></td>
                <td></td>
              </tr>
              <tr>
                <td class="font-weight-bold">Payment Status:</td>
                <td></td>
              </tr>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Chat -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <v-card-title>Chat</v-card-title>
          <v-card-text>
            <div class="chat-messages">
              <div><strong>John:</strong> Hi, I've arrived at the field.</div>
              <div>
                <strong>Staff:</strong> Great! Someone will be there to assist
                you shortly.
              </div>
            </div>
            <v-text-field
              v-model="message"
              label="Type your message..."
              variant="outlined"
              hide-details
            ></v-text-field>
            <v-btn @click="sendMessage" icon>
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Booking Duration -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title>Booking Duration</v-card-title>
          <v-card-text>
            <v-progress-linear
              :value="bookingProgress"
              height="10"
            ></v-progress-linear>
            <p>Booking time completed</p>
            <v-btn @click="receiveField" color="primary">Receive Field</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Support Items -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title>Support Items</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-row>
              <v-col cols="8">
                <v-text-field
                  v-model="newItem.name"
                  label="Item name"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model.number="newItem.quantity"
                  label="Quantity"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn @click="addItem" color="primary" icon>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
</template>
<script setup>
import bookingService from "../../services/bookingService";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const message = ref("");
const bookingProgress = ref(50);
const newItem = ref({ name: "", quantity: 1 });
const items = ref([
  { name: "Football", quantity: 2 },
  { name: "Training Shirt", quantity: 5 },
]);

const booking = ref({});

const fetchBooking = async () => {
  const id = route.params.id;
  const { data } = await bookingService.getBookingById(id);
  booking.value = data;
  console.log(booking.value);
};

const sendMessage = () => {
  // Logic to send a chat message
  console.log("Message sent:", message.value);
  message.value = "";
};

const receiveField = () => {
  // Logic to receive the field
  console.log("Field received");
};

const addItem = () => {
  if (newItem.value.name) {
    items.value.push({ ...newItem.value });
    newItem.value.name = "";
    newItem.value.quantity = 1;
  }
};

// Hàm format số với dấu phẩy
const formatNumber = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
  });

  return formatter.format(number);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày, thêm 0 nếu cần
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng, thêm 0 nếu cần
  const year = date.getFullYear(); // Lấy năm

  return `${day}-${month}-${year}`;
};

onMounted(() => {
  fetchBooking();
});
</script>

<style scoped>
.chat-messages {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

#booking-detail tr{
  height: 32px;
}
</style>
