import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Droplets,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PAYMENT":
        return <CreditCard size={19} />;

      case "DELIVERY":
        return <Truck size={19} />;

      case "ORDER":
        return <Package size={19} />;

      default:
        return <Bell size={19} />;
    }
  };

  const getNotificationIconClass = (type) => {
    switch (type) {
      case "PAYMENT":
        return "notification-icon-payment";

      case "DELIVERY":
        return "notification-icon-delivery";

      case "ORDER":
        return "notification-icon-order";

      default:
        return "notification-icon-default";
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.is_read,
  ).length;

  return (
    <div className="notifications-page">
      <CustomerHeader
        returnTo="/products"
        returnLabel="Return to Products"
        minimal={true}
      />

      <main className="notifications-main">
        {/* HERO */}
        <section className="notifications-hero">
          <div className="notifications-hero-content">
            <div className="notifications-eyebrow">
              <Bell size={14} />
              WaterFlow Updates
            </div>

            <h1>Notifications</h1>

            <p>
              Stay updated about your orders, payments, and deliveries from one
              place.
            </p>
          </div>
        </section>

        {/* GUEST */}
        {guest ? (
          <div className="notification-empty-state">
            <div className="notification-empty-icon">
              <Bell size={26} />
            </div>

            <h3>Stay updated with WaterFlow</h3>

            <p>
              Sign in to receive updates about your orders, payments, and
              deliveries. Your notifications will appear here once you have
              activity on WaterFlow.
            </p>

            <div className="notification-empty-actions">
              <Link
                to="/login"
                state={{ returnTo: "/notifications" }}
                className="notification-primary-button"
              >
                Sign In
              </Link>

              <Link to="/products" className="notification-secondary-button">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="notifications-error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="notifications-loading">
            <div className="notifications-loading-icon">
              <RefreshCw size={23} />
            </div>

            <h3>Loading notifications...</h3>

            <p>We're checking for your latest WaterFlow updates.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty-state">
            <div className="notification-empty-icon">
              <CheckCircle2 size={26} />
            </div>

            <h3>No notifications yet</h3>

            <p>
              You will see updates about your orders, payments, and deliveries
              here.
            </p>

            <Link to="/products" className="notification-primary-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* SUMMARY */}
            <section className="notifications-summary">
              <div className="notification-summary-card">
                <div className="notification-summary-icon">
                  <Bell size={19} />
                </div>

                <div>
                  <span>Total Notifications</span>
                  <strong>{notifications.length}</strong>
                </div>
              </div>

              <div className="notification-summary-card">
                <div className="notification-summary-icon unread-summary">
                  <AlertCircle size={19} />
                </div>

                <div>
                  <span>Unread</span>
                  <strong>{unreadCount}</strong>
                </div>
              </div>

              <div className="notification-summary-card">
                <div className="notification-summary-icon read-summary">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <span>Read</span>
                  <strong>{readCount}</strong>
                </div>
              </div>
            </section>

            {/* HEADING */}
            <div className="notifications-heading">
              <div>
                <h2>Recent Updates</h2>

                <p>Important updates about your WaterFlow activity.</p>
              </div>

              <button
                type="button"
                className="notifications-refresh"
                onClick={fetchNotifications}
              >
                <RefreshCw size={15} />
                <span>Refresh</span>
              </button>
            </div>

            {/* LIST */}
            <section className="notifications-list">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`notification-card ${
                    notification.is_read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                >
                  <div
                    className={`notification-icon ${getNotificationIconClass(
                      notification.notification_type,
                    )}`}
                  >
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <div className="notification-card-content">
                    <div className="notification-card-top">
                      <div className="notification-title-area">
                        <h3>{notification.title}</h3>

                        <span className="notification-type">
                          {formatType(notification.notification_type)}
                        </span>
                      </div>

                      {!notification.is_read && (
                        <span className="notification-new">New</span>
                      )}
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="notification-footer">
                      <span className="notification-date">
                        {formatDate(notification.created_at)}
                      </span>

                      {!notification.is_read ? (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="notification-read-button"
                        >
                          <CheckCircle2 size={15} />
                          Mark as Read
                        </button>
                      ) : (
                        <span className="notification-read-label">
                          <CheckCircle2 size={14} />
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Notifications;
