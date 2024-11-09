import api from "../axios/api";

const serviceService = {

    async getRoles() {
        const response = await api.get(`/roles`);
        return response;
    },

    async getServices() {
        try {
            const response = await api.get(`/services`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy dịch vụ', error);
            throw error;
        }
    },

    async createService(data) {
        try {
            const response = await api.post(`/services`, data);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi tạo dịch vụ', error);
            throw error;
        }
    },

    async updateService(id, data) {
        try {
            const response = await api.post(`/services/${id}`, data);
            return response;

        } catch (error) {
            console.error('Có lỗi xảy ra khi cập nhập dịch vụ', error);
            throw error;
        }
    },

    async deleteService(id) {
        try {
            const response = await api.delete(`/services/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi xóa dịch vụ', error);
            throw error;
        }
    }
}

export default serviceService;
