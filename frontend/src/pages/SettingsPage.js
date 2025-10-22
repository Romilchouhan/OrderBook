import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const SettingsPage = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flex: 1 }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '240px' }}>
                    <Typography variant="h4" gutterBottom>Settings</Typography>
                    <Paper sx={{ p: 3, bgcolor: '#1a1a2e' }}>
                        <Typography variant="body1">User settings and preferences will be displayed here.</Typography>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default SettingsPage;
