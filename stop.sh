#!/bin/bash

echo "🛑 Stopping Trading Platform..."
docker-compose down
echo "✅ All services stopped"
echo "💾 Data preserved in Docker volumes"
echo "🚀 To start again: ./start.sh"
