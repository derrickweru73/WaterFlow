import { useEffect, useState } from "react";
import { CreditCard, X, ExternalLink, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementPayments.css";

function ManagementPayments() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/management/orders/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setOrders(data);
    } catch (err) {
      console.error("Failed to load payment information:", err);

      setError(
        err.response?.data?.detail || "Unable to load payment information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const formatAmount = (amount) =>
    `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "—";

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getPaymentStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "COMPLETED":
        return "status-success";

      case "FAILED":
        return "status-danger";

      case "REFUNDED":
        return "status-warning";

      default:
        return "status-pending";
    }
  };

  const getOrderStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "DELIVERED":
        return "status-success";

      case "CANCELLED":
        return "status-danger";

      case "PAID":
        return "status-success";

      case "PROCESSING":
      case "ASSIGNED":
      case "OUT_FOR_DELIVERY":
        return "status-pending";

      default:
        return "status-pending";
    }
  };

  const openPaymentDetails = (order) => {
    setSelectedPayment(order);
  };

  const closePaymentDetails = () => {
    setSelectedPayment(null);
  };

  const openOrder = () => {
    setSelectedPayment(null);
    navigate("/management/orders");
  };

  const getPaymentReference = (order) => {
    return (
      order.payment?.mpesa_receipt_number ||
      order.payment?.receipt_number ||
      order.payment?.mpesa_receipt ||
      order.mpesa_receipt_number ||
      order.mpesa_receipt ||
      order.payment?.transaction_id ||
      order.payment?.checkout_request_id ||
      order.checkout_request_id ||
      "—"
    );
  };

  return (
    <ManagementLayout title="Payments">
      <div className="management-welcome">
        <div>
          <p>View and monitor WaterFlow customer payments.</p>
        </div>
      </div>

      <div className="management-panel-card">
        <div className="management-panel-header">
          <div>
            <h2>Customer Payments</h2>
            <p>Payment information from customer orders.</p>
          </div>

          <CreditCard size={22} />
        </div>

        {loading ? (
          <div className="management-loading">Loading payments...</div>
        ) : error ? (
          <div className="management-empty-table">{error}</div>
        ) : orders.length === 0 ? (
          <div className="management-empty-table">No payments found.</div>
        ) : (
          <div className="management-table-wrapper">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <button
                        type="button"
                        className="management-payment-order-link"
                        onClick={() => openPaymentDetails(order)}
                        title={`View payment details for order #${order.id}`}
                      >
                        #{order.id}
                      </button>
                    </td>

                    <td>{order.customer_username || "—"}</td>

                    <td>
                      <strong>{formatAmount(order.total_amount)}</strong>
                    </td>

                    <td>
                      <span
                        className={`management-status ${getPaymentStatusClass(
                          order.payment_status,
                        )}`}
                      >
                        {formatStatus(order.payment_status || "PENDING")}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`management-status ${getOrderStatusClass(
                          order.status,
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div
          className="management-payment-overlay"
          onClick={closePaymentDetails}
        >
          <div
            className="management-payment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="management-payment-modal-header">
              <div>
                <span>Payment Details</span>
                <h2>Order #{selectedPayment.id}</h2>
              </div>

              <button
                type="button"
                className="management-payment-close"
                onClick={closePaymentDetails}
              >
                <X size={19} />
              </button>
            </div>

            <div className="management-payment-modal-body">
              <div className="management-payment-summary">
                <div>
                  <span>Customer</span>
                  <strong>{selectedPayment.customer_username || "—"}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>{formatAmount(selectedPayment.total_amount)}</strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <span
                    className={`management-status ${getPaymentStatusClass(
                      selectedPayment.payment_status,
                    )}`}
                  >
                    {formatStatus(selectedPayment.payment_status || "PENDING")}
                  </span>
                </div>

                <div>
                  <span>Order Status</span>
                  <span
                    className={`management-status ${getOrderStatusClass(
                      selectedPayment.status,
                    )}`}
                  >
                    {formatStatus(selectedPayment.status)}
                  </span>
                </div>
              </div>

              <div className="management-payment-section">
                <div className="management-payment-section-title">
                  <CreditCard size={17} />
                  <h3>Payment Information</h3>
                </div>

                <div className="management-payment-info-grid">
                  <div>
                    <span>Payment Reference</span>
                    <strong>{getPaymentReference(selectedPayment)}</strong>
                  </div>

                  <div>
                    <span>Payment Date</span>
                    <strong>{formatDate(selectedPayment.created_at)}</strong>
                  </div>
                </div>
              </div>

              <div className="management-payment-section">
                <div className="management-payment-section-title">
                  <Package size={17} />
                  <h3>Order Information</h3>
                </div>

                <div className="management-payment-info-grid">
                  <div>
                    <span>Delivery Zone</span>
                    <strong>
                      {selectedPayment.delivery_zone_name ||
                        selectedPayment.delivery_zone?.name ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>
                      {selectedPayment.delivery_address ||
                        selectedPayment.address ||
                        "—"}
                    </strong>
                  </div>

                  <div className="management-payment-full-width">
                    <span>Directions</span>
                    <strong>{selectedPayment.directions || "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="management-payment-section">
                <div className="management-payment-section-title">
                  <Package size={17} />
                  <h3>Order Items</h3>
                </div>

                {Array.isArray(selectedPayment.items) &&
                selectedPayment.items.length > 0 ? (
                  <div className="management-payment-items">
                    {selectedPayment.items.map((item, index) => (
                      <div
                        className="management-payment-item"
                        key={item.id || index}
                      >
                        <div>
                          <strong>
                            {item.product_name ||
                              item.product?.name ||
                              "Product"}
                          </strong>

                          <span>Quantity: {Number(item.quantity || 0)}</span>
                        </div>

                        <strong>
                          {formatAmount(
                            Number(item.price || 0) *
                              Number(item.quantity || 0),
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="management-payment-no-items">
                    No item details available.
                  </div>
                )}
              </div>

              <div className="management-payment-actions">
                <button
                  type="button"
                  className="management-payment-close-button"
                  onClick={closePaymentDetails}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="management-payment-order-button"
                  onClick={() => openOrder(selectedPayment.id)}
                >
                  <ExternalLink size={15} />
                  View Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ManagementLayout>
  );
}

export default ManagementPayments;
