<template>
  <v-dialog
    v-model="props.isDialogOpen"
    @input="$emit('update:isDialogOpen', $event)"
    width="700px"
  >
    <v-card>
      <v-card-title class="bg-teal-darken-2">
        <v-icon class="mr-2">mdi-cogs</v-icon>
        CHỌN DỊCH VỤ</v-card-title
      >
      <v-alert
        v-if="errorMessage"
        type="warning"
        dismissible
        variant="outlined"
        class="mx-4 mt-2"
        @input="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
      <v-list>
        <v-list-item class="m-0" v-for="service in services" :key="service.id">
          <v-row align="center">
            <v-col>
              <v-checkbox
                class="text-font-weight-bold"
                :label="`${service.service} (${
                  service.description
                }) - ${formatCurrency(service.fee)} VND`"
                v-model="selectedServices"
                :value="service.id"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row v-if="selectedServices.includes(service.id)">
            <div class="ml-4">Chọn một nhân viên:</div>
          </v-row>
          <v-row v-if="selectedServices.includes(service.id)">
            <div class="staff-cards">
              <v-card
                v-for="staff in service.staffs"
                :key="staff.id"
                class="staff-card"
                :color="
                  selectedStaff[service.id] === staff.id ? 'primary' : 'white'
                "
                @click="selectStaff(service.id, staff.id)"
                outlined
              >
                <v-img
                  :src="
                    staff.avatar ||
                    'https://cdn3.iconfinder.com/data/icons/business-avatar-1/512/3_avatar-512.png'
                  "
                  height="100"
                  contain
                  class="mt-2"
                ></v-img>
                <v-card-subtitle class="text-subtitle-2">{{
                  staff.name
                }}</v-card-subtitle>
              </v-card>
            </div>
          </v-row>
          <v-divider></v-divider>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn
          color="green-darken-2"
          variant="outlined"
          @click="submitSelectedServices"
          >Xác Nhận</v-btn
        >
        <v-btn
          color="deep-orange-darken-2"
          variant="outlined"
          @click="closeDialog"
          >Đóng</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  services: {
    type: Array,
    required: true,
  },
  isDialogOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits();

const selectedServices = ref([]);
const selectedStaff = ref({});
const errorMessage = ref("");

const formatCurrency = (value) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(value).replace("₫", "");
};

const selectStaff = (serviceId, staffId) => {
  selectedStaff.value[serviceId] =
    selectedStaff.value[serviceId] === staffId ? null : staffId;
};

const submitSelectedServices = () => {
  const missingStaff = selectedServices.value.some(
    (serviceId) => !selectedStaff.value[serviceId]
  );

  if (missingStaff) {
    errorMessage.value = "Vui lòng chọn nhân viên cho mỗi dịch vụ đã chọn.";
    return;
  }

  const result = selectedServices.value.map((serviceId) => {
    const service = props.services.find((s) => s.id === serviceId);
    const staffId = selectedStaff.value[serviceId];
    const staff = service.staffs.find((s) => s.id === staffId);

    return {
      serviceName: service.service,
      fee: service.fee,
      staffName: staff.name,
      staffAvatar: staff.avatar,
      staff_id: staff.id,
      service_id: service.id
    };
  });
  emit("select", result);
  closeDialog();
};

const closeDialog = () => {
  const missingStaff = selectedServices.value.some(
    (serviceId) => !selectedStaff.value[serviceId]
  );

  if (missingStaff) {
    errorMessage.value = "Vui lòng chọn nhân viên cho mỗi dịch vụ đã chọn.";
    return;
  }
  errorMessage.value = "";
  emit("update:isDialogOpen", false);
  emit("close");
};
</script>

<style scoped>
.staff-cards {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
}

.staff-card {
  border: 1px solid;
  margin: 8px;
  cursor: pointer;
  text-align: center;
  width: 135px;
}
</style>
