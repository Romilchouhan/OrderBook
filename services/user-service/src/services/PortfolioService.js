const redis = require('redis');

class PortfolioService {
    constructor() {
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect();

        // Demo portfolio data
        this.portfolios = new Map([
            [1, {
                userId: 1,
                totalValue: 125000.50,
                cashBalance: 25000.00,
                dailyPnL: 2500.75,
                totalPnL: 25000.50,
                positions: [
                    {
                        symbol: 'BTC/USD',
                        quantity: 2.5,
                        avgPrice: 45000,
                        currentPrice: 45250.50,
                        marketValue: 113126.25,
                        unrealizedPnL: 626.25,
                        realizedPnL: 1250.00
                    },
                    {
                        symbol: 'ETH/USD',
                        quantity: 10.0,
                        avgPrice: 3100,
                        currentPrice: 3150.25,
                        marketValue: 31502.50,
                        unrealizedPnL: 502.50,
                        realizedPnL: 750.25
                    }
                ],
                lastUpdated: new Date().toISOString()
            }]
        ]);

        // Demo trade history
        this.tradeHistory = new Map([
            [1, [
                {
                    id: 1,
                    symbol: 'BTC/USD',
                    side: 'BUY',
                    quantity: 1.0,
                    price: 44000,
                    value: 44000,
                    fee: 44.00,
                    timestamp: '2024-01-15T10:30:00Z'
                },
                {
                    id: 2,
                    symbol: 'BTC/USD',
                    side: 'BUY',
                    quantity: 1.5,
                    price: 46000,
                    value: 69000,
                    fee: 69.00,
                    timestamp: '2024-01-16T14:20:00Z'
                },
                {
                    id: 3,
                    symbol: 'ETH/USD',
                    side: 'BUY',
                    quantity: 10.0,
                    price: 3100,
                    value: 31000,
                    fee: 31.00,
                    timestamp: '2024-01-17T09:15:00Z'
                }
            ]]
        ]);
    }

    async getPortfolio(userId) {
        try {
            // Try cache first
            const cached = await this.redisClient.get(`portfolio:${userId}`);
            if (cached) {
                return JSON.parse(cached);
            }

            const portfolio = this.portfolios.get(parseInt(userId));
            if (!portfolio) {
                return {
                    userId: parseInt(userId),
                    totalValue: 0,
                    cashBalance: 0,
                    dailyPnL: 0,
                    totalPnL: 0,
                    positions: [],
                    lastUpdated: new Date().toISOString()
                };
            }

            // Cache for 5 minutes
            await this.redisClient.setEx(`portfolio:${userId}`, 300, JSON.stringify(portfolio));

            return portfolio;
        } catch (error) {
            console.error('Get portfolio error:', error);
            throw error;
        }
    }

    async getPositions(userId) {
        try {
            const portfolio = await this.getPortfolio(userId);
            return portfolio.positions || [];
        } catch (error) {
            console.error('Get positions error:', error);
            throw error;
        }
    }

    async getTradeHistory(userId, limit = 50, offset = 0) {
        try {
            const trades = this.tradeHistory.get(parseInt(userId)) || [];

            // Sort by timestamp descending
            const sortedTrades = trades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Apply pagination
            const paginatedTrades = sortedTrades.slice(offset, offset + limit);

            return {
                trades: paginatedTrades,
                total: trades.length,
                limit,
                offset
            };
        } catch (error) {
            console.error('Get trade history error:', error);
            throw error;
        }
    }

    async updatePosition(userId, symbol, quantity, price) {
        try {
            const portfolio = await this.getPortfolio(userId);
            const existingPosition = portfolio.positions.find(p => p.symbol === symbol);

            if (existingPosition) {
                // Update existing position
                const totalQuantity = existingPosition.quantity + quantity;
                const totalValue = (existingPosition.quantity * existingPosition.avgPrice) + (quantity * price);

                existingPosition.quantity = totalQuantity;
                existingPosition.avgPrice = totalValue / totalQuantity;
            } else {
                // Add new position
                portfolio.positions.push({
                    symbol,
                    quantity,
                    avgPrice: price,
                    currentPrice: price,
                    marketValue: quantity * price,
                    unrealizedPnL: 0,
                    realizedPnL: 0
                });
            }

            portfolio.lastUpdated = new Date().toISOString();
            this.portfolios.set(parseInt(userId), portfolio);

            // Update cache
            await this.redisClient.setEx(`portfolio:${userId}`, 300, JSON.stringify(portfolio));

            return portfolio;
        } catch (error) {
            console.error('Update position error:', error);
            throw error;
        }
    }

    async addTrade(userId, trade) {
        try {
            const trades = this.tradeHistory.get(parseInt(userId)) || [];
            trades.push({
                ...trade,
                id: trades.length + 1,
                timestamp: new Date().toISOString()
            });

            this.tradeHistory.set(parseInt(userId), trades);

            return trade;
        } catch (error) {
            console.error('Add trade error:', error);
            throw error;
        }
    }
}

module.exports = PortfolioService;
