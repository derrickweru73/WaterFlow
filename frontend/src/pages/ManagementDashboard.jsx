import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", {
          state: {
            message: "Please sign in to access the management panel.",
            returnTo: "/management/dashboard",
          },
        });
        return;
      }

      try {
        const profileResponse = await api.get("/auth/protected/");

        const role = String(profileResponse.data.role || "")
          .trim()
          .toUpperCase();

        if (role !== "MANAGEMENT") {
          navigate("/products");
          return;
        }

        setUsername(profileResponse.data.username || "");

        const [ordersResponse, deliveriesResponse] = await Promise.all([
          api.get("/management/orders/"),
          api.get("/management/deliveries/"),
        ]);

        setOrders(
          Array.isArray(ordersResponse.data) ? ordersResponse.data : [],
        );

        setDeliveries(
          Array.isArray(deliveriesResponse.data) ? deliveriesResponse.data : [],
        );
      } catch (error) {
        console.error("Management dashboard error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          navigate("/login", {
            state: {
              message: "Your session has expired. Please sign in again.",
              returnTo: "/management/dashboard",
            },
          });
        }
      } finally {
        setLoading(false);
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/products", {
      state: {
        message: "You have been logged out successfully.",
      },
    });
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const isToday = (dateString) => {
    if (!dateString) {
      return false;
    }

    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const completedOrders = orders.filter(
    (order) => order.payment_status === "COMPLETED",
  );

  const todaysCompletedOrders = completedOrders.filter((order) =>
    isToday(order.updated_at || order.created_at),
  );

  const todaysSales = todaysCompletedOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0,
  );

  const totalOrders = orders.length;

  /*
   * Orders that still need management attention.
   * PAID orders are included because they have been paid
   * but may still need processing/assignment.
   */
  const pendingOrders = orders.filter((order) =>
    ["PENDING_PAYMENT", "PAID", "PROCESSING"].includes(order.status),
  ).length;

  const todaysDeliveries = deliveries.filter((delivery) =>
    isToday(delivery.created_at),
  );

  const pendingDeliveries = todaysDeliveries.filter(
    (delivery) => delivery.status === "PENDING",
  ).length;

  const assignedDeliveries = todaysDeliveries.filter(
    (delivery) => delivery.status === "ASSIGNED",
  ).length;

  const onTheWayDeliveries = todaysDeliveries.filter(
    (delivery) => delivery.status === "OUT_FOR_DELIVERY",
  ).length;

  const deliveredDeliveries = todaysDeliveries.filter(
    (delivery) => delivery.status === "DELIVERED",
  ).length;

  /*
   * Order status distribution.
   *
   * We group:
   * PENDING_PAYMENT + PAID + ASSIGNED
   * into the broader "Pending" category.
   *
   * This ensures every active order is represented
   * in the four dashboard categories.
   */
  const pendingStatusOrders = orders.filter((order) =>
    ["PENDING_PAYMENT", "PENDING", "PAID", "ASSIGNED"].includes(order.status),
  ).length;

  const processingStatusOrders = orders.filter(
    (order) => order.status === "PROCESSING",
  ).length;

  const outForDeliveryOrders = orders.filter(
    (order) => order.status === "OUT_FOR_DELIVERY",
  ).length;

  const deliveredStatusOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const salesByDay = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const daySales = completedOrders
      .filter((order) => {
        if (!order.updated_at && !order.created_at) {
          return false;
        }

        const orderDate = new Date(order.updated_at || order.created_at);

        return (
          orderDate.getFullYear() === date.getFullYear() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getDate() === date.getDate()
        );
      })
      .reduce((total, order) => total + Number(order.total_amount || 0), 0);

    salesByDay.push({
      label: date.toLocaleDateString("en-KE", {
        weekday: "short",
      }),
      amount: daySales,
    });
  }

  const maximumSales = Math.max(...salesByDay.map((day) => day.amount), 1);

  const formatCurrency = (amount) =>
    `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) {
      return "—";
    }

    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
    });
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      PENDING_PAYMENT: "Pending Payment",
      PAID: "Paid",
      PROCESSING: "Processing",
      ASSIGNED: "Assigned",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };

    return labels[status] || status || "Unknown";
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/management/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      path: "/management/products",
    },

    {
      label: "Delivery Zones",
      icon: MapPin,
      path: "/management/delivery-zones",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      path: "/management/orders",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/management/payments",
    },
    {
      label: "Inventory",
      icon: Boxes,
      path: "/management/inventory",
    },
    {
      label: "Deliveries",
      icon: Truck,
      path: "/management/deliveries",
    },
    {
      label: "Customers",
      icon: Users,
      path: "/management/customers",
    },
    {
      label: "Drivers",
      icon: UserRoundCog,
      path: "/management/drivers",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/management/notifications",
    },
    {
      label: "Reports",
      icon: BarChart3,
      path: "/management/reports",
    },
    {
      label: "Subscriptions",
      icon: Repeat,
      path: "/management/subscriptions",
    },
  ];

  if (loading) {
    return (
      <div className="management-loading">
        <div className="management-spinner" />
        <p>Loading management dashboard...</p>
      </div>
    );
  }

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
            type="button"
            className="management-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="management-nav">
          <p className="management-nav-title">MAIN MENU</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path === "/management/dashboard" &&
                location.pathname === "/management/dashboard/");

            return (
              <button
                key={item.label}
                type="button"
                className={`management-nav-item ${
                  isActive ? "management-nav-active" : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            className="management-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
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
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="management-page-label">Management Panel</p>

              <h2>Dashboard</h2>
            </div>
          </div>

          <div className="management-topbar-right">
            <button
              type="button"
              className="management-topbar-icon"
              title="Notifications"
              onClick={() => handleNavigation("/management/notifications")}
            >
              <Bell size={20} />
            </button>

            <div className="management-user">
              <div className="management-avatar">
                {username ? username.charAt(0).toUpperCase() : "M"}
              </div>

              <div className="management-user-info">
                <strong>{username || "Management"}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="management-content">
          <div className="management-welcome">
            <div>
              <h1>Welcome back, {username || "Management"}!</h1>

              <p>Here's an overview of your WaterFlow operations.</p>
            </div>

            <div className="management-date">
              <span>Today</span>

              <strong>
                {new Date().toLocaleDateString("en-KE", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>

          <section className="management-stat-grid">
            <article className="management-stat-card">
              <div className="management-stat-icon sales">KES</div>

              <div>
                <p>Today's Sales</p>
                <h3>{formatCurrency(todaysSales)}</h3>
                <span>Today's completed payments</span>
              </div>
            </article>

            <article className="management-stat-card">
              <div className="management-stat-icon orders">
                <ShoppingCart size={21} />
              </div>

              <div>
                <p>Total Orders</p>
                <h3>{totalOrders}</h3>
                <span>Orders received</span>
              </div>
            </article>

            <article className="management-stat-card">
              <div className="management-stat-icon pending">
                <Package size={21} />
              </div>

              <div>
                <p>Pending Orders</p>
                <h3>{pendingOrders}</h3>
                <span>Orders awaiting processing</span>
              </div>
            </article>

            <article className="management-stat-card">
              <div className="management-stat-icon deliveries">
                <Truck size={21} />
              </div>

              <div>
                <p>Deliveries Today</p>
                <h3>{todaysDeliveries.length}</h3>
                <span>Scheduled deliveries</span>
              </div>
            </article>

            <article className="management-stat-card">
              <div className="management-stat-icon stock">
                <Boxes size={21} />
              </div>

              <div>
                <p>Low Stock</p>
                <h3>—</h3>
                <span>Inventory monitoring coming next</span>
              </div>
            </article>

            <article className="management-stat-card">
              <div className="management-stat-icon customers">
                <Users size={21} />
              </div>

              <div>
                <p>Customers</p>
                <h3>—</h3>
                <span>Customer endpoint coming next</span>
              </div>
            </article>
          </section>

          <section className="management-main-grid">
            <article className="management-panel-card sales-panel">
              <div className="management-panel-header">
                <div>
                  <h3>Sales Overview</h3>
                  <p>Completed payments over the last 7 days</p>
                </div>

                <span className="management-sales-total">
                  {formatCurrency(
                    salesByDay.reduce((total, day) => total + day.amount, 0),
                  )}
                </span>
              </div>

              <div className="management-chart">
                <div className="chart-y-labels">
                  <span>{formatCurrency(maximumSales)}</span>
                  <span>{formatCurrency(maximumSales * 0.75)}</span>
                  <span>{formatCurrency(maximumSales * 0.5)}</span>
                  <span>{formatCurrency(maximumSales * 0.25)}</span>
                  <span>KES 0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-line line-1" />
                  <div className="chart-grid-line line-2" />
                  <div className="chart-grid-line line-3" />
                  <div className="chart-grid-line line-4" />
                  <div className="chart-grid-line line-5" />

                  <div className="chart-bars">
                    {salesByDay.map((day) => (
                      <div className="chart-bar-group" key={day.label}>
                        <div
                          className="chart-bar"
                          style={{
                            height: `${Math.max(
                              (day.amount / maximumSales) * 100,
                              day.amount > 0 ? 8 : 2,
                            )}%`,
                          }}
                          title={formatCurrency(day.amount)}
                        />

                        <span>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="management-panel-card order-panel">
              <div className="management-panel-header">
                <div>
                  <h3>Order Status</h3>
                  <p>Current order distribution</p>
                </div>
              </div>

              <div className="order-status-chart">
                <div className="status-donut">
                  <div className="status-donut-inner">
                    <strong>{totalOrders}</strong>
                    <span>Orders</span>
                  </div>
                </div>

                <div className="status-legend">
                  <div>
                    <span className="legend-dot pending-dot" />
                    <p>Pending</p>
                    <strong>{pendingStatusOrders}</strong>
                  </div>

                  <div>
                    <span className="legend-dot processing-dot" />
                    <p>Processing</p>
                    <strong>{processingStatusOrders}</strong>
                  </div>

                  <div>
                    <span className="legend-dot delivery-dot" />
                    <p>Out for Delivery</p>
                    <strong>{outForDeliveryOrders}</strong>
                  </div>

                  <div>
                    <span className="legend-dot delivered-dot" />
                    <p>Delivered</p>
                    <strong>{deliveredStatusOrders}</strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="management-bottom-grid">
            <article className="management-panel-card">
              <div className="management-panel-header">
                <div>
                  <h3>Recent Orders</h3>
                  <p>Your latest customer orders</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/management/orders")}
                >
                  View All
                </button>
              </div>

              {dashboardLoading ? (
                <div className="management-empty-table">
                  <p>Loading orders...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="management-empty-table">
                  <ShoppingCart size={32} />
                  <h4>No recent orders</h4>
                  <p>Customer orders will appear here.</p>
                </div>
              ) : (
                <div className="management-orders-list">
                  {recentOrders.map((order) => (
                    <div className="management-order-row" key={order.id}>
                      <div className="management-order-icon">
                        <ShoppingCart size={18} />
                      </div>

                      <div className="management-order-info">
                        <strong>Order #{order.id}</strong>

                        <span>
                          {order.customer_username || "Customer"} •{" "}
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <div className="management-order-total">
                        <strong>{formatCurrency(order.total_amount)}</strong>

                        <span>{getOrderStatusLabel(order.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="management-panel-card">
              <div className="management-panel-header">
                <div>
                  <h3>Delivery Activity</h3>
                  <p>Today's delivery progress</p>
                </div>
              </div>

              <div className="delivery-summary">
                <div className="delivery-summary-item">
                  <div className="delivery-summary-icon">
                    <Truck size={19} />
                  </div>

                  <div>
                    <strong>{pendingDeliveries}</strong>
                    <span>Pending</span>
                  </div>
                </div>

                <div className="delivery-summary-item">
                  <div className="delivery-summary-icon">
                    <UserRoundCog size={19} />
                  </div>

                  <div>
                    <strong>{assignedDeliveries}</strong>
                    <span>Assigned</span>
                  </div>
                </div>

                <div className="delivery-summary-item">
                  <div className="delivery-summary-icon">
                    <Truck size={19} />
                  </div>

                  <div>
                    <strong>{onTheWayDeliveries}</strong>
                    <span>On the way</span>
                  </div>
                </div>

                <div className="delivery-summary-item">
                  <div className="delivery-summary-icon">
                    <Package size={19} />
                  </div>

                  <div>
                    <strong>{deliveredDeliveries}</strong>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ManagementDashboard;
