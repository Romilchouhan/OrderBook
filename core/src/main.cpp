//
// Created by Romil Chouhan on 13/10/25.
//

#include "../include/OrderBook.h"
#include <iostream>
#include <memory>
#include <chrono>

int main() {
    OrderBook book;

    // Create some sample orders
    auto order1 = std::make_unique<Order>(1, OrderBookTypes::Side::BUY, 100, 9950, 1000, 1000);
    auto order2 = std::make_unique<Order>(2, OrderBookTypes::Side::BUY, 200, 9945, 1001, 1001);
    auto order3 = std::make_unique<Order>(3, OrderBookTypes::Side::SELL, 150, 10050, 1002, 1002);
    auto order4 = std::make_unique<Order>(4, OrderBookTypes::Side::SELL, 300, 10055, 1003, 1003);

    // Add orders to book
    std::cout << "Adding orders to book..." << std::endl;
    book.addOrder(std::move(order1));
    book.addOrder(std::move(order2));
    book.addOrder(std::move(order3));
    book.addOrder(std::move(order4));

    // Display book state
    std::cout << "Best Bid: " << book.getBestBid() << std::endl;
    std::cout << "Best Ask: " << book.getBestAsk() << std::endl;
    std::cout << "Total Orders: " << book.getOrderCount() << std::endl;

    // Cancel an order
    std::cout << "\nCancelling order 2..." << std::endl;
    book.cancelOrder(2);

    std::cout << "Best Bid after cancel: " << book.getBestBid() << std::endl;
    std::cout << "Total Orders: " << book.getOrderCount() << std::endl;

    return 0;
}
