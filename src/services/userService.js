import api from "../axios/api";

export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data.users;
    } catch (error) {
        console.error('Có lỗi xảy ra khi lấy danh sách người dùng:', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.user;
    } catch (error) {
        console.error(`Có lỗi xảy ra khi lấy người dùng với ID ${id}:`, error);
        throw error;
    }
};