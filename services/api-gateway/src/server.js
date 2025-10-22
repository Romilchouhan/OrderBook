const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config();

const AuthService = require('./services/AuthService');
const WebSocketManager = require('./services/WebSocketManager');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../../frontend/build')));

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);

        if (result.success) {
            res.json({
                success: true,
                token: result.token,
                user: result.user,
                expiresIn: '24h'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const result = await AuthService.register(email, password, firstName, lastName);

        if (result.success) {
            res.json({
                success: true,
                message: 'User created successfully',
                userId: result.userId
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Protected API routes with microservice proxying
app.use('/api/orders', authMiddleware, createProxyMiddleware({
    target: process.env.ORDERBOOK_SERVICE_URL || 'http://localhost:8082',
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/orders' }
}));

app.use('/api/market-data', authMiddleware, createProxyMiddleware({
    target: process.env.MARKET_DATA_SERVICE_URL || 'http://localhost:8083',
    changeOrigin: true,
    pathRewrite: { '^/api/market-data': '/market-data' }
}));

app.use('/api/users', authMiddleware, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://localhost:8084',
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/users' }
}));

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/build/index.html'));
});

// Error handling
app.use(errorHandler);

// WebSocket server for real-time data
const wss = new WebSocket.Server({ server });
const wsManager = new WebSocketManager(wss);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Trading Platform API Gateway running on port ${PORT}`);
    console.log(`📱 Frontend available at: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready for real-time data`);
});
