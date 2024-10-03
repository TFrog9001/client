import api from "../axios/api";

const chatService = {
    // async sendMessage(message) {
    //     try {
    //         const response = await api.post('/send-message', {
    //             message
    //           });
    //         return response;
    //     } catch (error) {
    //         console.error('Có lỗi xảy khi thanh toán:', error);
    //         throw error;
    //     }
    // },
    async sendMessage(message, bookingId) {
        try {
            const response = await api.post(
                `/booking/${bookingId}/conversations/${conversations}/messages`,
                { message },
            );
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi gửi tin nhắn:', error);
            throw error;
        }
    },
}

export default chatService;
