import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '240px' }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome back, {user?.firstName || 'Trader'}!
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: '#1a1a2e' }}>
                                <Typography variant="h6" gutterBottom>Portfolio Value</Typography>
                                <Typography variant="h4" color="primary">$125,000.50</Typography>
                                <Typography variant="body2" color="success.main">+2.5% Today</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: '#1a1a2e' }}>
                                <Typography variant="h6" gutterBottom>Daily P&L</Typography>
                                <Typography variant="h4" color="success.main">+$2,500.75</Typography>
                                <Typography variant="body2" color="textSecondary">+2.04%</Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, bgcolor: '#1a1a2e' }}>
                                <Typography variant="h6" gutterBottom>Active Orders</Typography>
                                <Typography variant="h4">12</Typography>
                                <Typography variant="body2" color="textSecondary">3 Pending</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3, mt: 3, bgcolor: '#1a1a2e' }}>
                        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                        <Typography variant="body1" color="textSecondary">
                            Navigate using the sidebar to access OrderBook, Portfolio, Market Data, and Settings.
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardPage;
