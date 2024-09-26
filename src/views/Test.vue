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
          variant="outlined"
        ></v-date-input>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedField"
          :items="fieldOptions"
          label="Select Field"
          item-title="name"
          item-value="id"
          variant="outlined"
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="customerNameFilter"
          label="Customer Name"
          variant="outlined"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <v-btn @click="selectedField ? previousWeek() : previousDay()">
          {{ selectedField ? "Previous Week" : "Previous Day" }}
        </v-btn>
        <v-btn @click="setToday">
          {{ selectedField ? "This Week" : "Today" }}
        </v-btn>
        <v-btn @click="selectedField ? nextWeek() : nextDay()">
          {{ selectedField ? "Next Week" : "Next Day" }}
        </v-btn>
      </v-col>
    </v-row>
  </v-card>

  <v-card v-if="!selectedField">
    <v-table id="table-booking" fixed-header>
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
                </div>
              </div>
            </template>
            <v-btn
              v-else-if="
                !getBookingForSlot(field.id, index) &&
                isPastTime(index, selectedDate)
              "
              block
              disabled
            >
              -
            </v-btn>
            <v-btn
              v-else-if="
                !getBookingForSlot(field.id, index) &&
                !isPastTime(index, selectedDate)
              "
              block
              @click="handleOpenBooking(field.id, index)"
            >
              +
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>

  <v-card v-else>
    <v-table id="table-booking-week" fixed-header>
      <thead>
        <tr>
          <th class="text-left">Time</th>
          <th v-for="day in weekDays" :key="day.date" class="text-center">
            {{ day.name }} ({{ formatDate(day.date) }})
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in timeSlots" :key="time">
          <td v-if="index % 2 === 0" class="time-line">{{ time }}</td>
          <td v-else class="time-line"></td>
          <td v-for="day in weekDays" :key="`${day.date}-${time}`" class="pa-1">
            <template v-if="isBookingStart(selectedField, index, day.date)">
              <div
                class="booking-block"
                :style="{
                  height: `${getBookingHeight(
                    selectedField,
                    index,
                    day.date
                  )}px`,
                }"
              >
                <div class="booking-content">
                  <p class="text-subtitle-2">
                    {{
                      getBookingForSlot(selectedField, index, day.date).user
                        .name
                    }}
                  </p>
                  <p class="text-caption">
                    {{
                      getBookingForSlot(
                        selectedField,
                        index,
                        day.date
                      ).start_time.slice(0, 5)
                    }}
                    -
                    {{
                      getBookingForSlot(
                        selectedField,
                        index,
                        day.date
                      ).end_time.slice(0, 5)
                    }}
                  </p>
                  <p class="text-caption">
                    ${{
                      getBookingForSlot(selectedField, index, day.date)
                        .field_price
                    }}
                  </p>
                </div>
              </div>
            </template>
            <v-btn
              v-else-if="
                !getBookingForSlot(selectedField, index, day.date) &&
                isPastTime(index, day.date)
              "
              block
              disabled
            >
              -
            </v-btn>
            <v-btn
              v-else-if="
                !getBookingForSlot(selectedField, index, day.date) &&
                !isPastTime(index, day.date)
              "
              block
              @click="handleOpenBooking(selectedField, index, day.date)"
            >
              +
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
  <!-- Dialog -->
  <v-dialog v-model="isDialogOpen" max-width="500px" height="800px">
    <v-card height="100%">
      <v-card-title id="title-model">Book Soccer Field</v-card-title>
      <v-card-text class="mt-4">
        <v-form @submit.prevent="handleBooking">
          <v-row>
            <!-- Hiển thị ngày booking -->
            <v-col cols="6">
              <v-date-input
                class="date-picker"
                v-model="selectedDateForm"
                label="Select Date"
                prepend-icon="mdi-calendar"
                clearable
                variant="outlined"
              ></v-date-input>
            </v-col>

            <!-- Hiển thị tên sân booking -->
            <v-col cols="6">
              <v-select
                v-model="bookingDetails.field"
                :items="fields"
                item-title="name"
                item-value="id"
                label="Booking Field"
                variant="outlined"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="">
              <v-select
                v-model="bookingDetails.start_time"
                :items="availableStartTimes"
                label="Start Time"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col>
            <v-col cols="">
              <v-select
                v-model="bookingDetails.end_time"
                :items="availableEndTimes"
                label="End Time"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col>
            <!-- <v-col cols="4">
              <v-select
                v-model="bookingDetails.duration"
                :items="durationOptions"
                label="Duration"
                @update:model-value="calculateEndTime"
              ></v-select>
            </v-col> -->
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="bookingDetails.cost"
                label="Cost"
                variant="outlined"
                readonly
                suffix="VND"
              >
              </v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="bookingDetails.deposit"
                label="Deposit"
                variant="outlined"
                readonly
                suffix="VND"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-combobox
              v-model="bookingDetails.user.phone"
              :items="users"
              item-title="phone"
              item-value="id"
              label="Select or Enter Customer Name"
              variant="outlined"
              clearable
              @update:model-value="onUserSelect"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item class="text-caption" v-bind="props"
                  >{{ item.raw.name }} - {{ item.raw.email }}</v-list-item
                >
                <hr />
              </template>
            </v-combobox>
          </v-row>
          <v-row>
            <v-text-field
              v-model="bookingDetails.user.name"
              label="Enter Customer Name"
              variant="outlined"
              required
            ></v-text-field>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-radio-group v-model="bookingDetails.paymentMethod" row>
                <v-subheader>Payment Method</v-subheader>
                <v-radio label="Full Payment" value="full"></v-radio>
                <v-radio label="Partial Deposit" value="partial"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-radio-group v-model="bookingDetails.paymentType" row>
                <v-subheader>Payment Type</v-subheader>
                <v-radio label="Pay Directly" value="direct"></v-radio>
                <v-radio
                  label="Pay Online via ZaloPay"
                  value="zalopay"
                ></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" color="primary" @click="handleBooking">
          {{ bookingDetails.paymentMethod === "full" ? "Book" : "Pay Deposit" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import fieldService from "../services/fieldService";
import bookingService from "../services/bookingService";
import userService from "../services/userService";
import paymentSerice from "../services/paymentService";
import { VDateInput } from "vuetify/labs/VDateInput";

const users = ref([]);
const durationOptions = [
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
  "3.5 hours",
  "4 hours",
  "4.5 hours",
  "5 hours",
];
const formatCurrency = (value) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(value);
};
const calculateEndTime = (duration) => {
  // const startTime = bookingDetails.value.start_time;
  // const [startHour, startMinute] = startTime.split(":");
  // let hours = parseFloat(duration);
  // const endHour = parseInt(startHour) + Math.floor(hours);
  // const endMinute = parseInt(startMinute) + (hours % 1 === 0.5 ? 30 : 0);

  // let endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
  //   .toString()
  //   .padStart(2, "0")}`;
  // bookingDetails.value.end_time = endTime;

  //
  const selectedField = fields.value.find(
    (field) => field.id === bookingDetails.value.field
  );
  const fieldPrices = selectedField.prices.filter((price) => {
    const [startHour, startMinute] = bookingDetails.value.start_time.split(":");
    const [endHour, endMinute] = bookingDetails.value.end_time.split(":");
    const start = new Date(0, 0, 0, parseInt(startHour), parseInt(startMinute));
    const end = new Date(0, 0, 0, parseInt(endHour), parseInt(endMinute));
    return (
      (start.getTime() >=
        new Date(
          0,
          0,
          0,
          parseInt(price.start_time.split(":")[0]),
          parseInt(price.start_time.split(":")[1])
        ).getTime() &&
        start.getTime() <
          new Date(
            0,
            0,
            0,
            parseInt(price.end_time.split(":")[0]),
            parseInt(price.end_time.split(":")[1])
          ).getTime()) ||
      (end.getTime() >
        new Date(
          0,
          0,
          0,
          parseInt(price.start_time.split(":")[0]),
          parseInt(price.start_time.split(":")[1])
        ).getTime() &&
        end.getTime() <=
          new Date(
            0,
            0,
            0,
            parseInt(price.end_time.split(":")[0]),
            parseInt(price.end_time.split(":")[1])
          ).getTime()) ||
      (start.getTime() >=
        new Date(
          0,
          0,
          0,
          parseInt(price.start_time.split(":")[0]),
          parseInt(price.start_time.split(":")[1])
        ).getTime() &&
        end.getTime() <=
          new Date(
            0,
            0,
            0,
            parseInt(price.end_time.split(":")[0]),
            parseInt(price.end_time.split(":")[1])
          ).getTime())
    );
  });

  let totalPrice = 0;
  for (const price of fieldPrices) {
    const [startHour, startMinute] = bookingDetails.value.start_time.split(":");
    const [endHour, endMinute] = bookingDetails.value.end_time.split(":");
    const actualStart = new Date(
      0,
      0,
      0,
      parseInt(startHour),
      parseInt(startMinute)
    );
    const actualEnd = new Date(0, 0, 0, parseInt(endHour), parseInt(endMinute));

    const startMinutes = actualStart.getTime();
    const endMinutes = actualEnd.getTime();

    const minutesBooked = (endMinutes - startMinutes) / (1000 * 60);
    const priceForThisSlot = (minutesBooked / 60) * parseFloat(price.price);
    totalPrice += priceForThisSlot;
  }

  bookingDetails.value.cost = formatCurrency(totalPrice);
  bookingDetails.value.deposit = formatCurrency(totalPrice * 0.4);
};

const onUserSelect = (input) => {
  console.log(input);
  if (input === null) {
    return;
  }

  const selectedUser = users.value.find(
    (user) => user.phone === input || user.phone === input.phone
  );
  if (selectedUser) {
    bookingDetails.value.user.name = selectedUser.name;
    bookingDetails.value.user.user_id = selectedUser.id;
    // bookingDetails.value.user.phone = selectedUser.phone;
  } else {
    // bookingDetails.value.user.phone = input;
    bookingDetails.value.user.user_id = "";
    bookingDetails.value.user.name = "";
    // bookingDetails.value.user.user_id = "";
  }
};

const fetchCustomers = async () => {
  const { data } = await userService.getCustomers();
  users.value = data.users;
};

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
  user: { name: "", user_id: "", phone: "" },
  start_time: "",
  end_time: "",
  field: null,
  booking_date: null,
  duration: null,
  cost: null,
  deposit: null,
  paymentMethod: "full",
  paymentType: "direct",
});

const selectedDate = ref(new Date());
const selectedDateForm = ref(new Date());

const selectedField = ref(null);
const customerNameFilter = ref("");

const weekDays = computed(() => {
  const days = [];
  const startOfWeek = getStartOfWeek(selectedDate.value);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    days.push({
      date: getLocalDate(date),
      name: date.toLocaleString("default", { weekday: "short" }),
    });
  }
  return days;
});

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const fetchFields = async () => {
  const { data } = await fieldService.getFields();
  fields.value = data;
  resetBookings();
};

const resetBookings = () => {
  bookings.value = fields.value.reduce(
    (acc, field) => ({
      ...acc,
      [field.id]: weekDays.value.reduce(
        (dayAcc, day) => ({
          ...dayAcc,
          [day.date]: Array(timeSlots.length).fill(null),
        }),
        {}
      ),
    }),
    {}
  );
};

const fetchBookings = async () => {
  resetBookings();
  if (selectedField.value) {
    for (const day of weekDays.value) {
      const { data } = await bookingService.getBookings(day.date);
      data.forEach((booking) => {
        if (booking.field_id === selectedField.value) {
          const startIndex = timeSlots.findIndex(
            (time) => time === booking.start_time.slice(0, 5)
          );
          const endIndex = timeSlots.findIndex(
            (time) => time === booking.end_time.slice(0, 5)
          );

          if (startIndex !== -1 && endIndex !== -1) {
            for (let i = startIndex; i < endIndex; i++) {
              if (!bookings.value[selectedField.value][day.date]) {
                bookings.value[selectedField.value][day.date] = Array(
                  timeSlots.length
                ).fill(null);
              }
              bookings.value[selectedField.value][day.date][i] = booking;
            }
          }
        }
      });
    }
  } else {
    const { data } = await bookingService.getBookings(
      getLocalDate(selectedDate.value)
    );
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
          if (!bookings.value[fieldId][getLocalDate(selectedDate.value)]) {
            bookings.value[fieldId][getLocalDate(selectedDate.value)] = Array(
              timeSlots.length
            ).fill(null);
          }
          bookings.value[fieldId][getLocalDate(selectedDate.value)][i] =
            booking;
        }
      }
    });
  }
};

const handleOpenBooking = (fieldId, index, date) => {
  fetchCustomers();

  selectedSlot.value = { fieldId, index, date };
  bookingDetails.value = {
    user: { name: "", user_id: "" },
    start_time: timeSlots[index],
    end_time: timeSlots[index + 1],
    field: fieldId,
    booking_date: date || getLocalDate(selectedDate.value),
  };
  isDialogOpen.value = true;
};

const getLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().substr(0, 10);
};

const handleBooking = async () => {
  console.log(bookingDetails.value);

  if (selectedSlot.value) {
    const bookingData = {
      field_id: bookingDetails.value.field,
      booking_date:
        selectedSlot.value.date || getLocalDate(selectedDateForm.value),
      start_time: bookingDetails.value.start_time,
      end_time: bookingDetails.value.end_time,
      user_name: bookingDetails.value.user.name,
      user_id: bookingDetails.value.user.user_id,
      user_phone: bookingDetails.value.user.phone,
      deposit: bookingDetails.value.cost * 0.4,
      payment_method: bookingDetails.value.paymentMethod,
      payment_type: bookingDetails.value.paymentType,
    };

    console.log(bookingData);
    if (bookingDetails.value.paymentType === "zalopay") {
      try {
        const zaloPayResult = await paymentSerice.createZalopay(bookingData);
        console.log(zaloPayResult);
        const qr_url = zaloPayResult.data.zalopay.order_url;
        window.open(qr_url, '_blank', 'width=500,height=600');
      } catch (error) {
        console.error("Error creating ZaloPay payment:", error);
      }
      // const zaloPayResult = await paymentSerice.createZalopay(bookingData);
      // console.log(zaloPayResult);
      // console.log(zaloPayResult.data);
      // console.log(zaloPayResult.data.zalopay.order_url);
    } else {
      // Proceed with direct booking
      try {
        // await bookingService.createBooking(bookingData);
      } catch (error) {
        console.error("Error creating booking:", error);
      }
    }
    fetchBookings();
    isDialogOpen.value = false;
  }
};

const getBookingForSlot = (fieldId, index, date) => {
  const bookingDate = date || getLocalDate(selectedDate.value);
  return bookings.value[fieldId] && bookings.value[fieldId][bookingDate]
    ? bookings.value[fieldId][bookingDate][index]
    : null;
};

const isBookingStart = (fieldId, index, date) => {
  const booking = getBookingForSlot(fieldId, index, date);
  return booking && booking.start_time.slice(0, 5) === timeSlots[index];
};

const getBookingHeight = (fieldId, index, date) => {
  const booking = getBookingForSlot(fieldId, index, date);
  if (booking) {
    const startIndex = timeSlots.indexOf(booking.start_time.slice(0, 5));
    const endIndex = timeSlots.indexOf(booking.end_time.slice(0, 5));
    const finalEndIndex = endIndex === -1 ? timeSlots.length : endIndex;
    return (finalEndIndex - startIndex) * 48;
  }
  return 48;
};

const fieldOptions = computed(() => {
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

const previousWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() - 7);
  selectedDate.value = date;
};

const nextWeek = () => {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + 7);
  selectedDate.value = date;
};

const setToday = () => {
  selectedDate.value = new Date();
};

// const formatDate = (dateString) => {
//   const date = new Date(dateString);

//   return date.toLocaleDateString("default", { month: "short", day: "numeric" });
// };

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");

  return `${day}/${month}`;
};

const availableEndTimes = computed(() => {
  if (!bookingDetails.value.start_time) return [];
  const startIndex = timeSlots.indexOf(bookingDetails.value.start_time);
  let endTimes = timeSlots.slice(startIndex + 1);

  // Thêm 23:00 vào cuối danh sách nếu chưa có
  if (!endTimes.includes("23:00")) {
    endTimes.push("23:00");
  }

  return endTimes;
});

const isPastTime = (slotIndex, date) => {
  const currentDateTime = new Date();
  const slotDateTime = new Date(date);
  const [hour, minute] = timeSlots[slotIndex].split(":");

  slotDateTime.setHours(parseInt(hour));
  slotDateTime.setMinutes(parseInt(minute));

  return slotDateTime < currentDateTime;
};

const availableStartTimes = computed(() => {
  return timeSlots;
});

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
  padding: 4px;
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  border-radius: 5px;
  border: 1px solid #ccc !important;
  margin-left: 1px;
}

.booking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-start;
  flex-wrap: nowrap;
  align-items: center;
}

#table-booking tr,
#table-booking-week tr {
  height: 48px;
}

#table-booking td,
#table-booking-week td {
  position: relative;
  height: 48px;
}

#table-booking tbody tr:last-child,
#table-booking-week tbody tr:last-child {
  display: none;
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

#table-booking-week td {
  width: calc(100% / 8);
}
</style>
