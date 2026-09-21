import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Orders() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/my-orders/");
      const fetchedOrders = response.data;

      setOrders(fetchedOrders);

      /*
       * If Payment redirected here after a successful payment,
       * automatically open that order.
       */
      const paidOrderId = location.state?.orderId;

      if (paidOrderId) {
        await viewOrder(paidOrderId);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "order-status order-status-delivered";

      case "OUT_FOR_DELIVERY":
        return "order-status order-status-out";

      case "ASSIGNED":
        return "order-status order-status-assigned";

      case "PROCESSING":
        return "order-status order-status-processing";

      case "PAID":
        return "order-status order-status-paid";

      case "PENDING_PAYMENT":
        return "order-status order-status-pending";

      case "CANCELLED":
        return "order-status order-status-cancelled";

      default:
        return "order-status order-status-default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const statusOrder = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <CustomerHeader
            returnTo="/products"
            returnLabel="Return to Products"
            minimal={true}
          />

          <div className="orders-message">
            Loading your orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <CustomerHeader
          returnTo="/products"
          returnLabel="Return to Products"
          minimal={true}
        />

        <section className="orders-intro">
          <h2>My Orders</h2>

          <p>
            Track your water deliveries and view your order history.
          </p>
        </section>

        {error && (
          <div className="orders-error">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <h3>No orders yet</h3>

            <p>
              Your orders will appear here after you place one.
            </p>

            <Link
              to="/products"
              className="orders-browse-button"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-layout">
            <section className="orders-list">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="order-card"
                >
                  <div className="order-card-header">
                    <div>
                      <h3>
                        Order #{order.id}
                      </h3>

                      <p className="order-date">
                        {new Date(
                          order.created_at,
                        ).toLocaleString()}
                      </p>
                    </div>

                    <span
                      className={getStatusClass(
                        order.status,
                      )}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="order-summary">
                    <div className="order-summary-row">
                      <span>Payment</span>

                      <strong>
                        {formatStatus(
                          order.payment_status,
                        )}
                      </strong>
                    </div>

                    <div className="order-summary-row">
                      <span>Total</span>

                      <strong className="order-total">
                        KES{" "}
                        {Number(
                          order.total_amount,
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div className="order-delivery">
                      <span>Delivery</span>

                      <p>
                        {order.delivery_address ||
                          "Not available"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      viewOrder(order.id)
                    }
                    className="order-track-button"
                  >
                    Track Order
                  </button>
                </article>
              ))}
            </section>

            <section className="order-details">
              {!selectedOrder ? (
                <div className="order-details-placeholder">
                  <h3>Select an Order</h3>

                  <p>
                    Select an order to view its tracking details.
                  </p>
                </div>
              ) : detailLoading ? (
                <div className="order-details-placeholder">
                  <p>
                    Loading order details...
                  </p>
                </div>
              ) : (
                <article className="order-details-card">
                  <div className="order-details-header">
                    <h2>
                      Order #{selectedOrder.id}
                    </h2>

                    <span
                      className={getStatusClass(
                        selectedOrder.status,
                      )}
                    >
                      {formatStatus(
                        selectedOrder.status,
                      )}
                    </span>
                  </div>

                  <div className="order-section">
                    <h3>
                      Delivery Progress
                    </h3>

                    <div className="order-progress">
                      {statusOrder.map(
                        (status, index) => {
                          const currentIndex =
                            statusOrder.indexOf(
                              selectedOrder.status,
                            );

                          const completed =
                            currentIndex >= index;

                          return (
                            <div
                              key={status}
                              className="order-progress-item"
                            >
                              <div
                                className={
                                  completed
                                    ? "order-progress-dot order-progress-complete"
                                    : "order-progress-dot"
                                }
                              />

                              <span
                                className={
                                  completed
                                    ? "order-progress-label order-progress-label-complete"
                                    : "order-progress-label"
                                }
                              >
                                {formatStatus(
                                  status,
                                )}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>Items</h3>

                    <div className="order-items">
                      {selectedOrder.items?.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="order-item"
                          >
                            <div>
                              <p className="order-item-name">
                                {item.product_name}
                              </p>

                              <p className="order-item-quantity">
                                Quantity:{" "}
                                {item.quantity}
                              </p>
                            </div>

                            <strong>
                              KES{" "}
                              {Number(
                                item.subtotal,
                              ).toFixed(2)}
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="order-section">
                    <h3>
                      Delivery Information
                    </h3>

                    <div className="order-information">
                      <p>
                        <strong>
                          Address:
                        </strong>{" "}
                        {selectedOrder.delivery_address ||
                          "Not available"}
                      </p>

                      {selectedOrder.delivery_instructions && (
                        <p>
                          <strong>
                            Instructions:
                          </strong>{" "}
                          {
                            selectedOrder.delivery_instructions
                          }
                        </p>
                      )}

                      {selectedOrder.delivery_zone_name && (
                        <p>
                          <strong>
                            Delivery Zone:
                          </strong>{" "}
                          {
                            selectedOrder.delivery_zone_name
                          }
                        </p>
                      )}

                      <p>
                        <strong>
                          Delivery Fee:
                        </strong>{" "}
                        KES{" "}
                        {Number(
                          selectedOrder.delivery_fee ||
                            0,
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="order-section order-payment-section">
                    <h3>Payment</h3>

                    <div className="order-summary-row">
                      <span>
                        Payment Status
                      </span>

                      <strong>
                        {formatStatus(
                          selectedOrder.payment_status,
                        )}
                      </strong>
                    </div>

                    <div className="order-summary-row">
                      <span>Order Total</span>

                      <strong className="order-total">
                        KES{" "}
                        {Number(
                          selectedOrder.total_amount,
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </article>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
 