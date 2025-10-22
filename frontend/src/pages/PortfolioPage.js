import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const PortfolioPage = () => {
    const positions = [
        { symbol: 'BTC/USD', quantity: 2.5, avgPrice: 45000, currentPrice: 45250.50, pnl: 626.25 },
        { symbol: 'ETH/USD', quantity: 10.0, avgPrice: 3100, currentPrice: 3150.25, pnl: 502.50 },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '240px' }}>
                    <Typography variant="h4" gutterBottom>Portfolio</Typography>

                    <Paper sx={{ p: 3, bgcolor: '#1a1a2e', mb: 3 }}>
                        <Typography variant="h6">Total Portfolio Value: $125,000.50</Typography>
                        <Typography variant="body1" color="success.main">Daily P&L: +$2,500.75 (+2.04%)</Typography>
                    </Paper>

                    <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Avg Price</TableCell>
                                    <TableCell align="right">Current Price</TableCell>
                                    <TableCell align="right">P&L</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {positions.map((position) => (
                                    <TableRow key={position.symbol}>
                                        <TableCell>{position.symbol}</TableCell>
                                        <TableCell align="right">{position.quantity}</TableCell>
                                        <TableCell align="right">${position.avgPrice.toFixed(2)}</TableCell>
                                        <TableCell align="right">${position.currentPrice.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ color: position.pnl >= 0 ? 'success.main' : 'error.main' }}>
                                            ${position.pnl.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default PortfolioPage;
