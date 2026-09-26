import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Users,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementReports.css";

function ManagementReports() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/management/orders/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setOrders(data);
    } catch (err) {
      console.error("Reports error:", err);
      setError(err.response?.data?.detail || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const report = useMemo(() => {
    const completedPaymentStatuses = ["COMPLETED"];

    const paidOrderStatuses = [
      "PAID",
      "PROCESSING",
      "ASSIGNED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    const completedOrders = orders.filter(
      (order) =>
        completedPaymentStatuses.includes(order.payment_status) ||
        paidOrderStatuses.includes(order.status),
    );

    const pendingPayments = orders.filter(
      (order) =>
        order.payment_status === "PENDING" ||
        order.status === "PENDING_PAYMENT",
    );

    const failedPayments = orders.filter(
      (order) => order.payment_status === "FAILED",
    );

    const refundedPayments = orders.filter(
      (order) => order.payment_status === "REFUNDED",
    );

    const deliveredOrders = orders.filter(
      (order) => order.status === "DELIVERED",
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === "CANCELLED",
    );

    const activeOrders = orders.filter((order) =>
      ["PAID", "PROCESSING", "ASSIGNED", "OUT_FOR_DELIVERY"].includes(
        order.status,
      ),
    );

    const totalRevenue = completedOrders.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0,
    );

    const pendingAmount = pendingPayments.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0,
    );

    const failedAmount = failedPayments.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0,
    );

    const refundedAmount = refundedPayments.reduce(
      (total, order) => total + Number(order.total_amount || 0),
      0,
    );

    const statusCounts = {};

    orders.forEach((order) => {
      const status = order.status || "UNKNOWN";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingPayments: pendingPayments.length,
      failedPayments: failedPayments.length,
      refundedPayments: refundedPayments.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      pendingAmount,
      failedAmount,
      refundedAmount,
      statusCounts,
    };
  }, [orders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date_created || 0);
        const dateB = new Date(b.created_at || b.date_created || 0);
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [orders]);

  const formatCurrency = (amount) =>
    `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatStatus = (status = "UNKNOWN") =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "reports-status reports-status-success";
      case "CANCELLED":
        return "reports-status reports-status-danger";
      case "PENDING_PAYMENT":
        return "reports-status reports-status-warning";
      case "PAID":
      case "PROCESSING":
      case "ASSIGNED":
      case "OUT_FOR_DELIVERY":
        return "reports-status reports-status-info";
      default:
        return "reports-status";
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/management/dashboard",
      icon: BarChart3,
    },
    {
      label: "Products",
      path: "/management/products",
      icon: PackageCheck,
    },
    {
      label: "Orders",
      path: "/management/orders",
      icon: ShoppingBag,
    },
    {
      label: "Payments",
      path: "/management/payments",
      icon: DollarSign,
    },
    {
      label: "Inventory",
      path: "/management/inventory",
      icon: PackageCheck,
    },
    {
      label: "Deliveries",
      path: "/management/deliveries",
      icon: PackageCheck,
    },
    {
      label: "Drivers",
      path: "/management/drivers",
      icon: Users,
    },
    {
      label: "Customers",
      path: "/management/customers",
      icon: Users,
    },
    {
      label: "Notifications",
      path: "/management/notifications",
      icon: FileText,
    },
    {
      label: "Reports",
      path: "/management/reports",
      icon: BarChart3,
    },
    {
      label: "Subscriptions",
      path: "/management/subscriptions",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="management-layout">
      {sidebarOpen && (
        <div
          className="management-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`management-sidebar ${
          sidebarOpen ? "management-sidebar-open" : ""
        }`}
      >
        <div className="management-brand">
          <div className="management-brand-mark">
            <span>W</span>
          </div>

          <div>
            <h2>WaterFlow</h2>
            <p>Management</p>
          </div>

          <button
            type="button"
            className="management-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="management-nav">
          <p className="management-nav-title">MAIN MENU</p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === "Reports";

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`management-nav-item ${
                  active ? "management-nav-active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            className="management-logout-button"
            onClick={logout}
          >
            <XCircle size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <div className="management-topbar-left">
            <button
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>
              <span className="management-page-label">Management Panel</span>
              <h1>Reports</h1>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">A</div>

              <div className="management-user-info">
                <strong>{localStorage.getItem("username") || "Admin"}</strong>
                <span>Management</span>
              </div>
            </div>
          </div>
        </header>

        <section className="management-content">
          <div className="management-page-header">
            <div>
              <h1>Reports</h1>
              <p>
                Monitor WaterFlow orders, payments, revenue, and delivery
                performance.
              </p>
            </div>

            <button
              type="button"
              className="management-refresh-button"
              onClick={loadReports}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "reports-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="management-loading">Loading reports...</div>
          )}

          {error && <div className="management-error">{error}</div>}

          {!loading && !error && (
            <>
              <div className="management-stat-grid reports-stat-grid">
                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <ShoppingBag size={20} />
                  </div>

                  <div>
                    <span>Total Orders</span>
                    <strong>{report.totalOrders}</strong>
                  </div>
                </div>

                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <DollarSign size={20} />
                  </div>

                  <div>
                    <span>Total Revenue</span>
                    <strong>{formatCurrency(report.totalRevenue)}</strong>
                  </div>
                </div>

                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <span>Completed Payments</span>
                    <strong>{report.completedOrders}</strong>
                  </div>
                </div>

                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <PackageCheck size={20} />
                  </div>

                  <div>
                    <span>Delivered Orders</span>
                    <strong>{report.deliveredOrders}</strong>
                  </div>
                </div>

                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <Clock3 size={20} />
                  </div>

                  <div>
                    <span>Pending Payments</span>
                    <strong>{report.pendingPayments}</strong>
                  </div>
                </div>

                <div className="management-stat-card">
                  <div className="management-stat-icon">
                    <XCircle size={20} />
                  </div>

                  <div>
                    <span>Failed Payments</span>
                    <strong>{report.failedPayments}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-summary-grid">
                <div className="management-panel-card">
                  <div className="management-panel-header">
                    <div>
                      <h2>Payment Summary</h2>
                      <p>Financial summary calculated from customer orders.</p>
                    </div>

                    <DollarSign size={20} />
                  </div>

                  <div className="management-report-grid">
                    <div className="management-report-item">
                      <span>Completed Revenue</span>
                      <strong>{formatCurrency(report.totalRevenue)}</strong>
                    </div>

                    <div className="management-report-item">
                      <span>Pending Amount</span>
                      <strong>{formatCurrency(report.pendingAmount)}</strong>
                    </div>

                    <div className="management-report-item">
                      <span>Failed Amount</span>
                      <strong>{formatCurrency(report.failedAmount)}</strong>
                    </div>

                    <div className="management-report-item">
                      <span>Refunded Amount</span>
                      <strong>{formatCurrency(report.refundedAmount)}</strong>
                    </div>
                  </div>
                </div>

                <div className="management-panel-card">
                  <div className="management-panel-header">
                    <div>
                      <h2>Order Overview</h2>
                      <p>Current WaterFlow order activity.</p>
                    </div>

                    <ShoppingBag size={20} />
                  </div>

                  <div className="reports-overview-list">
                    <div>
                      <span>Active Orders</span>
                      <strong>{report.activeOrders}</strong>
                    </div>

                    <div>
                      <span>Delivered Orders</span>
                      <strong>{report.deliveredOrders}</strong>
                    </div>

                    <div>
                      <span>Cancelled Orders</span>
                      <strong>{report.cancelledOrders}</strong>
                    </div>

                    <div>
                      <span>Refunded Payments</span>
                      <strong>{report.refundedPayments}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="management-panel-card">
                <div className="management-panel-header">
                  <div>
                    <h2>Order Status Summary</h2>
                    <p>Current status of all WaterFlow orders.</p>
                  </div>

                  <BarChart3 size={20} />
                </div>

                {Object.keys(report.statusCounts).length === 0 ? (
                  <div className="management-empty-table">
                    No order data available.
                  </div>
                ) : (
                  <div className="reports-status-bars">
                    {Object.entries(report.statusCounts).map(
                      ([status, count]) => {
                        const percentage =
                          report.totalOrders > 0
                            ? (count / report.totalOrders) * 100
                            : 0;

                        return (
                          <div className="reports-status-row" key={status}>
                            <div className="reports-status-heading">
                              <span>{formatStatus(status)}</span>
                              <strong>{count}</strong>
                            </div>

                            <div className="reports-progress">
                              <div
                                className="reports-progress-fill"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              <div className="management-panel-card">
                <div className="management-panel-header">
                  <div>
                    <h2>Recent Orders</h2>
                    <p>Latest customer order activity.</p>
                  </div>

                  <Link to="/management/orders" className="reports-view-all">
                    View all
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="management-empty-table">
                    No recent orders available.
                  </div>
                ) : (
                  <div className="management-table-wrapper">
                    <table className="management-table reports-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>#{order.id}</strong>
                            </td>

                            <td>
                              {order.customer_username ||
                                order.customer?.username ||
                                order.customer_name ||
                                "Customer"}
                            </td>

                            <td>{formatCurrency(order.total_amount)}</td>

                            <td>
                              <span className={getStatusClass(order.status)}>
                                {formatStatus(order.status)}
                              </span>
                            </td>

                            <td>
                              {formatDate(
                                order.created_at || order.date_created,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ManagementReports;
