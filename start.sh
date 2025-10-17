#!/bin/bash

echo "🚀 Starting Trading Platform..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Run './setup.sh' first."
    exit 1
fi

# Start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "🎉 Trading Platform is ready!"
echo ""
echo "📱 Web Application: http://localhost:8080"
echo "🔑 Demo Login: trader@example.com / demo123"
echo ""
echo "📊 Services:"
echo "   - API Gateway: http://localhost:8080"
echo "   - OrderBook: http://localhost:8082"
echo "   - User Service: http://localhost:8084"
echo "   - Market Data: http://localhost:8083"
echo ""
echo "🛑 To stop: ./stop.sh"
echo "📖 View logs: docker-compose logs -f [service-name]"
