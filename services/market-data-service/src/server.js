const express = require('express');
const MarketDataController = require('./controllers/MarketDataController');
const MarketDataService = require('./services/MarketDataService');
const PriceService = require('./services/PriceService');

const app = express();
app.use(express.json());

// Initialize services
const priceService = new PriceService();
const marketDataService = new MarketDataService(priceService);

// Initialize controller
const marketDataController = new MarketDataController(marketDataService);

// Market data routes
app.get('/market-data/:symbol', (req, res) => marketDataController.getMarketData(req, res));
app.get('/market-data/:symbol/history', (req, res) => marketDataController.getPriceHistory(req, res));
app.get('/market-data/:symbol/stats', (req, res) => marketDataController.getMarketStats(req, res));
app.get('/symbols', (req, res) => marketDataController.getSymbols(req, res));
app.get('/watchlist/:userId', (req, res) => marketDataController.getWatchlist(req, res));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'market-data-service',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`📈 Market Data Service running on port ${PORT}`);
});

// Start price simulation
priceService.startPriceSimulation();
