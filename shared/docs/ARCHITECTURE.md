# Trading Platform Architecture

## Overview
- **Core**: C++ OrderBook (high-performance matching engine)
- **Services**: Node.js microse[<35;81;26Mrvices
- **Frontend**: React web application
- **Infrastructure**: Redis, PostgreSQL

## Data Flow
1. User places order via web interface
2. API Gateway authenticates and routes request
3. OrderBook Service processes via C++ engine
4. State cached in Redis
5. Historical data stored in PostgreSQL
6. Real-time updates via WebSocket
