import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementReports.css";

function ManagementReports() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        await loadReports();
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

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

    const recentOrders = [...orders]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.date_created || a.created || 0,
        ).getTime();

        const dateB = new Date(
          b.created_at || b.date_created || b.created || 0,
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 8);

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
      recentOrders,
    };
  }, [orders]);

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatStatus = (status) =>
    String(status || "UNKNOWN")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
      case "PAID":
      case "COMPLETED":
        return "reports-status-success";

      case "CANCELLED":
      case "FAILED":
      case "REFUNDED":
        return "reports-status-danger";

      case "PENDING_PAYMENT":
      case "PENDING":
        return "reports-status-warning";

      case "PROCESSING":
      case "ASSIGNED":
      case "OUT_FOR_DELIVERY":
        return "reports-status-info";

      default:
        return "reports-status-default";
    }
  };

  const getOrderCustomer = (order) =>
    order.customer_username ||
    order.customer_name ||
    order.username ||
    order.customer?.username ||
    "Customer";

  const getOrderDate = (order) => {
    const value =
      order.created_at || order.date_created || order.created || null;

    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ManagementLayout title="Reports">
      <div className="management-welcome reports-page-header">
        <div>
          <p>Review WaterFlow orders, payments and business activity.</p>
        </div>
      </div>

      {error && <div className="reports-error">{error}</div>}

      {loading ? (
        <section className="management-panel-card">
          <div className="reports-loading">
            <Clock3 size={24} />
            <p>Loading reports...</p>
          </div>
        </section>
      ) : (
        <>
          <div className="reports-stat-grid">
            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <FileText size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Total Orders</span>
                <strong>{report.totalOrders}</strong>
              </div>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <DollarSign size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Total Revenue</span>
                <strong>{formatCurrency(report.totalRevenue)}</strong>
              </div>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <CheckCircle2 size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Completed Payments</span>
                <strong>{report.completedOrders}</strong>
              </div>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <Clock3 size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Pending Payments</span>
                <strong>{report.pendingPayments}</strong>
              </div>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <XCircle size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Failed Payments</span>
                <strong>{report.failedPayments}</strong>
              </div>
            </div>

            <div className="reports-stat-card">
              <div className="reports-stat-icon">
                <PackageCheck size={18} />
              </div>

              <div className="reports-stat-content">
                <span>Delivered Orders</span>
                <strong>{report.deliveredOrders}</strong>
              </div>
            </div>
          </div>

          <div className="reports-grid">
            <section className="management-panel-card reports-panel">
              <div className="reports-section-header">
                <div>
                  <h3>Payment Summary</h3>
                  <p>Overview of current payment amounts.</p>
                </div>

                <div className="reports-section-icon">
                  <DollarSign size={18} />
                </div>
              </div>

              <div className="reports-summary-grid">
                <div className="reports-summary-item">
                  <span>Completed Revenue</span>
                  <strong>{formatCurrency(report.totalRevenue)}</strong>
                </div>

                <div className="reports-summary-item">
                  <span>Pending Amount</span>
                  <strong>{formatCurrency(report.pendingAmount)}</strong>
                </div>

                <div className="reports-summary-item">
                  <span>Failed Amount</span>
                  <strong>{formatCurrency(report.failedAmount)}</strong>
                </div>

                <div className="reports-summary-item">
                  <span>Refunded Amount</span>
                  <strong>{formatCurrency(report.refundedAmount)}</strong>
                </div>
              </div>
            </section>

            <section className="management-panel-card reports-panel">
              <div className="reports-section-header">
                <div>
                  <h3>Order Overview</h3>
                  <p>Current WaterFlow order activity.</p>
                </div>

                <div className="reports-section-icon">
                  <BarChart3 size={18} />
                </div>
              </div>

              <div className="reports-overview-list">
                <div className="reports-overview-item">
                  <span>Total Orders</span>
                  <strong>{report.totalOrders}</strong>
                </div>

                <div className="reports-overview-item">
                  <span>Active Orders</span>
                  <strong>{report.activeOrders}</strong>
                </div>

                <div className="reports-overview-item">
                  <span>Delivered</span>
                  <strong>{report.deliveredOrders}</strong>
                </div>

                <div className="reports-overview-item">
                  <span>Cancelled</span>
                  <strong>{report.cancelledOrders}</strong>
                </div>
              </div>
            </section>
          </div>

          <section className="management-panel-card reports-panel">
            <div className="reports-section-header">
              <div>
                <h3>Order Status Summary</h3>
                <p>Current status of all WaterFlow orders.</p>
              </div>

              <div className="reports-section-icon">
                <BarChart3 size={18} />
              </div>
            </div>

            {Object.keys(report.statusCounts).length === 0 ? (
              <div className="management-empty-table">
                <p>No order data available.</p>
              </div>
            ) : (
              <div className="reports-status-list">
                {Object.entries(report.statusCounts).map(([status, count]) => {
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
                })}
              </div>
            )}
          </section>

          <section className="management-panel-card reports-panel">
            <div className="reports-section-header">
              <div>
                <h3>Recent Orders</h3>
                <p>Latest orders recorded by WaterFlow.</p>
              </div>
            </div>

            {report.recentOrders.length === 0 ? (
              <div className="management-empty-table">
                <p>No recent orders available.</p>
              </div>
            ) : (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {report.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                        </td>

                        <td>{getOrderCustomer(order)}</td>

                        <td>{getOrderDate(order)}</td>

                        <td className="reports-amount">
                          {formatCurrency(order.total_amount)}
                        </td>

                        <td>
                          <span
                            className={`reports-status ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </ManagementLayout>
  );
}

export default ManagementReports;
