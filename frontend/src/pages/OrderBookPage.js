import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, MenuItem } from '@mui/material';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderBookPage = () => {
    const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
    const [symbol, setSymbol] = useState('BTC/USD');
    const [side, setSide] = useState('BUY');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        loadOrderBook();
        const interval = setInterval(loadOrderBook, 5000);
        return () => clearInterval(interval);
    }, [symbol]);

    const loadOrderBook = async () => {
        try {
            const response = await orderService.getOrderBook(symbol);
            if (response.success) {
                setOrderBook(response.data);
            }
        } catch (error) {
            console.error('Failed to load order book:', error);
        }
    };

    const handlePlaceOrder = async () => {
        try {
            const response = await orderService.placeOrder({
                symbol,
                side,
                quantity: parseFloat(quantity),
                price: parseFloat(price),
                type: 'LIMIT'
            });

            if (response.success) {
                setMessage(`Order placed successfully! Order ID: ${response.orderId}`);
                setQuantity('');
                setPrice('');
                loadOrderBook();
            }
        } catch (error) {
            setMessage('Failed to place order: ' + error.message);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '240px' }}>
                    <Typography variant="h4" gutterBottom>Order Book</Typography>

                    <Grid container spacing={3}>
                        {/* Order Book Display */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2, bgcolor: '#1a1a2e' }}>
                                <Typography variant="h6" gutterBottom>{symbol}</Typography>

                                <Grid container spacing={2}>
                                    {/* Bids */}
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="success.main">BIDS</Typography>
                                        {orderBook.bids?.slice(0, 10).map((bid, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                <Typography variant="body2" color="success.main">{bid.price.toFixed(2)}</Typography>
                                                <Typography variant="body2">{bid.quantity.toFixed(4)}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>

                                    {/* Asks */}
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="error.main">ASKS</Typography>
                                        {orderBook.asks?.slice(0, 10).map((ask, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                <Typography variant="body2" color="error.main">{ask.price.toFixed(2)}</Typography>
                                                <Typography variant="body2">{ask.quantity.toFixed(4)}</Typography>
                                            </Box>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Order Entry Form */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, bgcolor: '#1a1a2e' }}>
                                <Typography variant="h6" gutterBottom>Place Order</Typography>

                                <TextField
                                    select
                                    fullWidth
                                    label="Symbol"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    margin="normal"
                                >
                                    <MenuItem value="BTC/USD">BTC/USD</MenuItem>
                                    <MenuItem value="ETH/USD">ETH/USD</MenuItem>
                                </TextField>

                                <TextField
                                    select
                                    fullWidth
                                    label="Side"
                                    value={side}
                                    onChange={(e) => setSide(e.target.value)}
                                    margin="normal"
                                >
                                    <MenuItem value="BUY">BUY</MenuItem>
                                    <MenuItem value="SELL">SELL</MenuItem>
                                </TextField>

                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    margin="normal"
                                />

                                <TextField
                                    fullWidth
                                    label="Price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    margin="normal"
                                />

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color={side === 'BUY' ? 'success' : 'error'}
                                    onClick={handlePlaceOrder}
                                    sx={{ mt: 2 }}
                                    disabled={!quantity || !price}
                                >
                                    Place {side} Order
                                </Button>

                                {message && (
                                    <Typography variant="body2" sx={{ mt: 2 }} color="primary">
                                        {message}
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default OrderBookPage;
