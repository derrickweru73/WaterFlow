import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Boxes,
  Truck,
  Users,
  UserRoundCog,
  Bell,
  BarChart3,
  Repeat,
  MapPin,
  LogOut,
  Menu,
  X,
  Search,
  Check,
  BellRing,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementNotifications.css";

function ManagementNotifications() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [markingId, setMarkingId] = useState(null);

  const menuItems = [
    ["Dashboard", LayoutDashboard, "/management/dashboard"],
    ["Products", Package, "/management/products"],
    ["Delivery Zones", MapPin, "/management/delivery-zones"],
    ["Orders", ShoppingCart, "/management/orders"],
    ["Payments", CreditCard, "/management/payments"],
    ["Inventory", Boxes, "/management/inventory"],
    ["Deliveries", Truck, "/management/deliveries"],
    ["Customers", Users, "/management/customers"],
    ["Drivers", UserRoundCog, "/management/drivers"],
    ["Notifications", Bell, "/management/notifications"],
    ["Reports", BarChart3, "/management/reports"],
    ["Subscriptions", Repeat, "/management/subscriptions"],
  ];

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/management/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profile = await api.get("/auth/protected/");

        if (
          String(profile.data.role || "")
            .trim()
            .toUpperCase() !== "MANAGEMENT"
        ) {
          navigate("/products");
          return;
        }

        setUsername(profile.data.username || "");
        await loadNotifications();
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/products");
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const markAsRead = async (notification) => {
    if (notification.is_read || notification.read) {
      return;
    }

    const notificationId = notification.id;

    try {
      setMarkingId(notificationId);
      setError("");

      await api.patch(`/notifications/management/${notificationId}/read/`);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                is_read: true,
                read: true,
              }
            : item,
        ),
      );

      setMessage("Notification marked as read.");
    } catch (err) {
      console.error(err);
      setError("Unable to mark notification as read.");
    } finally {
      setMarkingId(null);
    }
  };

  const getNotificationReadState = (notification) => {
    return Boolean(notification.is_read || notification.read);
  };

  const getNotificationType = (notification) => {
    return String(
      notification.notification_type ||
        notification.type ||
        notification.category ||
        "general",
    ).toLowerCase();
  };

  const getNotificationIcon = (notification) => {
    const type = getNotificationType(notification);

    if (
      type.includes("alert") ||
      type.includes("warning") ||
      type.includes("low")
    ) {
      return AlertTriangle;
    }

    if (
      type.includes("success") ||
      type.includes("payment") ||
      type.includes("delivered")
    ) {
      return CheckCircle;
    }

    if (type.includes("order") || type.includes("delivery")) {
      return BellRing;
    }

    return Info;
  };

  const getNotificationTitle = (notification) => {
    return (
      notification.title ||
      notification.subject ||
      notification.message ||
      "Notification"
    );
  };

  const getNotificationMessage = (notification) => {
    return (
      notification.message ||
      notification.description ||
      notification.body ||
      "No additional information."
    );
  };

  const getNotificationDate = (notification) => {
    return (
      notification.created_at ||
      notification.timestamp ||
      notification.date ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const notificationTypes = useMemo(() => {
    const types = notifications
      .map((notification) => getNotificationType(notification))
      .filter(Boolean);

    return [...new Set(types)];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      const isRead = getNotificationReadState(notification);
      const type = getNotificationType(notification);

      const matchesSearch =
        !term ||
        getNotificationTitle(notification).toLowerCase().includes(term) ||
        getNotificationMessage(notification).toLowerCase().includes(term);

      const matchesRead =
        readFilter === "all" ||
        (readFilter === "read" && isRead) ||
        (readFilter === "unread" && !isRead);

      const matchesType = typeFilter === "all" || type === typeFilter;

      return matchesSearch && matchesRead && matchesType;
    });
  }, [notifications, searchTerm, readFilter, typeFilter]);

  const unreadCount = notifications.filter(
    (notification) => !getNotificationReadState(notification),
  ).length;

  const readCount = notifications.filter((notification) =>
    getNotificationReadState(notification),
  ).length;

  return (
    <div className="management-layout">
      <aside
        className={`management-sidebar ${
          sidebarOpen ? "management-sidebar-open" : ""
        }`}
      >
        <div className="management-brand">
          <div className="management-brand-icon">W</div>

          <div>
            <h1>WaterFlow</h1>
            <span>Management</span>
          </div>

          <button
            className="management-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <nav className="management-nav">
          <p className="management-nav-title">MAIN MENU</p>

          {menuItems.map(([label, Icon, path]) => (
            <button
              key={label}
              className={`management-nav-item ${
                label === "Notifications" ? "management-nav-active" : ""
              }`}
              onClick={() => handleNavigation(path)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="management-sidebar-bottom">
          <button className="management-logout-button" onClick={handleLogout}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="management-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="management-main">
        <header className="management-topbar">
          <div className="management-topbar-left">
            <button
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div>
              <p className="management-page-label">Management Panel</p>
              <h2>Notifications</h2>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">
                {username ? username.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="management-user-info">
                <strong>{username || "admin"}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="management-content">
          <div className="management-welcome">
            <div>
              <p>Monitor system notifications and customer activity.</p>
            </div>
          </div>

          {message && <div className="notification-success">{message}</div>}

          {error && <div className="notification-error">{error}</div>}

          <div className="notification-stats">
            <div className="notification-stat-card">
              <div className="notification-stat-icon">
                <Bell />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="notification-stat-card">
              <div className="notification-stat-icon unread">
                <BellRing />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>

            <div className="notification-stat-card">
              <div className="notification-stat-icon read">
                <CheckCircle />
              </div>

              <div>
                <span>Read</span>
                <strong>{readCount}</strong>
              </div>
            </div>
          </div>

          <section className="management-panel-card">
            <div className="notification-section-header">
              <div>
                <h3>Notification List</h3>
                <p>{filteredNotifications.length} notifications displayed</p>
              </div>

              <div className="notification-filter-row">
                <div className="notification-search">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <select
                  value={readFilter}
                  onChange={(event) => setReadFilter(event.target.value)}
                  className="notification-filter"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="notification-filter"
                >
                  <option value="all">All Types</option>

                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="notification-loading">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <Bell />
                <h3>No notifications found</h3>
                <p>
                  {searchTerm || readFilter !== "all" || typeFilter !== "all"
                    ? "Try changing your filters."
                    : "There are no management notifications yet."}
                </p>
              </div>
            ) : (
              <div className="notification-table-wrapper">
                <table className="notification-table">
                  <thead>
                    <tr>
                      <th>Notification</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredNotifications.map((notification) => {
                      const isRead = getNotificationReadState(notification);
                      const Icon = getNotificationIcon(notification);
                      const type = getNotificationType(notification);

                      return (
                        <tr
                          key={notification.id}
                          className={isRead ? "" : "notification-row-unread"}
                        >
                          <td>
                            <div className="notification-name">
                              <div className="notification-icon">
                                <Icon />
                              </div>

                              <div>
                                <strong>
                                  {getNotificationTitle(notification)}
                                </strong>

                                <span>
                                  {getNotificationMessage(notification)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="notification-type">
                              {type.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`notification-status ${
                                isRead ? "read" : "unread"
                              }`}
                            >
                              {isRead ? "Read" : "Unread"}
                            </span>
                          </td>

                          <td>
                            {formatDate(getNotificationDate(notification))}
                          </td>

                          <td>
                            {!isRead && (
                              <button
                                className="notification-read-button"
                                onClick={() => markAsRead(notification)}
                                disabled={markingId === notification.id}
                              >
                                <Check />

                                {markingId === notification.id
                                  ? "Saving..."
                                  : "Mark Read"}
                              </button>
                            )}

                            {isRead && (
                              <span className="notification-read-label">
                                <Check />
                                Read
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ManagementNotifications;
