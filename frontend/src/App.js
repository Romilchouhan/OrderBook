import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrderBookPage from './pages/OrderBookPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketDataPage from './pages/MarketDataPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#0a0e27',
            paper: '#1a1a2e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AuthProvider>
                <WebSocketProvider>
                    <Router>
                        <div className="App">
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/" element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/orderbook" element={
                                    <ProtectedRoute>
                                        <OrderBookPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/portfolio" element={
                                    <ProtectedRoute>
                                        <PortfolioPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/market-data" element={
                                    <ProtectedRoute>
                                        <MarketDataPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </WebSocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
