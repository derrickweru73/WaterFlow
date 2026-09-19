import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/my-orders/");
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = async (orderId) => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await api.get(`/my-orders/${orderId}/`);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-700";

      case "ASSIGNED":
        return "bg-purple-100 text-purple-700";

      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";

      case "PAID":
        return "bg-green-100 text-green-700";

      case "PENDING_PAYMENT":
        return "bg-orange-100 text-orange-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/products" className="text-2xl font-bold text-blue-600">
            WaterFlow
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/products" className="text-gray-600 hover:text-blue-600">
              Products
            </Link>

            <Link to="/cart" className="text-gray-600 hover:text-blue-600">
              Cart
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>

          <p className="text-gray-600 mt-2">
            Track your water deliveries and view your order history.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No orders yet
            </h2>

            <p className="text-gray-600 mt-2">
              Your orders will appear here after you place one.
            </p>

            <Link
              to="/products"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders list */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Order #{order.id}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment</span>

                      <span className="font-medium">
                        {formatStatus(order.payment_status)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>

                      <span className="font-bold text-gray-800">
                        KES {Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">Delivery</span>

                      <p className="text-gray-800 mt-1">
                        {order.delivery_address || "Not available"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => viewOrder(order.id)}
                    className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                  >
                    Track Order
                  </button>
                </div>
              ))}
            </div>

            {/* Order details */}
            <div>
              {!selectedOrder ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                  Select an order to view its tracking details.
                </div>
              ) : detailLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  Loading order details...
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Order #{selectedOrder.id}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        selectedOrder.status,
                      )}`}
                    >
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </div>

                  {/* Tracking progress */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Delivery Progress
                    </h3>

                    <div className="space-y-3">
                      {[
                        "PENDING_PAYMENT",
                        "PAID",
                        "PROCESSING",
                        "ASSIGNED",
                        "OUT_FOR_DELIVERY",
                        "DELIVERED",
                      ].map((status, index) => {
                        const statusOrder = [
                          "PENDING_PAYMENT",
                          "PAID",
                          "PROCESSING",
                          "ASSIGNED",
                          "OUT_FOR_DELIVERY",
                          "DELIVERED",
                        ];

                        const currentIndex = statusOrder.indexOf(
                          selectedOrder.status,
                        );

                        const completed = currentIndex >= index;

                        return (
                          <div key={status} className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                completed ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            />

                            <span
                              className={
                                completed
                                  ? "text-gray-800 font-medium"
                                  : "text-gray-400"
                              }
                            >
                              {formatStatus(status)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="border-t pt-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Items</h3>

                    <div className="space-y-3">
                      {selectedOrder.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.product_name}
                            </p>

                            <p className="text-sm text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <p className="font-medium">
                            KES {Number(item.subtotal).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery information */}
                  <div className="border-t pt-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Delivery Information
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {selectedOrder.delivery_address || "Not available"}
                      </p>

                      {selectedOrder.delivery_instructions && (
                        <p>
                          <span className="font-medium">Instructions:</span>{" "}
                          {selectedOrder.delivery_instructions}
                        </p>
                      )}

                      {selectedOrder.delivery_zone_name && (
                        <p>
                          <span className="font-medium">Delivery Zone:</span>{" "}
                          {selectedOrder.delivery_zone_name}
                        </p>
                      )}

                      <p>
                        <span className="font-medium">Delivery Fee:</span> KES{" "}
                        {Number(selectedOrder.delivery_fee || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Payment
                    </h3>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Status</span>

                      <span className="font-medium">
                        {formatStatus(selectedOrder.payment_status)}
                      </span>
                    </div>

                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">Order Total</span>

                      <span className="font-bold">
                        KES {Number(selectedOrder.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
