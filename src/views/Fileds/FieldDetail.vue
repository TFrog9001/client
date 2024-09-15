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
    <!-- Nút mở modal để thêm khung giờ -->
    <v-col cols="12">
      <v-btn color="primary" @click="openDialog">+ Add Time Slot</v-btn>
    </v-col>

    <!-- Modal nhập khung giờ mới -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title v-if="selectedTimeSlot" class="text-h6">
          Chỉnh sửa khung giờ
        </v-card-title>

        <v-card-title v-else class="text-h6"> Thêm mới khung giờ </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <!-- Time Slot Form -->
          <v-form ref="timeSlotForm">
            <v-row>
              <!-- Start Time Picker -->
              <v-col cols="6">
                <label> Start time: </label>
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

              <!-- End Time Picker -->
              <v-col cols="6">
                <label>End Time: </label>
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

              <!-- Price Field -->
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

        <!-- Actions: Save and Cancel buttons -->
        <v-card-actions class="justify-end">
          <v-btn color="secondary" text @click="closeDialog">Cancel</v-btn>
          <v-btn v-if="selectedTimeSlot" color="primary" @click="saveTimeSlot"
            >Save</v-btn
          >
          <v-btn v-else color="primary" @click="addTimeSlot">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bảng hiển thị khung giờ -->
    <v-col cols="12">
      <v-card>
        <v-card-title>Schedule Board</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div class="schedule-timeline">
            <div class="time-line" v-for="hour in 18" :key="hour">
              <span>{{ hour + 5 }}:00</span>
              <br />
              <span>|</span>
            </div>
          </div>

          <div class="schedule-board">
            <div
              class="time-slot"
              v-for="(price, index) in field.prices"
              :key="price.id"
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

    <!-- TimeSlotTable Component -->
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

// Fetch field details or initialize for creating a new field
const fetchFieldDetail = async () => {
  const id = route.params.id;
  if (id) {
    // Edit mode - Fetch existing field
    try {
      field.value = await fieldService.getFieldById(id);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sân:", error);
    }
  } else {
    // Create mode - Initialize empty field
    field.value = {
      name: "",
      type: "",
      status: "",
      prices: [],
    };
  }
};

// Save field (Create or Edit)
const saveField = async () => {
  const id = route.params.id;
  try {
    if (id) {
      // Update existing field
      await fieldService.editField(field.value, id);
      showNotification({
        title: "Thông báo",
        message: "Lưu thông tin sân bóng thành công",
        type: "success",
      });
    } else {
      // Create new field
      const response = await fieldService.addField(field.value);
      console.log(response);
      
      showNotification({
        title: "Thông báo",
        message: "Tạo sân bóng mới thành công",
        type: "success",
      });
      router.push({ path: `/fields/${response.id}`});
    }
  } catch (error) {
    console.error("Lỗi khi lưu sân bóng:", error);
  }
};

// Delete field (only for existing fields)
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
///////////////////////////////////// Slot time
// Time Slot management
const openDialog = () => {
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  newTimeSlot.value = { start_time: "", end_time: "", price: 0 };
  selectedTimeSlot.value = null;
};

const addTimeSlot = async () => {
  if (
    !newTimeSlot.value.start_time ||
    !newTimeSlot.value.end_time ||
    newTimeSlot.value.price <= 0
  ) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  field.value.prices.push({ ...newTimeSlot.value });

  field.value.prices.sort((a, b) => {
    const [aHour, aMinute] = a.start_time.split(":").map(Number);
    const [bHour, bMinute] = b.start_time.split(":").map(Number);

    if (aHour !== bHour) {
      return aHour - bHour;
    }
    return aMinute - bMinute;
  });

  closeDialog();
  showNotification({
    title: "Thông báo",
    message: "Khung giờ đã được thêm",
    type: "success",
  });
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

  const updatedSlot = {
    field_id: route.params.id,
    start_time: newTimeSlot.value.start_time,
    end_time: newTimeSlot.value.end_time,
    price: newTimeSlot.value.price,
  };

  if (selectedTimeSlot.value) {
    updatedSlot.id = selectedTimeSlot.value.id;
    await fieldService.updateFieldPrice(updatedSlot);
    showNotification({
      title: "Thông báo",
      message: "Khung giờ đã được cập nhật",
      type: "success",
    });
  } else {
    await fieldService.addFieldPrice(updatedSlot);
    showNotification({
      title: "Thông báo",
      message: "Khung giờ đã được thêm",
      type: "success",
    });
  }

  fetchFieldDetail();
  closeDialog();
};

const editTimeSlot = (item) => {
  selectedTimeSlot.value = { ...item };
  newTimeSlot.value = { ...selectedTimeSlot.value };
  dialog.value = true;
};

const deleteTimeSlot = async (item) => {
  // Xử lý xóa khung giờ từ cơ sở dữ liệu
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa khung giờ này?");
  if (!confirmDelete) return;

  if (!route.params.id) {
    // Tìm vị trí của time slot cần xóa trong mảng prices
    const indexToRemove = field.value.prices.findIndex(
      (slot) =>
        slot.start_time === item.start_time &&
        slot.end_time === item.end_time &&
        slot.price === item.price
    );

    // Nếu tìm thấy, xóa phần tử khỏi mảng
    if (indexToRemove !== -1) {
      field.value.prices.splice(indexToRemove, 1);
      showNotification({
        title: "Thông báo",
        message: "Khung giờ đã được xóa",
        type: "success",
      });
      console.log("Delete time slot locally");
    } else {
      console.log("Không tìm thấy time slot để xóa");
    }

    return;
  }

  try {
    await fieldService.deleteFieldPrice(item.id); // Xóa từ DB theo ID
    showNotification({
      title: "Thông báo",
      message: "Khung giờ đã được xóa",
      type: "success",
    });
    fetchFieldDetail(); // Cập nhật lại chi tiết sân
  } catch (error) {
    console.error("Lỗi khi xóa khung giờ:", error);
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
  grid-template-columns: repeat(36, 1fr);
  grid-gap: 0.5px;
}
.time-slot {
  height: 50px;
  display: block;
  font-size: 14px;
  color: white;
}
.schedule-timeline {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-gap: 0.5px;
}
.time-line {
  display: block;
  font-size: 14px;
}
</style>
