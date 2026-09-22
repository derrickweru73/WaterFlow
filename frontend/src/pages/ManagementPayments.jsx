import { useEffect, useState } from "react";
import { RefreshCw, CreditCard } from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const fetchPayments = async () => {
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

    fetchPayments();
  }, []);

  const formatAmount = (amount) =>
    `KES ${Number(amount || 0).toLocaleString()}`;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
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

  return (
    <div className="management-layout">
      <aside className="management-sidebar">
        <div className="management-brand">
          <h2>WaterFlow</h2>
          <span>Management</span>
        </div>

        <nav className="management-nav">
          <a href="/management/dashboard" className="management-nav-item">
            Dashboard
          </a>

          <a href="/management/products" className="management-nav-item">
            Products
          </a>

          <a href="/management/orders" className="management-nav-item">
            Orders
          </a>

          <a
            href="/management/payments"
            className="management-nav-item management-nav-active"
          >
            Payments
          </a>

          <a href="/management/inventory" className="management-nav-item">
            Inventory
          </a>

          <a href="/management/deliveries" className="management-nav-item">
            Deliveries
          </a>

          <a href="/management/customers" className="management-nav-item">
            Customers
          </a>

          <a href="/management/drivers" className="management-nav-item">
            Drivers
          </a>

          <a href="/management/notifications" className="management-nav-item">
            Notifications
          </a>

          <a href="/management/reports" className="management-nav-item">
            Reports
          </a>

          <a href="/management/subscriptions" className="management-nav-item">
            Subscriptions
          </a>
        </nav>

        <div className="management-sidebar-bottom">
          <a href="/login" className="management-nav-item">
            Logout
          </a>
        </div>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <div>
            <h1>Payments Management</h1>
            <p>View and monitor WaterFlow customer payments.</p>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            className="management-refresh-button"
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="management-content">
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
                          <strong>#{order.id}</strong>
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
                            {order.payment_status || "PENDING"}
                          </span>
                        </td>

                        <td>
                          <span className="management-status status-pending">
                            {order.status || "—"}
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
        </section>
      </main>
    </div>
  );
}

export default ManagementPayments;
