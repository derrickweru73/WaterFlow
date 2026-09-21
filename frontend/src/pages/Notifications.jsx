import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setGuest(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Unable to load notifications:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setGuest(true);
        setNotifications([]);
        return;
      }

      setError("Unable to load your notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read/`);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );

      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatType = (type) => {
    if (!type) return "Notification";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div className="products-page notifications-page">
      <div className="products-container">
        <CustomerHeader
          returnTo="/products"
          returnLabel="Return to Products"
          minimal={true}
        />

        <section className="products-intro">
          <h2>Notifications</h2>

          <p>
            Stay updated about your orders, payments, and deliveries.
          </p>

          {!guest && unreadCount > 0 && (
            <p
              style={{
                marginTop: "10px",
                fontWeight: "600",
              }}
            >
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}.
            </p>
          )}
        </section>

        {guest ? (
          <div className="notification-empty-state">
            <h3>Stay updated with WaterFlow</h3>

            <p>
              Sign in to receive updates about your orders, payments, and
              deliveries. Your notifications will appear here once you have
              an account and activity on WaterFlow.
            </p>

            <div className="notification-empty-actions">
              <Link
                to="/login"
                state={{ returnTo: "/notifications" }}
                className="product-button"
              >
                Sign In
              </Link>

              <Link
                to="/products"
                className="product-button"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : error ? (
          <p className="products-message">
            {error}
          </p>
        ) : loading ? (
          <p className="products-message">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <div className="notification-empty-state">
            <h3>No notifications yet</h3>

            <p>
              You will see updates about your orders, payments, and deliveries
              here.
            </p>

            <Link
              to="/products"
              className="product-button"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`notification-card ${
                  notification.is_read
                    ? "notification-read"
                    : "notification-unread"
                }`}
              >
                <div className="notification-card-content">
                  <div className="notification-card-top">
                    <div>
                      <h3 className="notification-title">
                        {notification.title}
                      </h3>

                      <span className="notification-type">
                        {formatType(
                          notification.notification_type,
                        )}
                      </span>
                    </div>

                    {!notification.is_read && (
                      <span className="notification-new">
                        New
                      </span>
                    )}
                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <div className="notification-footer">
                    <span className="notification-date">
                      {formatDate(notification.created_at)}
                    </span>

                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(notification.id)
                        }
                        className="notification-read-button"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
 