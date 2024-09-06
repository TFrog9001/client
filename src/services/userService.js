import api from "../axios/api";

const userService = {
    // Lấy danh sách người dùng
    async getUsers() {
        try {
            const response = await api.get('/users');
            return response.data.users;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách người dùng:', error);
            throw error;
        }
    },

    // Lấy thông tin người dùng theo ID
    async getUserById(id) {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data.user;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi lấy người dùng với ID ${id}:`, error);
            throw error;
        }
    },

    // Thêm người dùng mới
    async addUser(user) {
        try {
            const response = await api.post('/users', user);
            return response.data.user;
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm người dùng:', error);
            throw error;
        }
    },

    // Chỉnh sửa thông tin người dùng theo ID
    async editUser(user, id) {
        try {
            const response = await api.put(`/users/${id}`, user);
            return response.data.user;
        } catch (error) {
            console.error('Có lỗi xảy ra khi chỉnh sửa người dùng:', error);
            throw error;
        }
    },

    // Xóa người dùng theo ID
    async deleteUserById(id) {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data.user;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi xóa người dùng với ID ${id}:`, error);
            throw error;
        }
    },
}

export default userService;
