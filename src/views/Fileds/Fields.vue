<template>
    <v-card>
        <v-card-title>
            Danh sách sân bóng
            <v-spacer></v-spacer>
            <v-btn class="justify-end" color="primary" @click="openDialog('add')">Thêm sân bóng</v-btn>
        </v-card-title>

        <v-data-table :headers="headers" :items="fields" item-value="id" :search="search">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" label="Tìm kiếm" class="custom-search" hide-details solo flat
                        density="comfortable" prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-toolbar>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon color="success" @click="editField(item)">mdi-pencil</v-icon>
                <v-icon color="error" @click="confirmDeleteField(item)">mdi-delete</v-icon>
            </template>
        </v-data-table>
    </v-card>

    <!-- Dialog for Add/Edit Field -->
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                {{ editedField.id ? 'Chỉnh sửa sân bóng' : 'Thêm sân bóng' }}
            </v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <!-- Tên sân -->
                    <v-text-field v-model="editedField.name" label="Tên sân"></v-text-field>
                    <!-- Địa điểm -->
                    <v-text-field v-model="editedField.location" label="Địa điểm"></v-text-field>
                    <!-- Loại sân -->
                    <v-text-field v-model="editedField.type" label="Loại sân"></v-text-field>
                    <!-- Trạng thái -->
                    <v-select v-model="editedField.status" :items="statusOptions" label="Trạng thái"></v-select>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="saveField">Lưu</v-btn>
                <v-btn color="error" @click="closeDialog">Hủy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog for Confirm Delete -->
    <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
            <v-card-title class="headline">Xác nhận xóa</v-card-title>
            <v-card-text>Bạn có chắc chắn muốn xóa sân bóng này?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="deleteField">Xóa</v-btn>
                <v-btn @click="deleteDialog = false">Hủy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import fieldService from '../../services/fieldService';

export default {
    data() {
        return {
            fields: [],
            headers: [
                { title: 'ID', value: 'id' },
                { title: 'Tên', value: 'name' },
                { title: 'Địa điểm', value: 'location' },
                { title: 'Loại sân', value: 'type' },
                { title: 'Trạng thái', value: 'status' },
                { title: 'Hành động', value: 'actions', sortable: false },
            ],
            search: '',
            dialog: false,
            deleteDialog: false,
            editedField: {
                id: null,
                name: '',
                location: '',
                type: '',
                status: '',
            },
            valid: false,
            statusOptions: ['Hoạt động', 'Ngừng hoạt động'],
            selectedField: null,
        };
    },
    created() {
        this.fetchFields();
    },
    methods: {
        async fetchFields() {
            try {
                this.fields = await fieldService.getFields();
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sân bóng:', error);
            }
        },
        openDialog(action, field = null) {
            if (action === 'add') {
                this.editedField = { id: null, name: '', location: '', type: '', status: '' };
            } else if (action === 'edit') {
                this.editedField = { ...field };
            }
            this.dialog = true;
        },
        closeDialog() {
            this.dialog = false;
        },
        async saveField() {
            try {
                if (this.editedField.id) {
                    await fieldService.editField(this.editedField, this.editedField.id);
                } else {
                    await fieldService.addField(this.editedField);
                }
                this.fetchFields();
            } catch (error) {
                console.error('Lỗi khi lưu sân bóng:', error);
            } finally {
                this.closeDialog();
            }
        },
        confirmDeleteField(field) {
            this.selectedField = field;
            this.deleteDialog = true;
        },
        async deleteField() {
            try {
                await fieldService.deleteFieldById(this.selectedField.id);
                this.fetchFields();
            } catch (error) {
                console.error('Lỗi khi xóa sân bóng:', error);
            } finally {
                this.deleteDialog = false;
            }
        },
        editField(field) {
            this.openDialog('edit', field);
        },
    },
};
</script>

<style scoped>
.custom-search {
    max-width: 300px;
    border-radius: 10px;
    border: 1px solid #ccc;
    margin-right: 16px;
}

.v-text-field__details {
    display: none;
}
</style>
