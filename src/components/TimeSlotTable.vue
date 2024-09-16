<template>
  <v-data-table
    :headers="headers"
    v-if="prices && prices.length"
    :items="prices"
    item-value="id"
    class="elevation-1"
    hide-default-footer
  >
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon color="success" small @click="handleEdit(item)">mdi-pencil</v-icon>
      <v-icon color="error" small @click="handleDelete(item)">mdi-delete</v-icon>
    </template>
  </v-data-table>
</template>

<script setup>
const props = defineProps({
  prices: Array,
});
const emit = defineEmits(["edit", "delete"]);

const headers = [
  { key: "start_time", title: "Start Time" , sortable: false},
  { key: "end_time", title: "End Time" , sortable: false},
  { key: "price", title: "Price (VND)" , sortable: false},
  { key: "actions", title: "Actions", align: "center" , sortable: false},
];

const handleEdit = (item) => {
  emit("edit", item);
};

const handleDelete = (item) => {
  emit("delete", item);
};
</script>

<style scoped>
/* Any specific styles for the table */
</style>
