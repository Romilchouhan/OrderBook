class MarketDataController {
    constructor(orderBookWrapper) {
        this.orderBookWrapper = orderBookWrapper;
    }

    async getOrderBook(req, res) {
        try {
            const symbol = req.params.symbol || 'BTC/USD';
            const data = await this.orderBookWrapper.getOrderBook(symbol);

            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Get order book error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getMarketData(req, res) {
        try {
            const symbol = req.params.symbol;
            const orderBookData = await this.orderBookWrapper.getOrderBook(symbol);

            const marketData = {
                symbol,
                bestBid: this.orderBookWrapper.getBestBid(symbol),
                bestAsk: this.orderBookWrapper.getBestAsk(symbol),
                spread: null,
                lastPrice: null,
                volume24h: 0,
                priceChange24h: 0,
                timestamp: Date.now()
            };

            if (marketData.bestBid && marketData.bestAsk) {
                marketData.spread = marketData.bestAsk - marketData.bestBid;
            }

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
}

module.exports = MarketDataController;
