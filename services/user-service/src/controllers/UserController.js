class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getUser(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            // Users can only access their own data (unless admin)
            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const user = await this.userService.getUser(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user
            });

        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            // Users can only update their own data
            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updatedUser = await this.userService.updateUser(userId, req.body);
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: updatedUser
            });

        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const profile = await this.userService.getUserProfile(userId);
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: profile
            });

        } catch (error) {
            console.error('Get user profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = UserController;
