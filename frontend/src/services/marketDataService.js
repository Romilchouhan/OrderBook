import api from './api';

class MarketDataService {
    async getMarketData(symbol) {
        try {
            const response = await api.get(`/market-data/${symbol}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch market data' };
        }
    }

    async getSymbols() {
        try {
            const response = await api.get('/symbols');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch symbols' };
        }
    }
}

export default new MarketDataService();
