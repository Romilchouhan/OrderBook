const WebSocket = require('ws');
const redis = require('redis');

class WebSocketManager {
    constructor(wss) {
        this.wss = wss;
        this.clients = new Map();
        this.subscriptions = new Map();

        this.redisSubscriber = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
        this.redisClient.connect()
            .then(() => console.log("Redis connected!"))
            .catch(err => console.error("Redis connection error:", err));

        this.setupWebSocketServer();
        this.setupRedisSubscriptions();
    }

    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            this.clients.set(clientId, {
                ws,
                subscriptions: new Set(),
                lastPing: Date.now()
            });

            console.log(`WebSocket client connected: ${clientId}`);

            ws.on('message', (message) => {
                this.handleMessage(clientId, message);
            });

            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });

            ws.on('pong', () => {
                const client = this.clients.get(clientId);
                if (client) {
                    client.lastPing = Date.now();
                }
            });

            // Send a welcome message
            this.sendToClient(clientId, {
                type: 'connection',
                status: 'connected',
                clientId
            });
        });

        // Heartbeat mechanism
        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.ping();
                }
            });
        }, 30000);
    }

    setupRedisSubscriptions() {
        // Subscribe to market data updates
        this.redisSubscriber.subscribe('market_data_updates');
        this.redisSubscriber.subscribe('order_updates');
        this.redisSubscriber.subscribe('trade_updates');

        this.redisSubscriber.on('message', (channel, message) => {
            this.broadcastToSubscribers(channel, JSON.parse(message));
        });
    }

    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'subscribe':
                    this.handleSubscription(clientId, data.channel);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscription(clientId, data.channel);
                    break;
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong' });
                    break;
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    handleSubscription(clientId, channel) {
        const client = this.clients.get(clientId);
        if (client) {
            client.subscriptions.add(channel);

            if (!this.subscriptions.has(channel)) {
                this.subscriptions.set(channel, new Set());
            }
            this.subscriptions.get(channel).add(clientId);

            this.sendToClient(clientId, {
                type: 'subscription_confirmed',
                channel
            });

            console.log(`Client ${clientId} subscribed to ${channel}`);
        }
    }

    handleUnsubscription(clientId, channel) {
        const client = this.clients.get(clientId);
        if (client) {
            client.subscriptions.delete(channel);

            if (this.subscriptions.has(channel)) {
                this.subscriptions.get(channel).delete(clientId);

                if (this.subscriptions.get(channel).size === 0) {
                    this.subscriptions.delete(channel);
                }
            }

            this.sendToClient(clientId, {
                type: 'unsubscription_confirmed',
                channel
            });
        }
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            // Remove from all subscriptions
            client.subscriptions.forEach(channel => {
                if (this.subscriptions.has(channel)) {
                    this.subscriptions.get(channel).delete(clientId);
                    if (this.subscriptions.get(channel).size === 0) {
                        this.subscriptions.delete(channel);
                    }
                }
            });

            this.clients.delete(clientId);
            console.log(`WebSocket client disconnected: ${clientId}`);
        }
    }

    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
        }
    }

    broadcastToSubscribers(channel, data) {
        if (this.subscriptions.has(channel)) {
            const subscribers = this.subscriptions.get(channel);
            subscribers.forEach(clientId => {
                this.sendToClient(clientId, {
                    type: 'broadcast',
                    channel,
                    data
                });
            });
        }
    }

    broadcast(data) {
        this.clients.forEach((client, clientId) => {
            this.sendToClient(clientId, data);
        });
    }

    generateClientId() {
        return Math.random().toString(36).slice(2, 11);
    }

}

module.exports = WebSocketManager;
