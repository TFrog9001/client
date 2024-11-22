import api from "../axios/api";

const userService = {
    // Lấy danh sách người dùng
    async getUsers() {
        try {
            const response = await api.get('/users');
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách người dùng:', error);
            throw error;
        }
    },
    async getCustomers() {
        try {
            const response = await api.get('/users/customers');
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách khách hàng:', error);
            throw error;
        }
    },

    // Lấy thông tin người dùng theo ID
    async getUserById(id) {
        try {
            const response = await api.get(`/users/${id}`);
            return response;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi lấy người dùng với ID ${id}:`, error);
            throw error;
        }
    },

    // Thêm người dùng mới
    async addUser(user) {
        try {
            const response = await api.post('/users', user);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm người dùng:', error);
            throw error;
        }
    },

    // Chỉnh sửa thông tin người dùng theo ID
    async editUser(user, id) {
        try {
            const response = await api.post(`/users/${id}`, user, {
                headers: {
                    "Content-Type": "multipart/form-data", // Xử lý nếu có tệp
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi chỉnh sửa người dùng với ID ${id}:`, error.message);
            throw error;
        }
    },

    // Xóa người dùng theo ID
    async deleteUserById(id) {
        try {
            const response = await api.delete(`/users/${id}`);
            return response;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi xóa người dùng với ID ${id}:`, error);
            throw error;
        }
    },
}

export default userService;
