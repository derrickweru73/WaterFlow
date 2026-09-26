import { useEffect, useMemo, useState } from "react";
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
  LogOut,
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
  BellRing,
  CircleAlert,
  Search,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementNotifications.css";

function ManagementNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [readingId, setReadingId] = useState(null);

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
    loadNotifications();
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

  const getType = (notification) => notification.notification_type || "SYSTEM";

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

  const markAsRead = async (notification) => {
    if (isRead(notification)) return;

    try {
      setReadingId(notification.id);

      await api.patch(`/notifications/management/${notification.id}/read/`);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);

      setError(
        err.response?.data?.detail || "Failed to mark notification as read.",
      );
    } finally {
      setReadingId(null);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !isRead(notification)).length,
    [notifications],
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const read = isRead(notification);

      if (filter === "READ" && !read) return false;
      if (filter === "UNREAD" && read) return false;

      if (typeFilter !== "ALL" && getType(notification) !== typeFilter) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase();

        const matches =
          getTitle(notification).toLowerCase().includes(query) ||
          getMessage(notification).toLowerCase().includes(query) ||
          notification.user?.username?.toLowerCase().includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [notifications, filter, typeFilter, search]);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/management/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      path: "/management/products",
      icon: Package,
    },
    {
      label: "Orders",
      path: "/management/orders",
      icon: ShoppingCart,
    },
    {
      label: "Payments",
      path: "/management/payments",
      icon: CreditCard,
    },
    {
      label: "Inventory",
      path: "/management/inventory",
      icon: Boxes,
    },
    {
      label: "Deliveries",
      path: "/management/deliveries",
      icon: Truck,
    },
    {
      label: "Drivers",
      path: "/management/drivers",
      icon: UserRoundCog,
    },
    {
      label: "Customers",
      path: "/management/customers",
      icon: Users,
    },
    {
      label: "Notifications",
      path: "/management/notifications",
      icon: Bell,
    },
    {
      label: "Reports",
      path: "/management/reports",
      icon: BarChart3,
    },
    {
      label: "Subscriptions",
      path: "/management/subscriptions",
      icon: Repeat,
    },
  ];

  return (
    <div className="management-layout">
      <aside
        className={`management-sidebar ${
          sidebarOpen ? "management-sidebar-open" : ""
        }`}
      >
        <div className="management-brand">
          <div className="management-brand-mark">W</div>

          <div>
            <h2>WaterFlow</h2>
            <span>Management</span>
          </div>
        </div>

        <div className="management-nav-title">MAIN MENU</div>

        <nav className="management-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.path}
                className={`management-nav-item ${
                  item.label === "Notifications" ? "management-nav-active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            className="management-logout-button"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("username");
              window.location.href = "/login";
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <button
          type="button"
          className="management-mobile-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
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
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="management-page-label">Management Panel</span>
              <h1>Notifications</h1>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">A</div>

              <div className="management-user-info">
                <strong>admin</strong>
                <span>Management</span>
              </div>
            </div>
          </div>
        </header>

        <section className="management-content">
          <div className="notifications-page-header">
            <div>
              <h2>Notification Management</h2>
              <p>Monitor and manage WaterFlow system notifications.</p>
            </div>

            <button
              type="button"
              onClick={loadNotifications}
              className="notifications-refresh-button"
              disabled={loading}
            >
              <RefreshCw size={17} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="notifications-summary-grid">
            <div className="notifications-summary-card">
              <div className="notifications-summary-icon">
                <Bell size={21} />
              </div>

              <div>
                <span>Total Notifications</span>
                <strong>{notifications.length}</strong>
              </div>
            </div>

            <div className="notifications-summary-card">
              <div className="notifications-summary-icon notifications-unread-icon">
                <BellRing size={21} />
              </div>

              <div>
                <span>Unread</span>
                <strong>{unreadCount}</strong>
              </div>
            </div>

            <div className="notifications-summary-card">
              <div className="notifications-summary-icon notifications-read-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Read</span>
                <strong>{readCount}</strong>
              </div>
            </div>
          </div>

          <div className="management-panel-card notifications-panel">
            <div className="notifications-panel-header">
              <div>
                <h2>System Notifications</h2>
                <p>
                  {filteredNotifications.length} notification
                  {filteredNotifications.length === 1 ? "" : "s"} displayed
                </p>
              </div>
            </div>

            <div className="notifications-controls">
              <div className="notifications-search">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="notifications-filter-group">
                <button
                  type="button"
                  className={
                    filter === "ALL" ? "notifications-filter-active" : ""
                  }
                  onClick={() => setFilter("ALL")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={
                    filter === "UNREAD" ? "notifications-filter-active" : ""
                  }
                  onClick={() => setFilter("UNREAD")}
                >
                  Unread
                </button>

                <button
                  type="button"
                  className={
                    filter === "READ" ? "notifications-filter-active" : ""
                  }
                  onClick={() => setFilter("READ")}
                >
                  Read
                </button>
              </div>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="notifications-type-filter"
              >
                <option value="ALL">All Types</option>
                <option value="ORDER">Order</option>
                <option value="PAYMENT">Payment</option>
                <option value="DELIVERY">Delivery</option>
                <option value="SUBSCRIPTION">Subscription</option>
                <option value="INVENTORY">Inventory</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>

            {loading ? (
              <div className="notifications-state">
                <RefreshCw size={24} className="notifications-spinner" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="notifications-state notifications-error-state">
                <CircleAlert size={24} />
                <span>{error}</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notifications-state">
                <Bell size={28} />
                <strong>No notifications found.</strong>
                <span>Try changing your search or notification filters.</span>
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((notification) => {
                  const read = isRead(notification);

                  return (
                    <div
                      key={notification.id}
                      className={`notification-card ${
                        read ? "notification-read" : "notification-unread"
                      }`}
                    >
                      <div className="notification-card-icon">
                        {read ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <BellRing size={20} />
                        )}
                      </div>

                      <div className="notification-card-content">
                        <div className="notification-card-top">
                          <div>
                            <h3>{getTitle(notification)}</h3>

                            <span className="notification-type">
                              {getType(notification)}
                            </span>
                          </div>

                          <span
                            className={`notification-status ${
                              read
                                ? "notification-status-read"
                                : "notification-status-unread"
                            }`}
                          >
                            {read ? "READ" : "UNREAD"}
                          </span>
                        </div>

                        <p>{getMessage(notification)}</p>

                        <div className="notification-card-footer">
                          <span className="notification-user">
                            Customer:{" "}
                            <strong>
                              {notification.user?.username || "System User"}
                            </strong>
                          </span>

                          <span className="notification-date">
                            {formatDate(notification.created_at)}
                          </span>

                          {!read && (
                            <button
                              type="button"
                              className="notification-read-button"
                              onClick={() => markAsRead(notification)}
                              disabled={readingId === notification.id}
                            >
                              <CheckCircle2 size={15} />
                              {readingId === notification.id
                                ? "Saving..."
                                : "Mark as Read"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManagementNotifications;
