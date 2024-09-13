<template>
  <v-data-table
    :headers="headers"
    :items="fields"
    item-value="id"
    class="elevation-1"
    :items-per-page="5"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Danh sách sân bóng</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="addField">Thêm sân</v-btn>
      </v-toolbar>
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <!-- <v-icon color="info" @click="viewField(item)">mdi-eye</v-icon> -->
      <v-icon color="success" @click="viewField(item)">mdi-pencil</v-icon>
      <v-icon color="error" @click="deleteField(item)">mdi-delete</v-icon>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import fieldService from "../../services/fieldService";
import { showNotification } from "../../utils/notification";

const headers = ref([
  { key: "name", title: "Tên sân" },
  { key: "type", title: "Loại sân" },
  { key: "status", title: "Trạng thái" },
  { key: "actions", title: "Hành động", sortable: false },
]);

const fields = ref([]);

const router = useRouter();

const fetchFields = async () => {
  try {
    fields.value = await fieldService.getFields();
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sân:", error);
  }
};

const addField = () => {
  console.log("Thêm sân mới");
};

const editField = (field) => {
  console.log("Chỉnh sửa sân:", field);
};

const deleteField = (field) => {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xóa sân này?");
  if (!confirmDelete) return;

  try {
    fieldService.deleteFieldById(field.id);
    showNotification({
      title: "Thông báo",
      message: `Sân bóng ${field.name} đã được xóa`,
      type: "success",
    });
    fetchFields();
  } catch (error) {
    console.error("Lỗi khi xóa sân:", error);
    alert("Có lỗi xảy ra khi xóa sân");
  }
};

const viewField = (field) => {
  router.push({ name: "FieldDetail", params: { id: field.id } });
};

onMounted(() => {
  fetchFields();
});
</script>

<style scoped>

</style>
