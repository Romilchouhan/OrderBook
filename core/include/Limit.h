//
// Created by Romil Chouhan on 12/10/25.
//

#ifndef LIMIT_H
#define LIMIT_H

#pragma once
#include "Types.h"
#include <mutex>
#include <memory>

class Order;

class Limit {
public:
    explicit Limit(OrderBookTypes::Price price);
    ~Limit();

    // Tree structure
    Limit* getParent() const {return parent;}
    Limit* getLeftChild() const {return leftChild;}
    Limit* getRightChild() const {return rightChild;}

    void setParent(Limit* parent) {this->parent = parent;}
    void setLeftChild(Limit* left) {this->leftChild = left;}
    void setRightChild(Limit* right) {this->rightChild = right;}

    // Price and volume
    OrderBookTypes::Price getLimitPrice() const {return limitPrice;}
    OrderBookTypes::Quantity getSize() const {return size;}
    OrderBookTypes::Quantity getTotalVolume() const {return totalVolume;}

    // Order management
    void addOrder(Order* order);
    void removeOrder(Order* order);
    Order* getHeadOrder() const {return headOrder;}
    Order* getTailOrder() const {return tailOrder;}

    bool hasOrders() const {return headOrder != nullptr;}

    // Thread safety
    std::mutex& getMutex() {return limitMutex;}

private:
    OrderBookTypes::Price limitPrice;
    OrderBookTypes::Quantity size;  // number of orders at this limit
    OrderBookTypes::Quantity totalVolume;  // Total shares at this limit

    // Binary tree pointers
    Limit* parent;
    Limit* leftChild;
    Limit* rightChild;

    // Doubly linked list of orders at this price
    Order* headOrder;
    Order* tailOrder;

    // Thread safety
    mutable std::mutex limitMutex;
};



#endif //LIMIT_H
