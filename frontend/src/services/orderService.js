import api from './api';

class OrderService {
    async placeOrder(orderData) {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to place order' };
        }
    }

    async cancelOrder(orderId) {
        try {
            const response = await api.delete(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to cancel order' };
        }
    }

    async getUserOrders(userId) {
        try {
            const response = await api.get(`/orders/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch orders' };
        }
    }

    async getOrderBook(symbol) {
        try {
            const response = await api.get(`/orderbook/${symbol}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch order book' };
        }
    }
}

export default new OrderService();
