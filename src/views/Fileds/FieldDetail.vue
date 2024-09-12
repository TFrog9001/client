<template>
  <v-card>
    <v-card-title>{{ field.name }} - Chi tiết sân</v-card-title>
    <v-card-subtitle>Loại sân: {{ field.type }}</v-card-subtitle>
    <v-card-subtitle>Trạng thái: {{ field.status }}</v-card-subtitle>

    <v-card-text>
      <!-- Truyền prop 'prices' vào Calendar -->
      <Calendar v-if="field.prices && field.prices.length" :prices="field.prices" />
    </v-card-text>

    <v-card-actions>
      <v-btn @click="goBack" color="primary">Quay lại</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import fieldService from "../../services/fieldService";
import Calendar from "../../components/Calendar.vue";

// Declare reactive state
const field = ref({});

// Access route and router
const route = useRoute();
const router = useRouter();

// Fetch field details
const fetchFieldDetail = async () => {
  const id = route.params.id;
  try {
    const fieldData = await fieldService.getFieldById(id);
    field.value = fieldData;
    console.log(field.value);
  } catch (error) {
    console.error("Lỗi khi tải chi tiết sân:", error);
  }
};

// Handle go back action
const goBack = () => {
  router.back();
};

// Fetch field details when component is mounted
onMounted(() => {
  fetchFieldDetail();
});
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
