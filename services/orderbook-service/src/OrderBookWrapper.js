const { spawn } = require('child_process');
const redis = require('redis');
const EventEmitter = require('events');

class OrderBookWrapper extends EventEmitter {
    constructor() {
        super();
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect();

        this.isReady = false;
        this.orderIdCounter = 1;
        this.activeOrders = new Map();

        // For demo purposes, we'll simulate the C++ OrderBook
        // In production, this would spawn your actual C++ process
        this.initializeSimulatedOrderBook();

        setTimeout(() => {
            this.isReady = true;
            console.log('OrderBook service is ready');
        }, 2000);
    }

    initializeSimulatedOrderBook() {
        // Simulated market data for demo
        this.orderBook = {
            'BTC/USD': {
                bids: [
                    { price: 45248.50, quantity: 2.5, orders: [] },
                    { price: 45247.25, quantity: 1.8, orders: [] },
                    { price: 45246.00, quantity: 3.2, orders: [] }
                ],
                asks: [
                    { price: 45251.00, quantity: 1.7, orders: [] },
                    { price: 45252.25, quantity: 2.3, orders: [] },
                    { price: 45253.50, quantity: 1.5, orders: [] }
                ]
            }
        };
    }

    async placeOrder(orderData) {
        if (!this.isReady) {
            throw new Error('OrderBook service not ready');
        }

        try {
            const orderId = this.generateOrderId();
            const order = {
                ...orderData,
                orderId,
                status: 'PENDING',
                timestamp: new Date().toISOString()
            };

            // Store in active orders
            this.activeOrders.set(orderId, order);

            // Cache in Redis
            await this.redisClient.hSet(
                `orders:active:${orderData.userId}`,
                orderId,
                JSON.stringify(order)
            );

            // Simulate order book update
            this.simulateOrderBookUpdate(order);

            // Emit order update event
            this.emit('orderUpdate', {
                type: 'ORDER_PLACED',
                order
            });

            return {
                success: true,
                orderId,
                status: 'PENDING',
                message: 'Order submitted successfully'
            };

        } catch (error) {
            console.error('Place order error:', error);
            return {
                success: false,
                message: 'Failed to place order'
            };
        }
    }

    async cancelOrder(orderId, userId) {
        try {
            const order = this.activeOrders.get(parseInt(orderId));
            if (!order || order.userId !== userId) {
                return {
                    success: false,
                    message: 'Order not found or access denied'
                };
            }

            // Remove from active orders
            this.activeOrders.delete(parseInt(orderId));

            // Update cache
            await this.redisClient.hDel(`orders:active:${userId}`, orderId);
            await this.redisClient.hSet(
                `orders:cancelled:${userId}`,
                orderId,
                JSON.stringify({
                    ...order,
                    status: 'CANCELLED',
                    cancelledAt: new Date().toISOString()
                })
            );

            // Emit order update event
            this.emit('orderUpdate', {
                type: 'ORDER_CANCELLED',
                orderId,
                userId
            });

            return {
                success: true,
                message: 'Order cancelled successfully'
            };

        } catch (error) {
            console.error('Cancel order error:', error);
            return {
                success: false,
                message: 'Failed to cancel order'
            };
        }
    }

    async getOrderBook(symbol = 'BTC/USD') {
        try {
            // Try to get from Redis cache first
            const cached = await this.redisClient.get(`orderbook:${symbol}`);
            if (cached) {
                return JSON.parse(cached);
            }

            // Return simulated data
            const orderBookData = this.orderBook[symbol] || {
                bids: [],
                asks: []
            };

            // Cache the result
            await this.redisClient.setEx(
                `orderbook:${symbol}`,
                30,
                JSON.stringify({
                    symbol,
                    timestamp: Date.now(),
                    ...orderBookData
                })
            );

            return {
                symbol,
                timestamp: Date.now(),
                ...orderBookData
            };

        } catch (error) {
            console.error('Get orderbook error:', error);
            throw error;
        }
    }

    async getUserOrders(userId) {
        try {
            const activeOrders = await this.redisClient.hGetAll(`orders:active:${userId}`);
            const cancelledOrders = await this.redisClient.hGetAll(`orders:cancelled:${userId}`);

            const orders = [];

            // Parse active orders
            Object.values(activeOrders).forEach(orderStr => {
                orders.push(JSON.parse(orderStr));
            });

            // Parse cancelled orders
            Object.values(cancelledOrders).forEach(orderStr => {
                orders.push(JSON.parse(orderStr));
            });

            return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        } catch (error) {
            console.error('Get user orders error:', error);
            return [];
        }
    }

    simulateOrderBookUpdate(order) {
        const symbol = order.symbol || 'BTC/USD';
        if (!this.orderBook[symbol]) {
            this.orderBook[symbol] = { bids: [], asks: [] };
        }

        // Simulate adding order to the appropriate side
        const side = order.side === 'BUY' ? 'bids' : 'asks';
        const priceLevel = this.orderBook[symbol][side].find(level => level.price === order.price);

        if (priceLevel) {
            priceLevel.quantity += order.quantity;
            priceLevel.orders.push(order);
        } else {
            this.orderBook[symbol][side].push({
                price: order.price,
                quantity: order.quantity,
                orders: [order]
            });

            // Sort bids descending, asks ascending
            if (side === 'bids') {
                this.orderBook[symbol][side].sort((a, b) => b.price - a.price);
            } else {
                this.orderBook[symbol][side].sort((a, b) => a.price - b.price);
            }
        }

        // Broadcast update
        this.broadcastMarketUpdate(symbol);
    }

    async broadcastMarketUpdate(symbol) {
        const orderBookData = await this.getOrderBook(symbol);

        // Publish to Redis for WebSocket broadcast
        this.redisClient.publish('market_data_updates', JSON.stringify({
            type: 'orderbook_update',
            symbol,
            data: orderBookData
        }));
    }

    generateOrderId() {
        return this.orderIdCounter++;
    }

    getBestBid(symbol = 'BTC/USD') {
        const orderBook = this.orderBook[symbol];
        if (!orderBook || !orderBook.bids.length) return null;
        return orderBook.bids[0].price;
    }

    getBestAsk(symbol = 'BTC/USD') {
        const orderBook = this.orderBook[symbol];
        if (!orderBook || !orderBook.asks.length) return null;
        return orderBook.asks[0].price;
    }
}

module.exports = OrderBookWrapper;
