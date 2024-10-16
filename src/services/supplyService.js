import api from "../axios/api";

const supplyService = {
    async getSupplyBySN(sn) {
        try {        
            const response = await api.get(`/supplies/${sn}`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy sản phẩm', error);
            throw error;
        }
    },

    async getSupplies() {
        try {        
            const response = await api.get(`/supplies`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy sản phẩm', error);
            throw error;
        }
    },
}

export default supplyService;
