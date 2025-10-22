import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [marketData, setMarketData] = useState({});
    const [orderBookData, setOrderBookData] = useState({});
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;

        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
            setWs(websocket);
        };

        websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
            setWs(null);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
        };
    }, [isAuthenticated]);

    const handleWebSocketMessage = (data) => {
        switch (data.type) {
            case 'broadcast':
                if (data.channel === 'market_data_updates') {
                    handleMarketDataUpdate(data.data);
                }
                break;
            case 'connection':
                console.log('WebSocket connection confirmed:', data.clientId);
                break;
            case 'subscription_confirmed':
                console.log('Subscribed to:', data.channel);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    };

    const handleMarketDataUpdate = (data) => {
        if (data.type === 'price_update') {
            setMarketData(prev => ({
                ...prev,
                [data.symbol]: {
                    ...prev[data.symbol],
                    price: data.price,
                    timestamp: data.timestamp
                }
            }));
        } else if (data.type === 'orderbook_update') {
            setOrderBookData(prev => ({
                ...prev,
                [data.symbol]: data.data
            }));
        }
    };

    const subscribe = (channel) => {
        if (ws && connected) {
            ws.send(JSON.stringify({
                type: 'subscribe',
                channel
            }));
        }
    };

    const unsubscribe = (channel) => {
        if (ws && connected) {
            ws.send(JSON.stringify({
                type: 'unsubscribe',
                channel
            }));
        }
    };

    const value = {
        connected,
        marketData,
        orderBookData,
        subscribe,
        unsubscribe
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
