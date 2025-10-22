const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('redis');

class AuthService {
    constructor() {
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect()
            .then(() => console.log("Redis connected!"))
            .catch(err => console.error("Redis connection error:", err));
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key';

        // Demo users for testing
        this.demoUsers = [
            {
                id: 1,
                email: 'trader@example.com',
                username: 'trader123',
                password: bcrypt.hashSync('demo123', 10),
                firstName: 'John',
                lastName: 'Trader',
                accountType: 'Premium',
                joinDate: '2024-01-15'
            },
            {
                id: 2,
                email: 'admin@example.com',
                username: 'admin',
                password: bcrypt.hashSync('admin123', 10),
                firstName: 'Admin',
                lastName: 'User',
                accountType: 'Admin',
                joinDate: '2023-12-01'
            }
        ];
    }

    async login(email, password) {
        try {
            const user = this.demoUsers.find(u => u.email === email || u.username === email);

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const isValidPassword = bcrypt.compareSync(password, user.password);
            if (!isValidPassword) {
                return { success: false, message: 'Invalid password' };
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    accountType: user.accountType
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );

            await this.redisClient.setEx(`session:${user.id}`, 86400, JSON.stringify({
                userId: user.id,
                email: user.email,
                loginTime: new Date().toISOString()
            }));

            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                token,
                user: userWithoutPassword
            };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Authentication failed' };
        }
    }

    async register(email, password, firstName, lastName) {
        try {
            const existingUser = this.demoUsers.find(u => u.email === email);
            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const newUser = {
                id: this.demoUsers.length + 1,
                email,
                username: email.split('@')[0],
                password: hashedPassword,
                firstName,
                lastName,
                accountType: 'Standard',
                joinDate: new Date().toISOString().split('T')[0]
            };

            this.demoUsers.push(newUser);

            return {
                success: true,
                userId: newUser.id,
                message: 'User registered successfully'
            };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed' };
        }
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const sessionData = await this.redisClient.get(`session:${decoded.userId}`);

            if (!sessionData) {
                return { valid: false, message: 'Session expired' };
            }

            return { valid: true, user: decoded };

        } catch (error) {
            return { valid: false, message: 'Invalid token' };
        }
    }
}

module.exports = new AuthService();
