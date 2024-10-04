import api from "../axios/api";

const chatService = {
    async getMessages(bookingId) {
        try {
            const response = await api.get(`/bookings/${bookingId}/messages`)
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy tin nhắn:', error);
            throw error;
        }
    },
    async sendMessage(message, bookingId, user_id) {
        try {
            const response = await api.post(
                `/bookings/${bookingId}/messages`,
                {
                    message: message,
                    booking_id: bookingId,
                    user_id: user_id
                }
            );
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi gửi tin nhắn:', error);
            throw error;
        }
    },
}

export default chatService;
