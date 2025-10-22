const express = require('express');
const OrderBookWrapper = require('./OrderBookWrapper');
const OrderController = require('./controllers/OrderController');
const MarketDataController = require('./controllers/MarketDataController');

const app = express();
app.use(express.json());

// Initialize OrderBook wrapper
const orderBookWrapper = new OrderBookWrapper();

// Inject OrderBook into controllers
const orderController = new OrderController(orderBookWrapper);
const marketDataController = new MarketDataController(orderBookWrapper);

// Order management endpoints
app.post('/orders', (req, res) => orderController.placeOrder(req, res));
app.delete('/orders/:orderId', (req, res) => orderController.cancelOrder(req, res));
app.get('/orders/user/:userId', (req, res) => orderController.getUserOrders(req, res));

// Market data endpoints
app.get('/orderbook/:symbol?', (req, res) => marketDataController.getOrderBook(req, res));
app.get('/market-data/:symbol', (req, res) => marketDataController.getMarketData(req, res));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'orderbook-service',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
    console.log(`🔧 OrderBook Service running on port ${PORT}`);
});
