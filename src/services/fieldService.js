import api from "../axios/api";

const fieldService = {
    // Lấy danh sách sân bóng
    async getFields() {
        try {
            const response = await api.get('/fields');
            return response.data;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách sân bóng:', error);
            throw error;
        }
    },

    // Lấy thông tin sân bóng theo ID
    async getFieldById(id) {
        try {
            const response = await api.get(`/fields/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi lấy sân bóng với ID ${id}:`, error);
            throw error;
        }
    },

    // Thêm sân bóng mới
    async addField(field) {
        try {
            const response = await api.post('/fields', field);
            return response.data;
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm sân bóng:', error);
            throw error;
        }
    },

    // Chỉnh sửa thông tin sân bóng theo ID
    async editField(field, id) {
        try {
            const response = await api.post(`/fields/${id}`, field);
            return response.data;
        } catch (error) {
            console.error('Có lỗi xảy ra khi chỉnh sửa sân bóng:', error);
            throw error;
        }
    },

    // Xóa sân bóng theo ID
    async deleteFieldById(id) {
        try {
            const response = await api.delete(`/fields/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi xóa sân bóng với ID ${id}:`, error);
            throw error;
        }
    },

    // Thêm time slot
    async addFieldPrice(price){
        try {
            const response = await api.post('prices', price)
            return response.data;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi thêm khung giờ:`, error);
            throw error;
        }
    },

    // update time slot
    async updateFieldPrice(price){
        try {
            const response = await api.post(`/prices/${price.id}`, price)
            return response.data;
        } catch (error) {
            console.error(`Có lỗi xãy ra khi cập nhập khung giờ:`, error);
            throw error;
        }
    },

    async deleteFieldPrice(id){
        try {
            const response = await api.delete(`/prices/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Có lỗi xảy ra khi xóa khung giờ:`, error);
            throw error;
        }
    }
}

export default fieldService;
