<template>
  <v-row>
    <v-col cols="6">
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="field.name"
            label="Tên sân"
            required
            variant="outlined"
          />
          <v-select
            v-model="field.type"
            :items="['5', '7', '11']"
            label="Loại sân"
            required
            variant="outlined"
          />
          <v-select
            v-model="field.status"
            :items="['Hoạt động', 'Đang sửa chữa', 'Không hoạt động']"
            label="Trạng thái"
            required
            variant="outlined"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn
          prepend-icon="mdi-content-save"
          color="primary"
          variant="tonal"
          @click="saveField"
        >
          {{ route.params.id ? "Save" : "Create" }}
        </v-btn>
        <v-btn
          v-if="route.params.id"
          prepend-icon="mdi-delete"
          color="error"
          variant="tonal"
          @click="deleteField"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-col>
  </v-row>

  <hr class="mb-4" style="border: 1px black solid" />

  <v-row>
    <v-col cols="12">
      <v-btn color="primary" @click="openDialog">+ Add Time Slot</v-btn>
    </v-col>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6">
          {{ selectedTimeSlot ? "Chỉnh sửa khung giờ" : "Thêm mới khung giờ" }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-form ref="timeSlotForm">
            <v-row>
              <v-col cols="6">
                <label>Start time:</label>
                <TimePicker
                  v-model="newTimeSlot.start_time"
                  format="HH:mm"
                  :minute-interval="30"
                  manual-input
                  close-on-complete
                  placeholder="Giờ bắt đầu"
                  :hour-range="[[6, 23]]"
                  hide-disabled-items
                  required
                />
              </v-col>

              <v-col cols="6">
                <label>End Time:</label>
                <TimePicker
                  v-model="newTimeSlot.end_time"
                  format="HH:mm"
                  :minute-interval="30"
                  manual-input
                  close-on-complete
                  placeholder="Giờ kết thúc"
                  :hour-range="[[6, 23]]"
                  hide-disabled-items
                  required
                />
              </v-col>

              <v-col cols="12" class="mb-4">
                <v-text-field
                  v-model="newTimeSlot.price"
                  label="Giá (VND)"
                  type="number"
                  required
                  outlined
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="justify-end">
          <v-btn color="secondary" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveTimeSlot">
            {{ selectedTimeSlot ? "Save" : "Add" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-col cols="12">
      <v-card>
        <v-card-title>Schedule Board</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div class="schedule-timeline">
            <div class="time-line" v-for="hour in 17" :key="hour">
              <span>{{ hour + 5 }}:00</span>
              <span>|</span>
            </div>
          </div>

          <div class="schedule-board">
            <div
              class="time-slot"
              v-for="(price, index) in field.prices"
              :key="price.index"
              :style="getTimeSlotStyle(price, index)"
            >
              <span>{{ price.price }} VND</span>
              <br />
              <span>{{ price.start_time }} - {{ price.end_time }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <TimeSlotTable
        :prices="field.prices"
        @edit="editTimeSlot"
        @delete="deleteTimeSlot"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import fieldService from "../../services/fieldService";
import TimeSlotTable from "../../components/TimeSlotTable.vue";
import { showNotification } from "../../utils/notification";
import TimePicker from "vue3-timepicker";
import "vue3-timepicker/dist/VueTimepicker.css";

const route = useRoute();
const router = useRouter();
const field = ref({});
const form = ref(null);
const dialog = ref(false);
const newTimeSlot = ref({ start_time: "", end_time: "", price: 0 });
const selectedTimeSlot = ref(null);
const colorPalette = ["blue", "green", "orange", "purple", "teal"];

const fetchFieldDetail = async () => {
  const id = route.params.id;
  if (id) {
    try {
      const { data } = await fieldService.getFieldById(id);
      field.value = data;
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sân:", error);
    }
  } else {
    field.value = {
      name: "",
      type: "",
      status: "",
      prices: [],
    };
  }
};

const saveField = async () => {
  try {
    if (route.params.id) {
      await fieldService.editField(field.value, route.params.id);
      showNotification({
        title: "Thông báo",
        message: "Lưu thông tin sân bóng thành công",
        type: "success",
      });
    } else {
      const response = await fieldService.addField(field.value);
      showNotification({
        title: "Thông báo",
        message: "Tạo sân bóng mới thành công",
        type: "success",
      });

      router.push({ path: `/fields/${response.data.id}` });
    }
  } catch (error) {
    console.error("Lỗi khi lưu sân bóng:", error);
  }
};

const deleteField = async () => {
  try {
    await fieldService.deleteFieldById(route.params.id);
    showNotification({
      title: "Thông báo",
      message: "Sân bóng đã được xóa thành công",
      type: "success",
    });
    router.push({ path: "/fields" });
  } catch (error) {
    console.error("Lỗi khi xóa sân bóng:", error);
  }
};

const openDialog = () => {
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  newTimeSlot.value = { start_time: "", end_time: "", price: 100000 };
  selectedTimeSlot.value = null;
};

const saveTimeSlot = async () => {
  if (
    !newTimeSlot.value.start_time ||
    !newTimeSlot.value.end_time ||
    newTimeSlot.value.price <= 0
  ) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  const start = newTimeSlot.value.start_time.split(":").map(Number);
  const end = newTimeSlot.value.end_time.split(":").map(Number);

  if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
    alert("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
    return;
  }

  try {
    const payload = {
      start_time: newTimeSlot.value.start_time,
      end_time: newTimeSlot.value.end_time,
      price: newTimeSlot.value.price,
    };

    if (route.params.id) {
      payload.field_id = route.params.id;
      if (selectedTimeSlot.value) {
        payload.id = selectedTimeSlot.value.id;

        await fieldService.updateFieldPrice(payload);
        showNotification({
          title: "Thông báo",
          message: "Khung giờ đã được cập nhật",
          type: "success",
        });
      } else {
        await fieldService.addFieldPrice(payload);
        showNotification({
          title: "Thông báo",
          message: "Khung giờ đã được thêm",
          type: "success",
        });
      }
      fetchFieldDetail();
    } else {
      if (selectedTimeSlot.value) {
        const index = field.value.prices.findIndex(
          (slot) =>
            slot.start_time === selectedTimeSlot.value.start_time &&
            slot.end_time === selectedTimeSlot.value.end_time
        );
        if (index !== -1) {
          field.value.prices.splice(index, 1, { ...payload });
        }
      } else {
        field.value.prices.push({ ...payload });
      }

      field.value.prices.sort((a, b) => {
        const [aHour, aMinute] = a.start_time.split(":").map(Number);
        const [bHour, bMinute] = b.start_time.split(":").map(Number);
        return aHour - bHour || aMinute - bMinute;
      });
    }
  } catch (error) {
    console.error("Lỗi khi lưu khung giờ:", error);
  }

  closeDialog();
};

const editTimeSlot = (slot) => {
  newTimeSlot.value = { ...slot };
  selectedTimeSlot.value = slot;
  openDialog();
};

const deleteTimeSlot = async (slot) => {
  if (route.params.id && slot.id) {
    try {
      await fieldService.deleteFieldPrice(slot.id);
      fetchFieldDetail();
      showNotification({
        title: "Thông báo",
        message: "Khung giờ đã được xóa",
        type: "success",
      });
    } catch (error) {
      console.error("Lỗi khi xóa khung giờ:", error);
    }
  } else {
    const index = field.value.prices.findIndex(
      (price) =>
        price.start_time === slot.start_time && price.end_time === slot.end_time
    );
    if (index !== -1) {
      field.value.prices.splice(index, 1);
    }
  }
};

const getTimeSlotStyle = (timeSlot, index) => {
  const [startHour, startMinute] = timeSlot.start_time.split(":").map(Number);
  const [endHour, endMinute] = timeSlot.end_time.split(":").map(Number);

  const startGridColumn =
    (startHour - 6) * 2 + Math.floor(startMinute / 30) + 1;
  const endGridColumn = (endHour - 6) * 2 + Math.floor(endMinute / 30) + 1;

  const backgroundColor = colorPalette[index % colorPalette.length];

  return {
    gridColumn: `${startGridColumn} / ${endGridColumn}`,
    backgroundColor: backgroundColor,
    color: "white",
    textAlign: "center",
    padding: "5px",
    borderRadius: "5px",
  };
};

onMounted(fetchFieldDetail);
</script>

<style scoped>
.schedule-board {
  display: grid;
  grid-template-columns: repeat(34, 1fr);
  grid-gap: 0.5px;
}
.time-slot {
  height: 65px;
  display: block;
  font-size: 14px;
  color: white;
}
.schedule-timeline {
  display: grid;
  grid-template-columns: repeat(17, 1fr);
  grid-gap: 0.5px;
}
.time-line {
  display: flex;
  font-size: 14px;
  flex-direction: column;
}
</style>
