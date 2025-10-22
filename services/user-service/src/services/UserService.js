const redis = require('redis');

class UserService {
    constructor() {
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redisClient.connect();

        // Demo users data
        this.users = new Map([
            [1, {
                id: 1,
                email: 'trader@example.com',
                username: 'trader123',
                firstName: 'John',
                lastName: 'Trader',
                accountType: 'Premium',
                joinDate: '2024-01-15',
                isActive: true,
                preferences: {
                    currency: 'USD',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                }
            }],
            [2, {
                id: 2,
                email: 'admin@example.com',
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                accountType: 'Admin',
                joinDate: '2023-12-01',
                isActive: true,
                preferences: {
                    currency: 'USD',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        sms: true,
                        push: true
                    }
                }
            }]
        ]);
    }

    async getUser(userId) {
        try {
            // Try cache first
            const cached = await this.redisClient.get(`user:${userId}`);
            if (cached) {
                return JSON.parse(cached);
            }

            // Get from "database" (demo data)
            const user = this.users.get(parseInt(userId));
            if (!user) {
                return null;
            }

            // Cache for 1 hour
            await this.redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));

            return user;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            const user = this.users.get(parseInt(userId));
            if (!user) {
                return null;
            }

            // Update user data
            const updatedUser = {
                ...user,
                ...updateData,
                id: user.id, // Prevent ID changes
                updatedAt: new Date().toISOString()
            };

            this.users.set(parseInt(userId), updatedUser);

            // Update cache
            await this.redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const user = await this.getUser(userId);
            if (!user) {
                return null;
            }

            // Return profile without sensitive data
            const { password, ...profile } = user;
            return profile;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    async updateUserPreferences(userId, preferences) {
        try {
            const user = await this.getUser(userId);
            if (!user) {
                return null;
            }

            const updatedUser = {
                ...user,
                preferences: {
                    ...user.preferences,
                    ...preferences
                },
                updatedAt: new Date().toISOString()
            };

            return await this.updateUser(userId, updatedUser);
        } catch (error) {
            console.error('Update user preferences error:', error);
            throw error;
        }
    }
}

module.exports = UserService;
