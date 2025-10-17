//
// Created by Romil Chouhan on 12/10/25.
//

#include "../include/OrderBook.h"
#include <algorithm>

OrderBook::OrderBook()
    : buyTree(nullptr), sellTree(nullptr),
      lowestSell(nullptr), highestBuy(nullptr) {
}

OrderBook::~OrderBook() {
    // Clean up limit objects
    for (auto& pair: buyLimits) {
        delete pair.second;
    }
    for (auto& pair: sellLimits) {
        delete pair.second;
    }
}

bool OrderBook::addOrder(std::unique_ptr<Order> order) {
    if (!order) return false;

    std::unique_lock<std::shared_mutex> lock(bookMutex);

    OrderBookTypes::OrderId orderId = order->getIdNumber();
    if (orderMap.find(orderId) != orderMap.end()) {
        return false;  // Order already exists
    }

    // Get or create limit
    Limit* limit = getOrCreateLimit(order->getLimit(), order->getSide());

    // Add order to limit
    Order* orderPtr = order.get();
    limit->addOrder(orderPtr);

    // Store order in a map
    orderMap[orderId] = std::move(order);

    // Update inside limits if necessary
    updateInsideLimits();

    return true;
}

bool OrderBook::cancelOrder(OrderBookTypes::OrderId orderId) {
    std::unique_lock<std::shared_mutex> lock(bookMutex);

    auto it = orderMap.find(orderId);
    if (it == orderMap.end()) {
        return false;
    }

    Order* order = it->second.get();
    Limit* limit = order->getParentLimit();

    // Remove from limit
    limit->removeOrder(order);

    // If the limit is empty, remove it
    if (!limit->hasOrders()) {
        if (order->isBuyOrder()) {
            buyLimits.erase(limit->getLimitPrice());
            removeLimitFromTree(limit, OrderBookTypes::Side::BUY);
        } else {
            sellLimits.erase(limit->getLimitPrice());
            removeLimitFromTree(limit, OrderBookTypes::Side::SELL);
        }
        delete limit;
    }

    // Remove from an order map
    orderMap.erase(it);

    updateInsideLimits();
    return true;
}

bool OrderBook::executeOrder(OrderBookTypes::OrderId orderId, OrderBookTypes::Quantity quantity) {
    std::unique_lock<std::shared_mutex> lock(bookMutex);

    auto it = orderMap.find(orderId);
    if (it == orderMap.end()) {
        return false;
    }

    Order* order = it->second.get();
    if (quantity >= order->getShares()) {
        // Full execution - remove order
        return cancelOrder(orderId);
    } else {
        // Partial execution
        order->reduceShares(quantity);
        order->getParentLimit()->getMutex().lock();
        // Update limit's total volume
        // Note: This is simplified - in practice you'd need to update totalVolume properly
        order->getParentLimit()->getMutex().unlock();
        return true;
    }
}

OrderBookTypes::Price OrderBook::getBestBid() const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);
    return highestBuy ? highestBuy->getLimitPrice() : 0;
}

OrderBookTypes::Price OrderBook::getBestAsk() const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);
    return lowestSell ? lowestSell->getLimitPrice() : 0;
}

OrderBookTypes::Quantity OrderBook::getBidVolume() const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);
    return highestBuy ? highestBuy->getTotalVolume() : 0;
}

OrderBookTypes::Quantity OrderBook::getAskVolume() const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);
    return lowestSell ? lowestSell->getTotalVolume() : 0;
}

OrderBookTypes::Quantity OrderBook::getVolumeAtLimit(OrderBookTypes::Price price, OrderBookTypes::Side side) const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);

    Limit* limit = findLimit(price, side);
    return limit ? limit->getTotalVolume() : 0;
}

Order *OrderBook::findOrder(OrderBookTypes::OrderId orderId) const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);

    auto it = orderMap.find(orderId);
    return (it != orderMap.end()) ? it->second.get() : nullptr;
}

// Private helper methods
Limit* OrderBook::findLimit(OrderBookTypes::Price price, OrderBookTypes::Side side) const {
    if (side == OrderBookTypes::Side::BUY) {
        auto it = buyLimits.find(price);
        return (it != buyLimits.end()) ? it->second : nullptr;
    } else {
        auto it = sellLimits.find(price);
        return (it != sellLimits.end()) ? it->second : nullptr;
    }
}

Limit *OrderBook::getOrCreateLimit(OrderBookTypes::Price price, OrderBookTypes::Side side) {
    Limit* limit = findLimit(price, side);
    if (!limit) {
        limit = new Limit(price);
        if (side == OrderBookTypes::Side::BUY) {
            buyLimits[price] = limit;
            insertLimitIntoTree(limit, OrderBookTypes::Side::BUY);
        } else {
            sellLimits[price] = limit;
            insertLimitIntoTree(limit, OrderBookTypes::Side::SELL);
        }
    }
    return limit;
}

void OrderBook::insertLimitIntoTree(Limit *newLimit, OrderBookTypes::Side side) {
    Limit** root = (side == OrderBookTypes::Side::BUY) ? &buyTree : &sellTree;

    if (!*root) {
        *root = newLimit;
        return;
    }

    Limit* current = *root;
    while (true) {
        if (side == OrderBookTypes::Side::BUY) {
            if (newLimit->getLimitPrice() > current->getLimitPrice()) {
                if (!current->getRightChild()) {
                    current->setRightChild(newLimit);
                    newLimit->setParent(current);
                    break;
                }
                current = current->getRightChild();
            } else {
                if (!current->getLeftChild()) {
                    current->setLeftChild(newLimit);
                    newLimit->setParent(current);
                    break;
                }
                current = current->getLeftChild();
            }
        } else {
            if (newLimit->getLimitPrice() < current->getLimitPrice()) {
                if (!current->getLeftChild()) {
                    current->setLeftChild(newLimit);
                    newLimit->setParent(current);
                    break;
                }
                current = current->getLeftChild();
            } else {
                if (!current->getRightChild()) {
                    current->setRightChild(newLimit);
                    newLimit->setParent(current);
                    break;
                }
                current = current->getRightChild();
            }
        }
    }
}

void OrderBook::removeLimitFromTree(Limit *limit, OrderBookTypes::Side side) {
    if (!limit) return;

    if (!limit->getLeftChild()) {
        // No left child, replace it with right child
        transplant(limit, limit->getRightChild(), side);
    } else if (!limit->getRightChild()) {
        // No right child, replace it with left child
        transplant(limit, limit->getLeftChild(), side);
    } else {
        // Two children case
        Limit* successor;
        if (side == OrderBookTypes::Side::BUY) {
            // For buy tree, find a predecessor (rightmost in left subtree)
            successor = findMaximum(limit->getLeftChild());
        } else {
            // For sell tree, find a successor (leftmost in right subtree)
            successor = findMinimum(limit->getRightChild());
        }

        if (successor->getParent() != limit) {
            transplant(successor, (side == OrderBookTypes::Side::BUY) ? successor->getLeftChild() : successor->getRightChild(), side);
            if (side == OrderBookTypes::Side::BUY) {
                successor->setLeftChild(limit->getLeftChild());
                if (successor->getLeftChild()) {
                    successor->getLeftChild()->setParent(successor);
                }
            } else {
                successor->setRightChild(limit->getRightChild());
                if (successor->getRightChild()) {
                    successor->getRightChild()->setParent(successor);
                }
            }
        }

        transplant(limit, successor, side);
        if (side == OrderBookTypes::Side::BUY) {
            successor->setRightChild(limit->getRightChild());
            if (successor->getRightChild()) {
                successor->getRightChild()->setParent(successor);
            }
        } else {
            successor->setLeftChild(limit->getLeftChild());
            if (successor->getLeftChild()) {
                successor->getLeftChild()->setParent(successor);
            }
        }
    }
}

void OrderBook::transplant(Limit *u, Limit *v, OrderBookTypes::Side side) {
    Limit** root = (side == OrderBookTypes::Side::BUY) ? &buyTree : &sellTree;

    if (!u->getParent()) {
        *root = v;
    } else if (u == u->getParent()->getLeftChild()) {
        u->getParent()->setLeftChild(v);
    } else {
        u->getParent()->setRightChild(v);
    }

    if (v) {
        v->setParent(u->getParent());
    }
}

bool OrderBook::isEmpty() const {
    std::shared_lock<std::shared_mutex> lock(bookMutex);
    return orderMap.empty();
}


void OrderBook::updateInsideLimits() {
    // Update highest buy
    if (buyTree) {
        highestBuy = findMaximum(buyTree);
    } else {
        highestBuy = nullptr;
    }

    // Update lowest sell
    if (sellTree) {
        lowestSell = findMinimum(sellTree);
    } else {
        lowestSell = nullptr;
    }
}

Limit *OrderBook::findMinimum(Limit *node) const {
    while (node && node->getLeftChild()) {
        node = node->getLeftChild();
    }
    return node;
}


Limit *OrderBook::findMaximum(Limit *node) const {
    while (node && node->getRightChild()) {
        node = node->getRightChild();
    }
    return node;
}
