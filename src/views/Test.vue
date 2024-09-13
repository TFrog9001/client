<template>
  <v-row>
    <v-col cols="6">
      <v-card-text>
        <v-form ref="form">
          <v-text-field v-model="field.name" label="Tên sân" required />
          <v-select
            v-model="field.type"
            :items="['5', '7', '11']"
            label="Loại sân"
            required
          />
          <v-select
            v-model="field.status"
            :items="['Hoạt động', 'Đang sửa chữa', 'Không hoạt động']"
            label="Trạng thái"
            required
          />
        </v-form>
      </v-card-text>

      <!-- Nút hành động cho phần thông tin sân -->
      <v-card-actions>
        <v-btn
          prepend-icon="mdi-content-save"
          color="primary"
          variant="tonal"
          @click="saveField"
          >Save</v-btn
        >
        <v-btn
          prepend-icon="mdi-delete"
          color="error"
          variant="tonal"
          @click="deleteField"
          >Delete</v-btn
        >
      </v-card-actions>
    </v-col>
  </v-row>
  <hr class="mb-4" style="border: 1px black solid" />
  <v-row>
    <v-col cols="12">
      <v-btn color="primary" @click="addTimeSlot">+ Add Time Slot</v-btn>
    </v-col>

    <!-- Schedule Board -->
    <v-col cols="12">
      <v-card>
        <v-card-title>Schedule Board</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div class="schedule-board">
            <div class="time-line" v-for="n in 18">
              {{ n + 5 }}:00
              <br />
              |
            </div>
          </div>
          <div class="schedule-board">
            <div
              class="time-slot"
              v-for="price in field.prices"
              :key="price.id"
              :style="getTimeSlotStyle(price)"
            >
              <span>{{ price.price }} VND</span>
              <br />
              <span>{{ price.start_time }} - {{ price.end_time }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Table of Time Slots -->
    <v-col cols="12">
      <v-data-table
        :headers="headers"
        v-if="field.prices && field.prices.length"
        :items="field.prices"
        item-value="id"
        class="elevation-1"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small @click="editTimeSlot(item)"> mdi-pencil </v-icon>
          <v-icon small @click="deleteTimeSlot(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { useRoute, useRouter } from "vue-router";
import fieldService from "../services/fieldService";
// import Calendar from "../../components/Calendar.vue";

const field = ref({});
const form = ref(null);

const fetchFieldDetail = async () => {
  // const id = route.params.id;
  const id = 1;
  try {
    const fieldData = await fieldService.getFieldById(id);
    field.value = fieldData;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sân:", error);
  }
};

// const timeSlots = ref([
//   { id: 1, start: "09:00", end: "11:00", price: 100, color: "green" },
//   { id: 2, start: "13:00", end: "15:00", price: 120, color: "blue" },
//   { id: 3, start: "18:00", end: "20:00", price: 160, color: "orange" },
//   { id: 4, start: "21:00", end: "22:00", price: 30, color: "purple" },
// ]);

const headers = [
  { key: "start_time", title: "Start Time" },
  { key: "end_time", title: "End Time" },
  { key: "price", title: "Price (VND)" },
  { key: "actions", title: "Actions", align: "center" },
];

const addTimeSlot = () => {
  // Logic thêm slot thời gian mới
};

const editTimeSlot = (item) => {
  // Logic sửa slot thời gian
};

const deleteTimeSlot = (item) => {
  // Logic xóa slot thời gian
};

const getTimeSlotStyle = (timeSlot) => {
  const startHour = parseInt(timeSlot.start_time.split(":")[0]);
  const endHour = parseInt(timeSlot.end_time.split(":")[0]);

  // Điều chỉnh để khung giờ bắt đầu từ 6:00 (startHour - 6)
  const startGridColumn = startHour - 6 + 1; // Bắt đầu từ cột thứ 1
  const endGridColumn = endHour - 6 + 1; // Kết thúc đúng cột

  return {
    gridColumn: `${startGridColumn} / ${endGridColumn}`,
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
    padding: "5px",
    borderRadius: "5px",
  };
};

onMounted(() => {
  fetchFieldDetail();
});
</script>

<style scoped>
.schedule-board {
  display: grid;
  grid-template-columns: repeat(18, 1fr); /* 18 cột cho 6h - 24h */
  grid-gap: 5px;
}

.time-slot {
  height: 50px;
  display: block;
  font-size: 14px;
  color: white;
}
.time-line {
  display: block;
  font-size: 14px;
}
</style>
