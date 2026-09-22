import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getNotifications = (data) => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      try {
        response = await api.get("/management/notifications/");
      } catch {
        response = await api.get("/notifications/");
      }

      setNotifications(getNotifications(response.data));
    } catch (err) {
      console.error("Failed to load notifications:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        try {
          response = await api.get("/management/notifications/");
        } catch {
          response = await api.get("/notifications/");
        }

        setNotifications(getNotifications(response.data));
      } catch (err) {
        console.error("Failed to load notifications:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load notifications. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getMessage = (notification) =>
    notification.message ||
    notification.content ||
    notification.text ||
    notification.description ||
    "Notification";

  const getTitle = (notification) =>
    notification.title ||
    notification.subject ||
    notification.type ||
    "WaterFlow Notification";

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isRead = (notification) =>
    notification.is_read === true ||
    notification.read === true ||
    notification.status === "READ";

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

          <a href="/management/inventory" className="management-nav-item">
            Inventory
          </a>

          <a href="/management/deliveries" className="management-nav-item">
            Deliveries
          </a>

          <a href="/management/drivers" className="management-nav-item">
            Drivers
          </a>

          <a href="/management/payments" className="management-nav-item">
            Payments
          </a>

          <a href="/management/customers" className="management-nav-item">
            Customers
          </a>

          <a
            href="/management/notifications"
            className="management-nav-item management-nav-active"
          >
            Notifications
          </a>

          <a href="/management/reports" className="management-nav-item">
            Reports
          </a>

          <a href="/management/subscriptions" className="management-nav-item">
            Subscriptions
          </a>
        </nav>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <div>
            <h1>Notifications</h1>
            <p>View WaterFlow system notifications.</p>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
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
                <h2>System Notifications</h2>
                <p>
                  {notifications.length} notification
                  {notifications.length === 1 ? "" : "s"}
                </p>
              </div>

              <Bell size={22} />
            </div>

            {loading ? (
              <div className="management-loading">Loading notifications...</div>
            ) : error ? (
              <div className="management-empty-table">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="management-empty-table">
                No notifications found.
              </div>
            ) : (
              <div className="management-table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>
                          <strong>{getTitle(notification)}</strong>
                        </td>

                        <td>{getMessage(notification)}</td>

                        <td>
                          <span
                            className={`management-status ${
                              isRead(notification)
                                ? "status-success"
                                : "status-pending"
                            }`}
                          >
                            {isRead(notification) ? "READ" : "UNREAD"}
                          </span>
                        </td>

                        <td>{formatDate(notification.created_at)}</td>
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

export default ManagementNotifications;
