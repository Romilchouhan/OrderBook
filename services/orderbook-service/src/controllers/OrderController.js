class OrderController {
    constructor(orderBookWrapper) {
        this.orderBookWrapper = orderBookWrapper;
    }

    async placeOrder(req, res) {
        try {
            const orderData = {
                userId: req.user?.userId || req.body.userId || 1,
                symbol: req.body.symbol || 'BTC/USD',
                side: req.body.side,
                quantity: parseFloat(req.body.quantity),
                price: parseFloat(req.body.price),
                type: req.body.type || 'LIMIT'
            };

            // Validate order data
            if (!orderData.side || !['BUY', 'SELL'].includes(orderData.side)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order side. Must be BUY or SELL'
                });
            }

            if (!orderData.quantity || orderData.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid quantity. Must be greater than 0'
                });
            }

            if (orderData.type === 'LIMIT' && (!orderData.price || orderData.price <= 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid price for limit order'
                });
            }

            const result = await this.orderBookWrapper.placeOrder(orderData);

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }

        } catch (error) {
            console.error('Place order error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user?.userId || req.body.userId || 1;

            const result = await this.orderBookWrapper.cancelOrder(orderId, userId);

            if (result.success) {
                res.json(result);
            } else {
                res.status(404).json(result);
            }

        } catch (error) {
            console.error('Cancel order error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserOrders(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user?.userId || userId;

            // Users can only see their own orders (unless admin)
            if (parseInt(userId) !== requestingUserId && req.user?.accountType !== 'Admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const orders = await this.orderBookWrapper.getUserOrders(parseInt(userId));

            res.json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Get user orders error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = OrderController;
