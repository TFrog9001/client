<template>
    <v-data-table :headers="headers" :items="fields" item-value="id" class="elevation-1" :items-per-page="5">
        <template v-slot:top>
            <v-toolbar flat>
                <v-toolbar-title>Danh sách sân bóng</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="addField">Thêm sân</v-btn>
            </v-toolbar>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="info" @click="viewField(item)">mdi-eye</v-icon>
            <v-icon color="success" @click="editField(item)">mdi-pencil</v-icon>
            <v-icon color="error" @click="deleteField(item)">mdi-delete</v-icon>
        </template>
    </v-data-table>
</template>

<script>
import fieldService from '../../services/fieldService';

export default {
    data() {
        return {
            headers: [
                { key: 'name', title: 'Tên sân' },
                { key: 'type', title: 'Loại sân' },
                { key: 'status', title: 'Trạng thái' },
                { key: 'actions', title: 'Hành động', sortable: false },
            ],
            fields: [], // Data sẽ được nạp từ API
        };
    },
    methods: {
        async fetchFields() {
            try {
                this.fields = await fieldService.getFields();
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sân:', error);
            }
        },
        addField() {
            // Xử lý thêm sân
            console.log('Thêm sân mới');
        },
        editField(field) {
            // Xử lý chỉnh sửa sân
            console.log('Chỉnh sửa sân:', field);
        },
        deleteField(field) {
            // Xử lý xóa sân
            console.log('Xóa sân:', field);
        },
        viewField(field) {
            this.$router.push({ name: 'FieldDetail', params: { id: field.id } });
        },
    },
    mounted() {
        this.fetchFields();
    },
};
</script>

<style scoped>
.v-data-table__th {
    text-transform: uppercase !important;
    font-size: medium !important;
    font-weight: bold !important;
}
</style>