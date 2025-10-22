import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box
} from '@mui/material';
import {
    Dashboard,
    ShowChart,
    AccountBalance,
    TrendingUp,
    Settings
} from '@mui/icons-material';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'OrderBook', icon: <ShowChart />, path: '/orderbook' },
        { text: 'Portfolio', icon: <AccountBalance />, path: '/portfolio' },
        { text: 'Market Data', icon: <TrendingUp />, path: '/market-data' },
        { text: 'Settings', icon: <Settings />, path: '/settings' }
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    bgcolor: '#1a1a2e',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                    marginTop: '64px'
                },
            }}
        >
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(25, 118, 210, 0.2)',
                                        borderRight: '3px solid #1976d2'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
