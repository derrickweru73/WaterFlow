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
  RefreshCw,
  Search,
  Pause,
  Play,
  Ban,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementSubscriptions.css";

function ManagementSubscriptions() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

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

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/subscriptions/management/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load subscriptions.");
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
        await loadSubscriptions();
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

  const handleRefresh = async () => {
    setMessage("");
    setError("");
    await loadSubscriptions();
  };

  const getCustomerName = (subscription) => {
    return (
      subscription.customer_username ||
      subscription.customer_name ||
      subscription.customer?.username ||
      subscription.customer?.name ||
      (typeof subscription.customer === "string"
        ? subscription.customer
        : "Customer")
    );
  };

  const getProductName = (subscription) => {
    return (
      subscription.product_name ||
      subscription.product?.name ||
      subscription.product?.title ||
      "Water Refill"
    );
  };

  const getFrequency = (subscription) => {
    return String(
      subscription.frequency ||
        subscription.interval ||
        subscription.billing_frequency ||
        "—",
    );
  };

  const getStatus = (subscription) => {
    return String(subscription.status || "UNKNOWN").toUpperCase();
  };

  const getQuantity = (subscription) => {
    return (
      subscription.quantity ||
      subscription.items?.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ) ||
      0
    );
  };

  const getAmount = (subscription) => {
    return Number(
      subscription.total_amount ||
        subscription.amount ||
        subscription.price ||
        0,
    );
  };

  const getNextDeliveryDate = (subscription) => {
    return (
      subscription.next_delivery_date ||
      subscription.next_delivery ||
      subscription.next_delivery_at ||
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

    return parsed.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString()}`;
  };

  const handleAction = async (subscription, action) => {
    const subscriptionId = subscription.id;

    try {
      setActionId(subscriptionId);
      setError("");
      setMessage("");

      await api.patch(`/subscriptions/management/${subscriptionId}/action/`, {
        action,
      });

      if (action === "pause") {
        setMessage("Subscription paused successfully.");
      } else if (action === "resume") {
        setMessage("Subscription resumed successfully.");
      } else if (action === "cancel") {
        setMessage("Subscription cancelled successfully.");
      } else {
        setMessage("Subscription updated successfully.");
      }

      await loadSubscriptions();
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail || err.response?.data?.message;

      setError(detail || "Unable to update the subscription.");
    } finally {
      setActionId(null);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const customer = getCustomerName(subscription).toLowerCase();

      const product = getProductName(subscription).toLowerCase();

      const id = String(subscription.id || "").toLowerCase();

      const frequency = getFrequency(subscription).toLowerCase();

      const status = getStatus(subscription).toLowerCase();

      const matchesSearch =
        !term ||
        customer.includes(term) ||
        product.includes(term) ||
        id.includes(term);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      const matchesFrequency =
        frequencyFilter === "all" || frequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesFrequency;
    });
  }, [subscriptions, searchTerm, statusFilter, frequencyFilter]);

  const totalSubscriptions = subscriptions.length;

  const activeSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "ACTIVE",
  ).length;

  const pausedSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "PAUSED",
  ).length;

  const cancelledSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "CANCELLED",
  ).length;

  const frequencies = useMemo(() => {
    return [
      ...new Set(
        subscriptions
          .map((subscription) => getFrequency(subscription))
          .filter((frequency) => frequency !== "—"),
      ),
    ];
  }, [subscriptions]);

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
                label === "Subscriptions" ? "management-nav-active" : ""
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
              <h2>Subscriptions</h2>
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
              <h1>Subscriptions</h1>
              <p>
                Manage recurring water delivery subscriptions and customer
                schedules.
              </p>
            </div>

            <div className="subscription-header-actions">
              <button
                className="subscription-refresh-button"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw />
                Refresh
              </button>
            </div>
          </div>

          {message && <div className="subscription-success">{message}</div>}

          {error && <div className="subscription-error">{error}</div>}

          <div className="subscription-stats">
            <div className="subscription-stat-card">
              <div className="subscription-stat-icon">
                <Repeat />
              </div>

              <div>
                <span>Total Subscriptions</span>
                <strong>{totalSubscriptions}</strong>
              </div>
            </div>

            <div className="subscription-stat-card">
              <div className="subscription-stat-icon active">
                <Play />
              </div>

              <div>
                <span>Active</span>
                <strong>{activeSubscriptions}</strong>
              </div>
            </div>

            <div className="subscription-stat-card">
              <div className="subscription-stat-icon paused">
                <Pause />
              </div>

              <div>
                <span>Paused</span>
                <strong>{pausedSubscriptions}</strong>
              </div>
            </div>

            <div className="subscription-stat-card">
              <div className="subscription-stat-icon cancelled">
                <Ban />
              </div>

              <div>
                <span>Cancelled</span>
                <strong>{cancelledSubscriptions}</strong>
              </div>
            </div>
          </div>

          <section className="management-panel-card">
            <div className="subscription-section-header">
              <div>
                <h3>Subscription List</h3>
                <p>{filteredSubscriptions.length} subscriptions displayed</p>
              </div>

              <div className="subscription-filter-row">
                <div className="subscription-search">
                  <Search />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <select
                  className="subscription-filter"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  className="subscription-filter"
                  value={frequencyFilter}
                  onChange={(event) => setFrequencyFilter(event.target.value)}
                >
                  <option value="all">All Frequencies</option>

                  {frequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="subscription-loading">
                Loading subscriptions...
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="subscription-empty">
                <Repeat />
                <h3>No subscriptions found</h3>
                <p>
                  {searchTerm ||
                  statusFilter !== "all" ||
                  frequencyFilter !== "all"
                    ? "Try changing your filters."
                    : "There are no subscriptions yet."}
                </p>
              </div>
            ) : (
              <div className="subscription-table-wrapper">
                <table className="subscription-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Frequency</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Next Delivery</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscriptions.map((subscription) => {
                      const status = getStatus(subscription);

                      const isActionLoading = actionId === subscription.id;

                      return (
                        <tr key={subscription.id}>
                          <td>
                            <div className="subscription-customer">
                              <div className="subscription-avatar">
                                {getCustomerName(subscription)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>{getCustomerName(subscription)}</strong>

                                <span>#{subscription.id}</span>
                              </div>
                            </div>
                          </td>

                          <td>{getProductName(subscription)}</td>

                          <td>
                            <span className="subscription-frequency">
                              {getFrequency(subscription)}
                            </span>
                          </td>

                          <td>{getQuantity(subscription)}</td>

                          <td className="subscription-amount">
                            {formatAmount(getAmount(subscription))}
                          </td>

                          <td>
                            <span
                              className={`subscription-status ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            {formatDate(getNextDeliveryDate(subscription))}
                          </td>

                          <td>
                            <div className="subscription-actions">
                              {status === "ACTIVE" && (
                                <>
                                  <button
                                    className="subscription-action pause"
                                    onClick={() =>
                                      handleAction(subscription, "pause")
                                    }
                                    disabled={isActionLoading}
                                    title="Pause subscription"
                                  >
                                    <Pause />
                                  </button>

                                  <button
                                    className="subscription-action cancel"
                                    onClick={() =>
                                      handleAction(subscription, "cancel")
                                    }
                                    disabled={isActionLoading}
                                    title="Cancel subscription"
                                  >
                                    <Ban />
                                  </button>
                                </>
                              )}

                              {status === "PAUSED" && (
                                <>
                                  <button
                                    className="subscription-action resume"
                                    onClick={() =>
                                      handleAction(subscription, "resume")
                                    }
                                    disabled={isActionLoading}
                                    title="Resume subscription"
                                  >
                                    <Play />
                                  </button>

                                  <button
                                    className="subscription-action cancel"
                                    onClick={() =>
                                      handleAction(subscription, "cancel")
                                    }
                                    disabled={isActionLoading}
                                    title="Cancel subscription"
                                  >
                                    <Ban />
                                  </button>
                                </>
                              )}

                              {status === "CANCELLED" && (
                                <span className="subscription-no-action">
                                  —
                                </span>
                              )}
                            </div>
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

export default ManagementSubscriptions;
