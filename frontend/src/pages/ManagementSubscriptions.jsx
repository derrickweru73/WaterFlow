import { useEffect, useState } from "react";
import { RefreshCw, Repeat } from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getSubscriptions = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.results || [];
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // This is the management endpoint from subscriptions/urls.py
      const response = await api.get("/subscriptions/management/");

      const data = getSubscriptions(response.data);

      setSubscriptions(data);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have management access.");
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load subscriptions. Please try again.",
        );
      }

      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const getCustomer = (subscription) => {
    if (subscription.customer_username) {
      return subscription.customer_username;
    }

    if (typeof subscription.customer === "string") {
      return subscription.customer;
    }

    if (subscription.customer?.username) {
      return subscription.customer.username;
    }

    if (subscription.customer?.email) {
      return subscription.customer.email;
    }

    return `User #${subscription.customer || "—"}`;
  };

  const getProduct = (subscription) => {
    // Your backend serializer returns items[],
    // and each item has product_name.
    if (subscription.items?.length > 0) {
      return subscription.items
        .map((item) => {
          const quantity = item.quantity || 1;
          return `${item.product_name} × ${quantity}`;
        })
        .join(", ");
    }

    if (subscription.product_name) {
      return subscription.product_name;
    }

    if (typeof subscription.product === "string") {
      return subscription.product;
    }

    if (subscription.product?.name) {
      return subscription.product.name;
    }

    return "—";
  };

  const getFrequency = (subscription) =>
    subscription.frequency ||
    subscription.interval ||
    subscription.plan ||
    "—";

  const getStatus = (subscription) =>
    subscription.status || "ACTIVE";

  const getNextDelivery = (subscription) =>
    subscription.next_delivery ||
    subscription.next_delivery_date ||
    subscription.next_billing_date ||
    "—";

  const formatDate = (date) => {
    if (!date || date === "—") {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status).toUpperCase();

    if (normalized === "ACTIVE") {
      return "status-success";
    }

    if (
      normalized === "PAUSED" ||
      normalized === "PENDING" ||
      normalized === "PENDING_PAYMENT"
    ) {
      return "status-pending";
    }

    if (
      normalized === "CANCELLED" ||
      normalized === "CANCELED"
    ) {
      return "status-danger";
    }

    return "status-warning";
  };

  const activeCount = subscriptions.filter(
    (subscription) =>
      String(getStatus(subscription)).toUpperCase() === "ACTIVE",
  ).length;

  const pausedCount = subscriptions.filter(
    (subscription) =>
      String(getStatus(subscription)).toUpperCase() === "PAUSED",
  ).length;

  return (
    <div className="management-layout">
      <aside className="management-sidebar">
        <div className="management-brand">
          <h2>WaterFlow</h2>
          <span>Management</span>
        </div>

        <nav className="management-nav">
          <a
            href="/management/dashboard"
            className="management-nav-item"
          >
            Dashboard
          </a>

          <a
            href="/management/products"
            className="management-nav-item"
          >
            Products
          </a>

          <a
            href="/management/orders"
            className="management-nav-item"
          >
            Orders
          </a>

          <a
            href="/management/inventory"
            className="management-nav-item"
          >
            Inventory
          </a>

          <a
            href="/management/deliveries"
            className="management-nav-item"
          >
            Deliveries
          </a>

          <a
            href="/management/drivers"
            className="management-nav-item"
          >
            Drivers
          </a>

          <a
            href="/management/payments"
            className="management-nav-item"
          >
            Payments
          </a>

          <a
            href="/management/customers"
            className="management-nav-item"
          >
            Customers
          </a>

          <a
            href="/management/notifications"
            className="management-nav-item"
          >
            Notifications
          </a>

          <a
            href="/management/reports"
            className="management-nav-item"
          >
            Reports
          </a>

          <a
            href="/management/subscriptions"
            className="management-nav-item management-nav-active"
          >
            Subscriptions
          </a>
        </nav>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <div>
            <h1>Subscriptions</h1>
            <p>
              Monitor recurring WaterFlow customer deliveries.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSubscriptions}
            className="management-refresh-button"
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        <section className="management-content">
          <div className="management-stat-grid">
            <div className="management-stat-card">
              <div className="management-stat-icon">
                <Repeat size={21} />
              </div>

              <div>
                <span>Total Subscriptions</span>
                <strong>{subscriptions.length}</strong>
              </div>
            </div>

            <div className="management-stat-card">
              <div className="management-stat-icon">
                <Repeat size={21} />
              </div>

              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
            </div>

            <div className="management-stat-card">
              <div className="management-stat-icon">
                <Repeat size={21} />
              </div>

              <div>
                <span>Paused</span>
                <strong>{pausedCount}</strong>
              </div>
            </div>
          </div>

          <div className="management-panel-card">
            <div className="management-panel-header">
              <div>
                <h2>Subscription List</h2>

                <p>
                  {subscriptions.length} subscription
                  {subscriptions.length === 1 ? "" : "s"}
                </p>
              </div>

              <Repeat size={22} />
            </div>

            {loading ? (
              <div className="management-loading">
                Loading subscriptions...
              </div>
            ) : error ? (
              <div className="management-empty-table">
                {error}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="management-empty-table">
                No subscriptions found.
              </div>
            ) : (
              <div className="management-table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Next Delivery</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subscriptions.map((subscription) => {
                      const status = getStatus(subscription);

                      return (
                        <tr key={subscription.id}>
                          <td>#{subscription.id}</td>

                          <td>
                            <strong>
                              {getCustomer(subscription)}
                            </strong>
                          </td>

                          <td>
                            {getProduct(subscription)}
                          </td>

                          <td>
                            {getFrequency(subscription)}
                          </td>

                          <td>
                            <span
                              className={`management-status ${getStatusClass(
                                status,
                              )}`}
                            >
                              {status === "PENDING_PAYMENT"
                                ? "AWAITING PAYMENT"
                                : status}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              getNextDelivery(subscription),
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

export default ManagementSubscriptions;
 