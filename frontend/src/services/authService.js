import api from './api';

class AuthService {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    }

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    }

    logout() {
        localStorage.removeItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();
