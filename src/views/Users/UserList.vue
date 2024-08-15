<template>
    <div>
        <h1>Danh Sách Người Dùng</h1>
        <el-table :data="users" style="width: 100%">
            <el-table-column prop="id" label="ID" width="50">
            </el-table-column>
            <el-table-column prop="name" label="Tên Người Dùng" width="150">
            </el-table-column>
            <el-table-column prop="email" label="Email">
            </el-table-column>
            <el-table-column prop="phone" label="Số Điện Thoại">
                <template #default="scope">
                    <span>{{ scope.row.phone || 'Không có số điện thoại' }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="role_id" label="ID Vai Trò" width="100">
            </el-table-column>
            <el-table-column prop="created_at" label="Ngày Tạo">
                <template #default="scope">
                    <span>{{ new Date(scope.row.created_at).toLocaleString() }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { getUsers } from '../../services/userService';

export default {
    data() {
        return {
            users: []
        };
    },
    async mounted() {
        try {
            this.users = await getUsers();
            console.log(this.users);
            
            
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách người dùng:', error);
        }
    }
};
</script>

<style>
/* Bạn có thể thêm CSS tùy chỉnh ở đây nếu cần */
</style>