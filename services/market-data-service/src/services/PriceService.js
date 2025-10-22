const redis = require('redis');

class PriceService {
    constructor() {
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect();

        // Initial prices
        this.prices = new Map([
            ['BTC/USD', 45250.50],
            ['ETH/USD', 3150.25],
            ['BNB/USD', 320.75],
            ['ADA/USD', 0.65],
            ['SOL/USD', 98.50],
            ['AAPL', 175.50],
            ['GOOGL', 2750.25],
            ['MSFT', 415.75],
            ['TSLA', 245.30],
            ['AMZN', 3420.80]
        ]);

        this.priceHistory = new Map();
        this.isSimulating = false;
    }

    async getCurrentPrice(symbol) {
        try {
            // Try cache first
            const cached = await this.redisClient.get(`price:${symbol}`);
            if (cached) {
                return parseFloat(cached);
            }

            // Get from memory
            const price = this.prices.get(symbol) || 0;

            // Cache for 1 second
            await this.redisClient.setEx(`price:${symbol}`, 1, price.toString());

            return price;
        } catch (error) {
            console.error('Get current price error:', error);
            return this.prices.get(symbol) || 0;
        }
    }

    async updatePrice(symbol, price) {
        try {
            this.prices.set(symbol, price);

            // Update cache
            await this.redisClient.setEx(`price:${symbol}`, 1, price.toString());

            // Store in history
            await this.storePriceHistory(symbol, price);

            // Broadcast price update
            await this.broadcastPriceUpdate(symbol, price);

        } catch (error) {
            console.error('Update price error:', error);
        }
    }

    async storePriceHistory(symbol, price) {
        try {
            const timestamp = Date.now();
            const historyKey = `price_history:${symbol}`;

            // Store as sorted a set with timestamp as score
            await this.redisClient.zAdd(historyKey, {
                score: timestamp,
                value: JSON.stringify({ price, timestamp })
            });

            // Keep only the last 1000 entries
            await this.redisClient.zRemRangeByRank(historyKey, 0, -1001);

        } catch (error) {
            console.error('Store price history error:', error);
        }
    }

    async getPriceHistory(symbol, interval = '1h', limit = 100) {
        try {
            const historyKey = `price_history:${symbol}`;
            const history = await this.redisClient.zRevRange(historyKey, 0, limit - 1, {
                WITHSCORES: true
            });

            const formattedHistory = [];
            for (let i = 0; i < history.length; i += 2) {
                const data = JSON.parse(history[i]);
                formattedHistory.push({
                    timestamp: data.timestamp,
                    price: data.price,
                    date: new Date(data.timestamp).toISOString()
                });
            }

            return formattedHistory;
        } catch (error) {
            console.error('Get price history error:', error);
            return [];
        }
    }

    async broadcastPriceUpdate(symbol, price) {
        try {
            await this.redisClient.publish('market_data_updates', JSON.stringify({
                type: 'price_update',
                symbol,
                price,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Broadcast price update error:', error);
        }
    }

    startPriceSimulation() {
        if (this.isSimulating) return;

        this.isSimulating = true;
        console.log('Starting price simulation...');

        setInterval(() => {
            this.simulatePriceMovements();
        }, 1000); // Update every second
    }

    simulatePriceMovements() {
        for (const [symbol, currentPrice] of this.prices.entries()) {
            // Generate random price movement (-2% to +2%)
            const changePercent = (Math.random() - 0.5) * 0.04;
            const newPrice = currentPrice * (1 + changePercent);

            // Round to appropriate decimal places
            const roundedPrice = symbol.includes('/')
                ? Math.round(newPrice * 100) / 100  // Crypto: 2 decimals
                : Math.round(newPrice * 100) / 100; // Stocks: 2 decimals

            this.updatePrice(symbol, roundedPrice);
        }
    }

    stopPriceSimulation() {
        this.isSimulating = false;
        console.log('Price simulation stopped');
    }
}

module.exports = PriceService;
