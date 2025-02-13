# Requirements:

Boost Libraries: We need Boost libraries for networking and HTTP handling.

Install Boost on macOS using Homebrew:

```
brew install boost
```

C++17 or later: Ensure you're using a compiler that supports C++17 or later, as Boost.Beast uses features from newer C++ standards.


# Explanation of the Code:

1- Web Framework Class:

The WebFramework class listens for incoming HTTP requests and routes them based on the request's path.
It uses Boost.Asio for handling asynchronous I/O and Boost.Beast for parsing and generating HTTP messages.

2- Route Handlers:

The framework allows you to define route handlers with the route method. Each route is associated with a path (e.g., /, /hello) and a handler function.
For example, home_handler responds to / and returns a welcome message.

3- Asynchronous Request Handling:

The server uses boost::asio to asynchronously accept incoming client connections.
boost::beast::http::async_read reads the incoming request, and boost::beast::http::async_write sends the response asynchronously.

4- Sample Routes:

We define two simple routes in this example: / (home) and /hello.

# Compiling the Code:

To compile and run the C++ web server, follow these steps:

1- Install Boost on macOS (if you haven't already):

```
brew install boost
```

2- Compile the program: You can compile the code using g++ with C++17 support and the required Boost libraries:

```
g++ -std=c++17 -o web_framework web_framework.cpp -lboost_system -lboost_thread -lpthread
```

3- Run the server: After compiling, run the server with the following command:

```
./web_framework
```


# Testing the Server

1- Open your browser and visit http://127.0.0.1:8080. You should see the "Welcome to My C++ Web Framework!" message.

2- Visit http://127.0.0.1:8080/hello, and you'll see "Hello, World!".
