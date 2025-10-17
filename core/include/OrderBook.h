//
// Created by Romil Chouhan on 12/10/25.
//

#ifndef ORDERBOOK_H
#define ORDERBOOK_H

#pragma once
#include "Order.h"
#include "../include//Types.h"
#include "Limit.h"
#include <unordered_map>
#include <shared_mutex>
#include <memory>

class OrderBook {
public:
    OrderBook();
    ~OrderBook();

    // Main operations - O(1) or O(logM) where M is the number of price levels
    bool addOrder(std::unique_ptr<Order> order);
    bool cancelOrder(OrderBookTypes::OrderId orderId);
    bool executeOrder(OrderBookTypes::OrderId orderId, OrderBookTypes::Quantity quantity);

    // Market data queries - O(1)
    OrderBookTypes::Price getBestBid() const;
    OrderBookTypes::Price getBestAsk() const;
    OrderBookTypes::Quantity getVolumeAtLimit(OrderBookTypes::Price price, OrderBookTypes::Side side) const;
    OrderBookTypes::Quantity getBidVolume() const;
    OrderBookTypes::Quantity getAskVolume() const;

    // Order lookup
    Order* findOrder(OrderBookTypes::OrderId orderId) const;

    // Book size
    bool isEmpty() const;
    size_t getOrderCount() const {return orderMap.size();}

private:
    // Binary trees for buy and sell limits
    Limit* buyTree;
    Limit* sellTree;

    // Cached pointers to inside of book for O(1) access
    Limit* lowestSell;
    Limit* highestBuy;

    // Hashmap for O(1) lookups
    std::unordered_map<OrderBookTypes::OrderId, std::unique_ptr<Order>> orderMap;
    std::unordered_map<OrderBookTypes::Price, Limit*> buyLimits;
    std::unordered_map<OrderBookTypes::Price, Limit*> sellLimits;

    // Thread safety
    mutable std::shared_mutex bookMutex;

    // Helper methods
    Limit* findLimit(OrderBookTypes::Price price, OrderBookTypes::Side side) const;
    Limit* getOrCreateLimit(OrderBookTypes::Price price, OrderBookTypes::Side side);
    void insertLimitIntoTree(Limit* newLimit, OrderBookTypes::Side side);
    void removeLimitFromTree(Limit* limit, OrderBookTypes::Side side);
    void updateInsideLimits();

    // Tree operations
    Limit* findMinimum(Limit* node) const;
    Limit* findMaximum(Limit* node) const;
    void transplant(Limit* u, Limit* v, OrderBookTypes::Side side);
};



#endif //ORDERBOOK_H
