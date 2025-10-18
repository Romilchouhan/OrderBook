cmake_minimum_required(VERSION 3.16)
project(TradingPlatform)

# Set global C++ standard (for all subprojects)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add subdirectories (you can add more later for other C++ components)
add_subdirectory(core)
