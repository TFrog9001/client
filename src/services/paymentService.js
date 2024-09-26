import api from "../axios/api";

const paymentSerice = {
    async createZalopay($bookingData) {
        try {
            const response = await api.post('/zalopay', $bookingData);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy khi thanh toán:', error);
            throw error;
        }
    },
}

export default paymentSerice;
