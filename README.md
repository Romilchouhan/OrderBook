# Trading Platform

A complete web-based trading platform with real-time order book, user management, and market data feeds.

## 🏗️ Architecture

- **Core Engine**: High-performance C++ OrderBook for trade matching
- **Microservices**: Node.js services for web APIs and business logic  
- **Frontend**: React-based web application with real-time updates
- **Infrastructure**: Redis for caching, PostgreSQL for persistence

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- CMake & C++ compiler (for C++ development)

### Installation

1. **Copy your existing C++ OrderBook code to `core/` directory:**
   ```bash
   cp /path/to/your/existing/*.hpp core/include/
   cp /path/to/your/existing/*.cpp core/src/
   ```

2. **Run setup:**
   ```bash
   chmod +x setup.sh start.sh stop.sh
   ./setup.sh
   ```

3. **Start the platform:**
   ```bash
   ./start.sh
   ```

4. **Access the application:**
   - Web Application: http://localhost:8080
   - Demo Login: trader@example.com / demo123

## 📋 Services

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8080 | Main web server & authentication |
| OrderBook Service | 8082 | C++ order matching engine wrapper |
| User Service | 8084 | User management & portfolio |
| Market Data Service | 8083 | Real-time market data feeds |
| Redis | 6379 | Caching & sessions |
| PostgreSQL | 5432 | Persistent data storage |

## 🔧 Development

### Building Individual Components

**C++ OrderBook:**
```bash
cd core && mkdir build && cd build
cmake .. && make
```

**Frontend Development:**
```bash
cd frontend
npm install
npm start  # Development server on port 3000
```

**Service Development:**
```bash
cd services/api-gateway
npm install
npm run dev
```

## 📖 Documentation

- [Architecture](shared/docs/ARCHITECTURE.md)
- [API Documentation](shared/docs/API.md)
- [Deployment Guide](shared/docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
