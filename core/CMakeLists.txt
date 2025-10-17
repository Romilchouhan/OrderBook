cmake_minimum_required(VERSION 3.16)
project(OrderBook)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find packages
find_package(Threads REQUIRED)

# Include directories
include_directories(include)

# Source files
set(SOURCES
    src/Order.cpp
    src/Limit.cpp
    src/OrderBook.cpp
)

# Create library
add_library(orderbook_lib ${SOURCES})
target_link_libraries(orderbook_lib Threads::Threads)

# Main executable
add_executable(orderbook src/main.cpp)
target_link_libraries(orderbook orderbook_lib)

# Compiler flags
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(orderbook_lib PRIVATE -Wall -Wextra -O3)
    target_compile_options(orderbook PRIVATE -Wall -Wextra -O3)
endif()
