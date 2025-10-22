class MarketDataController {
    constructor(marketDataService) {
        this.marketDataService = marketDataService;
    }

    async getMarketData(req, res) {
        try {
            const { symbol } = req.params;
            const marketData = await this.marketDataService.getMarketData(symbol);

            res.json({
                success: true,
                data: marketData
            });

        } catch (error) {
            console.error('Get market data error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getPriceHistory(req, res) {
        try {
            const { symbol } = req.params;
            const interval = req.query.interval || '1h';
            const limit = parseInt(req.query.limit) || 100;

            const history = await this.marketDataService.getPriceHistory(symbol, interval, limit);

            res.json({
                success: true,
                data: {
                    symbol,
                    interval,
                    history
                }
            });

        } catch (error) {
            console.error('Get price history error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getMarketStats(req, res) {
        try {
            const { symbol } = req.params;
            const stats = await this.marketDataService.getMarketStats(symbol);

            res.json({
                success: true,
                data: {
                    symbol,
                    ...stats
                }
            });

        } catch (error) {
            console.error('Get market stats error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getSymbols(req, res) {
        try {
            const symbols = await this.marketDataService.getSymbols();

            res.json({
                success: true,
                data: symbols
            });

        } catch (error) {
            console.error('Get symbols error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getWatchlist(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId;

            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const watchlist = await this.marketDataService.getWatchlist(userId);

            res.json({
                success: true,
                data: watchlist
            });

        } catch (error) {
            console.error('Get watchlist error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = MarketDataController;
