//
// Created by Romil Chouhan on 12/10/25.
//

#include "../include/Order.h"
#include "../include/Limit.h"

Order::Order(OrderBookTypes::OrderId id, OrderBookTypes::Side side,
             OrderBookTypes::Quantity shares, OrderBookTypes::Price limit,
             OrderBookTypes::Timestamp entryTime, OrderBookTypes::Timestamp eventTime)
      : idNumber(id), side(side), shares(shares), limit(limit),
        entryTime(entryTime), eventTime(eventTime),
        nextOrder(nullptr), prevOrder(nullptr), parentLimit(nullptr){

}

void Order::reduceShares(OrderBookTypes::Quantity reduction) {
    if (reduction >= shares) {
        shares = 0;
    } else {
        shares -= reduction;
    }
}

