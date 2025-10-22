class PortfolioController {
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }

    async getPortfolio(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const portfolio = await this.portfolioService.getPortfolio(userId);

            res.json({
                success: true,
                data: portfolio
            });

        } catch (error) {
            console.error('Get portfolio error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getPositions(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const positions = await this.portfolioService.getPositions(userId);

            res.json({
                success: true,
                data: positions
            });

        } catch (error) {
            console.error('Get positions error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getTradeHistory(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;

            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const tradeHistory = await this.portfolioService.getTradeHistory(userId, limit, offset);

            res.json({
                success: true,
                data: tradeHistory
            });

        } catch (error) {
            console.error('Get trade history error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = PortfolioController;
