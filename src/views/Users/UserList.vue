<template>
    <v-card>
        <v-card-title>
            Danh sách người dùng
            <v-spacer></v-spacer>
            <v-btn class="justify-end" color="primary" @click="openDialog('add')">Thêm người dùng</v-btn>
        </v-card-title>

        <v-data-table :headers="headers" :items="users" item-value="id" :search="search">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" label="Tìm kiếm" class="custom-search" hide-details solo flat
                        density="comfortable" prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-toolbar>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon color="success" @click="editUser(item)">mdi-pencil</v-icon>
                <v-icon color="error" @click="confirmDeleteUser(item)">mdi-delete</v-icon>
            </template>
        </v-data-table>
    </v-card>

    <!-- Dialog for Add/Edit User -->
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                {{ editedUser.id ? 'Chỉnh sửa người dùng' : 'Thêm người dùng' }}
            </v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <!-- Tên -->
                    <v-text-field v-model="editedUser.name" label="Tên"></v-text-field>
                    <!-- Email -->
                    <v-text-field v-model="editedUser.email" label="Email"></v-text-field>
                    <!-- Điện thoại -->
                    <v-text-field v-model="editedUser.phone" label="Điện thoại"></v-text-field>
                    <!-- Hình ảnh (avatar) -->
                    <v-file-input v-model="editedUser.avatar" label="Chọn hình đại diện"
                        accept="image/*"></v-file-input>
                    <v-img v-if="editedUser.avatar" :src="editedUser.avatar" max-width="100" class="mt-3"></v-img>
                    <!-- Mật khẩu -->
                    <v-text-field v-model="password" label="Mật khẩu" type="password"></v-text-field>
                    <!-- Xác nhận mật khẩu -->
                    <v-text-field v-model="confirmPassword" label="Xác nhận mật khẩu" type="password"></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="saveUser">Lưu</v-btn>
                <v-btn color="error" @click="closeDialog">Hủy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog for Confirm Delete -->
    <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
            <v-card-title class="headline">Xác nhận xóa</v-card-title>
            <v-card-text>Bạn có chắc chắn muốn xóa người dùng này?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="deleteUser">Xóa</v-btn>
                <v-btn @click="deleteDialog = false">Hủy</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import userService from '../../services/userService';

export default {
    data() {
        return {
            users: [],
            headers: [
                { title: 'ID', value: 'id' },
                { title: 'Name', value: 'name' },
                { title: 'Email', value: 'email' },
                { title: 'Phone number', value: 'phone' },
                { title: 'Actions', value: 'actions', sortable: false },
            ],
            search: '',
            dialog: false,
            deleteDialog: false,
            editedUser: {
                id: null,
                name: '',
                email: '',
                phone: '',
                avatar: null,
            },
            password: '',
            confirmPassword: '',
            selectedUser: null,
            valid: false,
        };
    },
    created() {
        this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            try {
                this.users = await userService.getUsers();
            } catch (error) {
                console.error('Lỗi khi lấy danh sách người dùng:', error);
            }
        },
        openDialog(action, user = null) {
            if (action === 'add') {
                this.editedUser = { id: null, name: '', email: '', phone: '', avatar: null };
                this.password = '';
                this.confirmPassword = '';
            } else if (action === 'edit') {
                this.editedUser = { ...user };
            }
            this.dialog = true;
        },
        closeDialog() {
            this.dialog = false;
        },
        async saveUser() {
            if (this.password !== this.confirmPassword) {
                alert('Mật khẩu và Xác nhận mật khẩu không khớp');
                return;
            }
            try {
                if (this.editedUser.id) {
                    await userService.editUser({ ...this.editedUser, password: this.password }, this.editedUser.id);
                    this.fetchUsers();
                } else {
                    await userService.addUser({ ...this.editedUser, password: this.password });
                    this.fetchUsers();
                }
            } catch (error) {
                console.error('Lỗi khi lưu người dùng:', error);
            } finally {
                this.closeDialog();
            }
        },
        confirmDeleteUser(user) {
            this.selectedUser = user;
            this.deleteDialog = true;
        },
        async deleteUser() {
            try {
                await userService.deleteUserById(this.selectedUser.id);
                this.fetchUsers();
            } catch (error) {
                console.error('Lỗi khi xóa người dùng:', error);
            } finally {
                this.deleteDialog = false;
            }
        },
        editUser(user) {
            this.openDialog('edit', user);
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