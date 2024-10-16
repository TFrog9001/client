import api from "../axios/api";

const billService = {
    async getBillByBookingId(id) {
        try {        
            const response = await api.get(`/bills`, {
                params:{
                    booking_id: id
                }
            })
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi bill', error);
            throw error;
        }
    },
    async addItems(bill_id,items) {
        try {        
            const response = await api.post(`/bills/addItems`, {
                bill_id: bill_id,
                items: items
            })
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi thêm sẩn phẩm', error);
            throw error;
        }
    },

    async getBillSupplies(id) {
        try {        
            const response = await api.get(`/bills/details/${id}`);
            return response;
        } catch (error) {
            console.error('Có lỗi xảy ra khi bill', error);
            throw error;
        }
    },
}

export default billService;
