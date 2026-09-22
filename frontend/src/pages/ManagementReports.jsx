import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import api from "../services/api";

function ManagementReports() {
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
      totalRevenue,
      pendingAmount,
      failedAmount,
      refundedAmount,
      statusCounts,
    };
  }, [orders]);

  const formatCurrency = (amount) =>
    `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatStatus = (status) =>
    status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="management-page">
      <div className="management-page-header">
        <div>
          <h1>Reports</h1>
          <p>Business performance and payment summaries.</p>
        </div>

        <button
          type="button"
          className="management-refresh-button"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading && <div className="management-loading">Loading reports...</div>}

      {error && <div className="management-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="management-stat-grid">
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

          <div className="management-panel-card">
            <div className="management-panel-header">
              <div>
                <h2>Payment Summary</h2>
                <p>Summary calculated from customer order records.</p>
              </div>
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
              <div className="management-table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Orders</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(report.statusCounts).map(
                      ([status, count]) => (
                        <tr key={status}>
                          <td>{formatStatus(status)}</td>
                          <td>{count}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ManagementReports;
