import api from "../axios/api";

const bookingService = {
    async getBookings(booking_date) {
        try {
            const response = await api.get('/bookings', {
                params: { booking_date }
            });
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy danh sách bookings:', error);
            throw error;
        }
    },
    async getBookingById(id) {
        try {
            const response = await api.get(`/bookings/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy booking:', error);
            throw error;
        }
    },
    async getUserBooking(userId) {
        try {
            const response = await api.get(`/user-booking/${userId}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy bookings của user:', error);
            throw error;
        }
    },
    async createBooking(booking) {
        try {
            const response = await api.post('/bookings', booking);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi tạo booking', error);
            throw error;
        }
    },
}

export default bookingService;
