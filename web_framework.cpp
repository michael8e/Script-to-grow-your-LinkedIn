#include <iostream>
#include <string>
#include <unordered_map>
#include <functional>
#include <boost/asio.hpp>
#include <boost/beast.hpp>
#include <boost/optional.hpp>
#include <boost/algorithm/string.hpp>

namespace beast = boost::beast;  // Boost.Beast for HTTP
namespace asio = boost::asio;    // Boost.Asio for asynchronous I/O
using tcp = asio::ip::tcp;

namespace web {

    // Request handler type: routes are mapped to this
    using handler_t = std::function<void(beast::http::request<beast::http::string_body>&, beast::http::response<beast::http::string_body>&)>;

    class WebFramework {
    public:
        WebFramework(asio::io_context& io_context, unsigned short port)
            : acceptor_(io_context, tcp::endpoint(tcp::v4(), port)) {}

        void run() {
            start_accepting();
        }

        // Route handler registration
        void route(const std::string& path, handler_t handler) {
            routes_[path] = handler;
        }

    private:
        void start_accepting() {
            auto socket = std::make_shared<tcp::socket>(acceptor_.get_executor().context());
            acceptor_.async_accept(*socket, [this, socket](boost::system::error_code ec) {
                if (!ec) {
                    handle_request(socket);
                }
                start_accepting();
            });
        }

        void handle_request(std::shared_ptr<tcp::socket> socket) {
            auto buffer = std::make_shared<boost::beast::flat_buffer>();
            auto req = std::make_shared<beast::http::request<beast::http::string_body>>();
            auto res = std::make_shared<beast::http::response<beast::http::string_body>>();

            beast::http::async_read(*socket, *buffer, *req, [this, socket, buffer, req, res](boost::system::error_code ec, std::size_t bytes_transferred) {
                if (!ec) {
                    auto target = req->target().to_string();
                    if (routes_.find(target) != routes_.end()) {
                        routes_[target](*req, *res);
                    } else {
                        res->result(beast::http::status::not_found);
                        res->body() = "404 Not Found";
                    }

                    res->set(beast::http::field::content_type, "text/html");
                    beast::http::async_write(*socket, *res, [socket](boost::system::error_code ec, std::size_t) {
                        socket->shutdown(tcp::socket::shutdown_send, ec);
                    });
                }
            });
        }

    private:
        tcp::acceptor acceptor_;
        std::unordered_map<std::string, handler_t> routes_;
    };

}  // namespace web

// Sample route handler for the "/" endpoint
void home_handler(beast::http::request<beast::http::string_body>& req, beast::http::response<beast::http::string_body>& res) {
    res->result(beast::http::status::ok);
    res->body() = "<html><body><h1>Welcome to My C++ Web Framework!</h1></body></html>";
}

// Sample route handler for the "/hello" endpoint
void hello_handler(beast::http::request<beast::http::string_body>& req, beast::http::response<beast::http::string_body>& res) {
    res->result(beast::http::status::ok);
    res->body() = "<html><body><h1>Hello, World!</h1></body></html>";
}

int main() {
    try {
        asio::io_context io_context;
        web::WebFramework server(io_context, 8080);

        // Register routes
        server.route("/", home_handler);
        server.route("/hello", hello_handler);

        std::cout << "Server running at http://127.0.0.1:8080" << std::endl;

        // Start the server
        server.run();

        io_context.run();
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << std::endl;
    }

    return 0;
}
