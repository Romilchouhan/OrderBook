const redis = require('redis');

class MarketDataService {
    constructor(priceService) {
        this.priceService = priceService;
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect();

        this.symbols = [
            'BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD',
            'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'
        ];

        // Initialize market stats
        this.initializeMarketStats();
    }

    async initializeMarketStats() {
        const initialStats = {
            'BTC/USD': {
                high24h: 46100.00,
                low24h: 43800.00,
                volume24h: 234567.89,
                priceChange24h: 1250.75,
                priceChangePercent24h: 2.84
            },
            'ETH/USD': {
                high24h: 3280.00,
                low24h: 3050.00,
                volume24h: 567890.12,
                priceChange24h: -125.50,
                priceChangePercent24h: -3.83
            },
            'AAPL': {
                high24h: 178.50,
                low24h: 172.00,
                volume24h: 89234567,
                priceChange24h: 2.25,
                priceChangePercent24h: 1.29
            }
        };

        for (const [symbol, stats] of Object.entries(initialStats)) {
            await this.redisClient.setEx(
                `market_stats:${symbol}`,
                3600,
                JSON.stringify(stats)
            );
        }
    }

    async getMarketData(symbol) {
        try {
            const currentPrice = await this.priceService.getCurrentPrice(symbol);
            const stats = await this.getMarketStats(symbol);

            return {
                symbol,
                price: currentPrice,
                ...stats,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Get market data error:', error);
            throw error;
        }
    }

    async getMarketStats(symbol) {
        try {
            const cached = await this.redisClient.get(`market_stats:${symbol}`);
            if (cached) {
                return JSON.parse(cached);
            }

            // Default stats if not found
            return {
                high24h: 0,
                low24h: 0,
                volume24h: 0,
                priceChange24h: 0,
                priceChangePercent24h: 0
            };
        } catch (error) {
            console.error('Get market stats error:', error);
            throw error;
        }
    }

    async getPriceHistory(symbol, interval = '1h', limit = 100) {
        try {
            return await this.priceService.getPriceHistory(symbol, interval, limit);
        } catch (error) {
            console.error('Get price history error:', error);
            throw error;
        }
    }

    async getSymbols() {
        return this.symbols.map(symbol => ({
            symbol,
            type: symbol.includes('/') ? 'crypto' : 'stock',
            isActive: true
        }));
    }

    async getWatchlist(userId) {
        try {
            const watchlist = await this.redisClient.sMembers(`watchlist:${userId}`);
            const watchlistData = [];

            for (const symbol of watchlist) {
                const marketData = await this.getMarketData(symbol);
                watchlistData.push(marketData);
            }

            return watchlistData;
        } catch (error) {
            console.error('Get watchlist error:', error);
            return [];
        }
    }

    async addToWatchlist(userId, symbol) {
        try {
            await this.redisClient.sAdd(`watchlist:${userId}`, symbol);
            return true;
        } catch (error) {
            console.error('Add to watchlist error:', error);
            return false;
        }
    }

    async removeFromWatchlist(userId, symbol) {
        try {
            await this.redisClient.sRem(`watchlist:${userId}`, symbol);
            return true;
        } catch (error) {
            console.error('Remove from watchlist error:', error);
            return false;
        }
    }
}

module.exports = MarketDataService;
