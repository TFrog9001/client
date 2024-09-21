<template>
  <h1 class="text-h4 text-center mb-6">Soccer Field Schedule</h1>
  <v-card class="mb-4 pa-4">
    <v-row>
      <v-col cols="12" sm="4">
        <v-date-input
          class="date-picker"
          v-model="selectedDate"
          label="Select Date"
          prepend-icon="mdi-calendar"
          clearable
        ></v-date-input>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedField"
          :items="fieldOptions"
          label="Select Field"
          item-title="name"
          item-value="id"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="customerNameFilter"
          label="Customer Name"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <v-btn @click="previousDay">Previous Day</v-btn>
        <v-btn @click="setToday">Today</v-btn>
        <v-btn @click="nextDay">Next Day</v-btn>
      </v-col>
    </v-row>
  </v-card>

  <v-card>
    <v-table fixed-header height="800px">
      <thead>
        <tr>
          <th class="text-left">Time</th>
          <th
            v-for="field in filteredFields"
            :key="field.id"
            class="text-center"
          >
            {{ field.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in timeSlots" :key="time">
          <td v-if="index % 2 === 0" class="time-line">{{ time }}</td>
          <td v-else class="time-line"></td>
          <td
            v-for="field in filteredFields"
            :key="`${field.id}-${time}`"
            class="pa-1"
          >
            <template v-if="isBookingStart(field.id, index)">
              <div
                class="booking-block"
                :style="{ height: `${getBookingHeight(field.id, index)}px` }"
              >
                <div class="booking-content">
                  <p class="text-subtitle-2">
                    {{ getBookingForSlot(field.id, index).user.name }}
                  </p>
                  <p class="text-caption">
                    {{
                      getBookingForSlot(field.id, index).start_time.slice(0, 5)
                    }}
                    -
                    {{
                      getBookingForSlot(field.id, index).end_time.slice(0, 5)
                    }}
                  </p>
                  <p class="text-caption">
                    ${{ getBookingForSlot(field.id, index).field_price }}
                  </p>
                  <!-- <v-btn
                    color="error"
                    size="small"
                    @click="handleCancelBooking(field.id, index)"
                  >
                    Cancel
                  </v-btn> -->
                </div>
              </div>
            </template>
            <v-btn
              v-else-if="!getBookingForSlot(field.id, index)"
              block
              @click="handleOpenBooking(field.id, index)"
            >
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>

  <v-dialog v-model="isDialogOpen" max-width="500px">
    <v-card>
      <v-card-title id="title-model">Book Soccer Field</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleBooking">
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="bookingDetails.start_time"
                label="Start Time"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="bookingDetails.end_time"
                :items="availableEndTimes"
                label="End Time"
              ></v-select>
            </v-col>
          </v-row>
          <v-text-field
            v-model="bookingDetails.user.name"
            label="Customer Name"
          ></v-text-field>
          <v-text-field
            v-model="bookingDetails.user.user_id"
            label="Customer ID"
          ></v-text-field>
          <v-text-field
            v-model.number="bookingDetails.field_price"
            label="Price ($)"
            type="number"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="handleBooking">Confirm Booking</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import fieldService from "../services/fieldService";
import bookingService from "../services/bookingService";
import { VDateInput } from "vuetify/labs/VDateInput";

const fields = ref([]);
const timeSlots = Array.from(
  { length: 35 },
  (_, i) =>
    `${Math.floor(i / 2 + 6)
      .toString()
      .padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`
);

const bookings = ref({});
const isDialogOpen = ref(false);
const selectedSlot = ref(null);
const bookingDetails = ref({
  user: { name: "", user_id: "" },
  start_time: "",
  end_time: "",
  field_price: 0,
});

const selectedDate = ref(new Date());
const selectedField = ref(null);
const customerNameFilter = ref("");

const fetchFields = async () => {
  const { data } = await fieldService.getFields();
  fields.value = data;
  bookings.value = data.reduce(
    (acc, field) => ({
      ...acc,
      [field.id]: Array(timeSlots.length).fill(null),
    }),
    {}
  );
};

const fetchBookings = async () => {
  const booking_date = getLocalDate(selectedDate.value);
  const { data } = await bookingService.getBookings(booking_date);

  // Reset bookings
  Object.keys(bookings.value).forEach((fieldId) => {
    bookings.value[fieldId] = Array(timeSlots.length).fill(null);
  });

  // Populate bookings
  data.forEach((booking) => {
    const fieldId = booking.field_id;
    const startIndex = timeSlots.findIndex(
      (time) => time === booking.start_time.slice(0, 5)
    );
    const endIndex = timeSlots.findIndex(
      (time) => time === booking.end_time.slice(0, 5)
    );

    if (startIndex !== -1 && endIndex !== -1) {
      for (let i = startIndex; i < endIndex; i++) {
        if (!bookings.value[fieldId]) {
          bookings.value[fieldId] = Array(timeSlots.length).fill(null);
        }
        bookings.value[fieldId][i] = booking;
      }
    }
  });
};

const handleOpenBooking = (fieldId, index) => {
  selectedSlot.value = { fieldId, index };
  bookingDetails.value = {
    user: { name: "" },
    start_time: timeSlots[index],
    end_time: timeSlots[index + 1] || "23:30",
    field_price: 0,
  };
  isDialogOpen.value = true;
};

const getLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().substr(0, 10);
};

const handleBooking = async () => {
  if (selectedSlot.value) {
    const bookingData = {
      field_id: selectedSlot.value.fieldId,
      booking_date: getLocalDate(selectedDate.value),
      start_time: bookingDetails.value.start_time,
      end_time: bookingDetails.value.end_time,
      user_name: bookingDetails.value.user.name,
      user_id: bookingDetails.value.user.user_id,
      field_price: bookingDetails.value.field_price,
      deposit: 0,
    };

    await bookingService.createBooking(bookingData);
    fetchBookings();
    isDialogOpen.value = false;
  }
};

const handleCancelBooking = async (fieldId, index) => {
  const booking = getBookingForSlot(fieldId, index);
  if (booking) {
    await bookingService.deleteBooking(booking.id);
    fetchBookings();
  }
};

const getBookingForSlot = (fieldId, index) => {
  return bookings.value[fieldId] ? bookings.value[fieldId][index] : null;
};

const isBookingStart = (fieldId, index) => {
  const booking = getBookingForSlot(fieldId, index);
  return booking && booking.start_time.slice(0, 5) === timeSlots[index];
};

const getBookingHeight = (fieldId, index) => {
  const booking = getBookingForSlot(fieldId, index);
  if (booking) {
    const startIndex = timeSlots.indexOf(booking.start_time.slice(0, 5));
    const endIndex = timeSlots.indexOf(booking.end_time.slice(0, 5));

    return (endIndex - startIndex) * 48;
  }
  return 48;
};

const availableEndTimes = computed(() => {
  if (!bookingDetails.value.start_time) return [];
  const startIndex = timeSlots.indexOf(bookingDetails.value.start_time);
  return timeSlots.slice(startIndex + 1);
});

const fieldOptions = computed(() => {
  console.log(fieldOptions);
  return [{ id: null, name: "All Fields" }, ...fields.value];
});

const filteredFields = computed(() => {
  let filtered = fields.value;
  if (selectedField.value) {
    filtered = filtered.filter((field) => field.id === selectedField.value);
  }
  return filtered;
});

const previousDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 1);
  selectedDate.value = date;
};

const nextDay = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 1);
  selectedDate.value = date;
};

const setToday = () => {
  selectedDate.value = new Date();
};

watch([selectedDate, selectedField, customerNameFilter], () => {
  fetchBookings();
});

onMounted(() => {
  fetchFields();
  fetchBookings();
});
</script>

<style scoped>
.booking-block {
  z-index: 2;
  background-color: #2288dd;
  padding: 8px;
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
}

.booking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
}

td {
  position: relative;
  height: 48px;
}

.time-line {
  width: 50px;
}

#title-model {
  background-color: #00796b;
  color: white;
}

.date-picker {
  z-index: 10;
}
</style>
