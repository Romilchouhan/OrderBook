const express = require('express');
const UserController = require('./controllers/UserController');
const PortfolioController = require('./controllers/PortfolioController');
const UserService = require('./services/UserService');
const PortfolioService = require('./services/PortfolioService');

const app = express();
app.use(express.json());

// Initialize services
const userService = new UserService();
const portfolioService = new PortfolioService();

// Initialize controllers
const userController = new UserController(userService);
const portfolioController = new PortfolioController(portfolioService);

// User management routes
app.get('/users/:userId', (req, res) => userController.getUser(req, res));
app.put('/users/:userId', (req, res) => userController.updateUser(req, res));
app.get('/users/:userId/profile', (req, res) => userController.getUserProfile(req, res));

// Portfolio routes
app.get('/users/:userId/portfolio', (req, res) => portfolioController.getPortfolio(req, res));
app.get('/users/:userId/positions', (req, res) => portfolioController.getPositions(req, res));
app.get('/users/:userId/trades', (req, res) => portfolioController.getTradeHistory(req, res));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'user-service',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 8084;
app.listen(PORT, () => {
    console.log(`👥 User Service running on port ${PORT}`);
});
