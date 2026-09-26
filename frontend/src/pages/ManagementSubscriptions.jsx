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
  Play,
  Pause,
  XCircle,
  Search,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementSubscriptions.css";

function ManagementSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);

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

      const response = await api.get("/subscriptions/management/");

      setSubscriptions(getSubscriptions(response.data));
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
    if (subscription.items?.length > 0) {
      return subscription.items
        .map((item) => {
          const quantity = item.quantity || 1;
          return `${item.product_name} × ${quantity}`;
        })
        .join(", ");
    }

    return "—";
  };

  const getFrequency = (subscription) => subscription.frequency || "—";

  const getStatus = (subscription) => subscription.status || "ACTIVE";

  const getNextDelivery = (subscription) =>
    subscription.next_delivery_date || "—";

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
      return "subscription-status-active";
    }

    if (normalized === "PAUSED") {
      return "subscription-status-paused";
    }

    if (normalized === "PENDING_PAYMENT") {
      return "subscription-status-pending";
    }

    if (normalized === "CANCELLED") {
      return "subscription-status-cancelled";
    }

    return "subscription-status-pending";
  };

  const performAction = async (subscription, action) => {
    const actionText = {
      pause: "pause",
      resume: "resume",
      cancel: "cancel",
    };

    if (action === "cancel") {
      const confirmed = window.confirm(
        `Are you sure you want to cancel subscription #${subscription.id}?`,
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setActionId(subscription.id);
      setError("");

      const response = await api.patch(
        `/subscriptions/management/${subscription.id}/action/`,
        {
          action,
        },
      );

      setSubscriptions((current) =>
        current.map((item) =>
          item.id === subscription.id ? response.data : item,
        ),
      );
    } catch (err) {
      console.error(`Failed to ${actionText[action]} subscription:`, err);

      setError(
        err.response?.data?.detail ||
          `Failed to ${actionText[action]} subscription.`,
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const status = String(getStatus(subscription)).toUpperCase();
      const frequency = String(getFrequency(subscription)).toUpperCase();
      const customer = getCustomer(subscription).toLowerCase();
      const product = getProduct(subscription).toLowerCase();
      const query = search.trim().toLowerCase();

      if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
      }

      if (frequencyFilter !== "ALL" && frequency !== frequencyFilter) {
        return false;
      }

      if (
        query &&
        !customer.includes(query) &&
        !product.includes(query) &&
        !String(subscription.id).includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [subscriptions, statusFilter, frequencyFilter, search]);

  const totalCount = subscriptions.length;

  const activeCount = subscriptions.filter(
    (subscription) => getStatus(subscription).toUpperCase() === "ACTIVE",
  ).length;

  const pausedCount = subscriptions.filter(
    (subscription) => getStatus(subscription).toUpperCase() === "PAUSED",
  ).length;

  const pendingCount = subscriptions.filter(
    (subscription) =>
      getStatus(subscription).toUpperCase() === "PENDING_PAYMENT",
  ).length;

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
                  item.label === "Subscriptions" ? "management-nav-active" : ""
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

              <h1>Subscriptions</h1>
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
          <div className="subscriptions-page-header">
            <div>
              <h2>Subscription Management</h2>

              <p>Monitor and manage recurring customer deliveries.</p>
            </div>

            <button
              type="button"
              onClick={loadSubscriptions}
              className="subscriptions-refresh-button"
              disabled={loading}
            >
              <RefreshCw size={17} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="subscriptions-summary-grid">
            <div className="subscriptions-summary-card">
              <div className="subscriptions-summary-icon">
                <Repeat size={21} />
              </div>

              <div>
                <span>Total Subscriptions</span>
                <strong>{totalCount}</strong>
              </div>
            </div>

            <div className="subscriptions-summary-card">
              <div className="subscriptions-summary-icon">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
            </div>

            <div className="subscriptions-summary-card">
              <div className="subscriptions-summary-icon">
                <Pause size={21} />
              </div>

              <div>
                <span>Paused</span>
                <strong>{pausedCount}</strong>
              </div>
            </div>

            <div className="subscriptions-summary-card">
              <div className="subscriptions-summary-icon">
                <RefreshCw size={21} />
              </div>

              <div>
                <span>Awaiting Payment</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>
          </div>

          <div className="management-panel-card subscriptions-panel">
            <div className="subscriptions-panel-header">
              <div>
                <h2>Customer Subscriptions</h2>

                <p>
                  {filteredSubscriptions.length} subscription
                  {filteredSubscriptions.length === 1 ? "" : "s"} displayed
                </p>
              </div>
            </div>

            <div className="subscriptions-controls">
              <div className="subscriptions-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search customer, product or ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="subscriptions-filter"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="PENDING_PAYMENT">Awaiting Payment</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={frequencyFilter}
                onChange={(event) => setFrequencyFilter(event.target.value)}
                className="subscriptions-filter"
              >
                <option value="ALL">All Frequencies</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {error && <div className="subscriptions-error">{error}</div>}

            {loading ? (
              <div className="subscriptions-state">
                <RefreshCw size={24} className="subscriptions-spinner" />
                <span>Loading subscriptions...</span>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="subscriptions-state">
                <Repeat size={28} />
                <strong>No subscriptions found.</strong>
                <span>Try changing your search or filters.</span>
              </div>
            ) : (
              <div className="subscriptions-list">
                {filteredSubscriptions.map((subscription) => {
                  const status = getStatus(subscription);
                  const normalizedStatus = status.toUpperCase();

                  return (
                    <div key={subscription.id} className="subscription-card">
                      <div className="subscription-card-main">
                        <div className="subscription-card-heading">
                          <div className="subscription-id">
                            #{subscription.id}
                          </div>

                          <span
                            className={`subscription-status ${getStatusClass(
                              status,
                            )}`}
                          >
                            {normalizedStatus === "PENDING_PAYMENT"
                              ? "AWAITING PAYMENT"
                              : status}
                          </span>
                        </div>

                        <div className="subscription-details">
                          <div>
                            <span>Customer</span>
                            <strong>{getCustomer(subscription)}</strong>
                          </div>

                          <div>
                            <span>Product</span>
                            <strong>{getProduct(subscription)}</strong>
                          </div>

                          <div>
                            <span>Frequency</span>
                            <strong>{getFrequency(subscription)}</strong>
                          </div>

                          <div>
                            <span>Next Delivery</span>
                            <strong>
                              {formatDate(getNextDelivery(subscription))}
                            </strong>
                          </div>
                        </div>

                        <div className="subscription-address">
                          <span>Delivery Address</span>
                          <strong>
                            {subscription.delivery_address || "—"}
                          </strong>
                        </div>
                      </div>

                      {normalizedStatus !== "PENDING_PAYMENT" &&
                        normalizedStatus !== "CANCELLED" && (
                          <div className="subscription-actions">
                            {normalizedStatus === "ACTIVE" && (
                              <button
                                type="button"
                                className="subscription-action-button pause"
                                disabled={actionId === subscription.id}
                                onClick={() =>
                                  performAction(subscription, "pause")
                                }
                              >
                                <Pause size={15} />
                                {actionId === subscription.id
                                  ? "Saving..."
                                  : "Pause"}
                              </button>
                            )}

                            {normalizedStatus === "PAUSED" && (
                              <button
                                type="button"
                                className="subscription-action-button resume"
                                disabled={actionId === subscription.id}
                                onClick={() =>
                                  performAction(subscription, "resume")
                                }
                              >
                                <Play size={15} />
                                {actionId === subscription.id
                                  ? "Saving..."
                                  : "Resume"}
                              </button>
                            )}

                            <button
                              type="button"
                              className="subscription-action-button cancel"
                              disabled={actionId === subscription.id}
                              onClick={() =>
                                performAction(subscription, "cancel")
                              }
                            >
                              <XCircle size={15} />
                              Cancel
                            </button>
                          </div>
                        )}
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

export default ManagementSubscriptions;
