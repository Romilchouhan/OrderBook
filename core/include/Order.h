//
// Created by Romil Chouhan on 12/10/25.
//

#ifndef ORDER_H
#define ORDER_H

#pragma once
#include "Types.h"

class Limit;

class Order {
public:
    Order(OrderBookTypes::OrderId id, OrderBookTypes::Side side,
          OrderBookTypes::Quantity shares, OrderBookTypes::Price limit,
          OrderBookTypes::Timestamp entryTime, OrderBookTypes::Timestamp eventTime);

    ~Order() = default;

    // Getters
    OrderBookTypes::OrderId getIdNumber() const {return idNumber;}
    OrderBookTypes::Side getSide() const {return side;}
    OrderBookTypes::Quantity getShares() const {return shares;}
    OrderBookTypes::Price getLimit() const {return limit;}
    OrderBookTypes::Timestamp getEntryTime() const {return entryTime;}
    OrderBookTypes::Timestamp getEventTime() const {return eventTime;}

    // Linked list pointers
    Order* getNextOrder() const {return nextOrder;}
    Order* getPrevOrder() const {return prevOrder;}
    Limit* getParentLimit() const {return parentLimit;}

    void setNextOrder(Order* next) {nextOrder = next;}
    void setPrevOrder(Order* prev) {prevOrder = prev;}
    void setParentLimit(Limit* parent) {parentLimit = parent;}

    // Modify order
    void reduceShares(OrderBookTypes::Quantity reduction);
    bool isBuyOrder() const {return side == OrderBookTypes::Side::BUY;}

private:
    OrderBookTypes::OrderId idNumber;
    OrderBookTypes::Side side;
    OrderBookTypes::Quantity shares;
    OrderBookTypes::Price limit;
    OrderBookTypes::Timestamp entryTime;
    OrderBookTypes::Timestamp eventTime;

    // Doubly linked list pointers for orders at same price
    Order* nextOrder;
    Order* prevOrder;
    Limit* parentLimit;
};



#endif //ORDER_H
