//
// Created by Romil Chouhan on 12/10/25.
//

#ifndef TYPES_H
#define TYPES_H

#pragma once
#include <stdint.h>

namespace OrderBookTypes {
    using OrderId = uint64_t;
    using Price = int64_t;
    using Quantity = uint32_t;
    using Timestamp = uint64_t;

    enum class Side: bool {
        BUY = true,
        SELL = false
    };

    enum class OrderType {
        LIMIT,
        MARKET
    };
}



#endif //TYPES_H
