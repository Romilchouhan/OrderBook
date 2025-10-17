//
// Created by Romil Chouhan on 12/10/25.
//

#include "../include/Limit.h"
#include "../include/Order.h"
#include <stdexcept>

Limit::Limit(OrderBookTypes::Price price)
    : limitPrice(price), size(0), totalVolume(0),
      parent(nullptr), leftChild(nullptr), rightChild(nullptr),
      headOrder(nullptr), tailOrder(nullptr) {
}

Limit::~Limit() {
    // Orders are managed by OrderBook, so we don't delete them here
}

void Limit::addOrder(Order *order) {
    std::lock_guard<std::mutex> lock(limitMutex);

    if (!order) {
        throw std::invalid_argument("Cannot add null order");
    }

    order->setParentLimit(this);

    if (!headOrder) {
        // First order at this limit
        headOrder = tailOrder = order;
        order->setNextOrder(nullptr);
        order->setPrevOrder(nullptr);
    } else {
        // Add to the end of the queue (FIFO)
        tailOrder->setNextOrder(order);
        order->setPrevOrder(tailOrder);
        order->setNextOrder(nullptr);
        tailOrder = order;
    }

    size++;
    totalVolume += order->getShares();
}

void Limit::removeOrder(Order *order) {
    std::lock_guard<std::mutex> lock(limitMutex);

    if (!order || order->getParentLimit() != this) {
        throw std::invalid_argument("Order does not belong to this limit");
    }

    // Update linked list
    if (order->getPrevOrder()) {
        order->getPrevOrder()->setNextOrder(order->getNextOrder());
    } else {
        headOrder = order->getNextOrder();
    }

    if (order->getNextOrder()) {
        order->getNextOrder()->setPrevOrder(order->getPrevOrder());
    } else {
        tailOrder = order->getPrevOrder();
    }

    size--;
    totalVolume -= order->getShares();

    order->setParentLimit(nullptr);
    order->setNextOrder(nullptr);
    order->setPrevOrder(nullptr);
}


