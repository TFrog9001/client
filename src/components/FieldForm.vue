<template>
  <v-card-text>
    <v-form ref="form">
      <v-text-field v-model="localField.name" label="Tên sân" required />
      <v-select
        v-model="localField.type"
        :items="['5', '7', '11']"
        label="Loại sân"
        required
      />
      <v-select
        v-model="localField.status"
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
      @click="handleSave"
      >Save</v-btn
    >
    <v-btn
      prepend-icon="mdi-delete"
      color="error"
      variant="tonal"
      @click="handleDelete"
      >Delete</v-btn
    >
  </v-card-actions>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  field: Object,
});
const emit = defineEmits(["save", "delete"]);
const localField = ref({ ...props.field });

watch(
  () => props.field,
  (newField) => {
    localField.value = { ...newField };
  }
);

const handleSave = () => {
  emit("save", localField.value);
};

const handleDelete = () => {
  emit("delete", localField.value);
};
</script>
