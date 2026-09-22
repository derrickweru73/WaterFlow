import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const buildCustomers = (orders) => {
    const customerMap = {};

    orders.forEach((order) => {
      const customerId =
        order.customer?.id ||
        order.customer_id ||
        order.customer_username ||
        order.customer ||
        "unknown";

      const username =
        order.customer_username ||
        (typeof order.customer === "string"
          ? order.customer
          : `Customer ${customerId}`);

      const key = String(customerId);

      if (!customerMap[key]) {
        customerMap[key] = {
          id: customerId,
          username,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: null,
        };
      }

      customerMap[key].orderCount += 1;

      const paidStatuses = [
        "PAID",
        "PROCESSING",
        "ASSIGNED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ];

      if (
        order.payment_status === "COMPLETED" ||
        paidStatuses.includes(order.status)
      ) {
        customerMap[key].totalSpent += Number(order.total_amount || 0);
      }

      if (
        !customerMap[key].lastOrder ||
        new Date(order.created_at) > new Date(customerMap[key].lastOrder)
      ) {
        customerMap[key].lastOrder = order.created_at;
      }
    });

    return Object.values(customerMap).sort(
      (a, b) => b.orderCount - a.orderCount,
    );
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/management/orders/");

      const orders = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setCustomers(buildCustomers(orders));
    } catch (err) {
      console.error("Failed to load customers:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load customers. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/management/orders/");

        const orders = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setCustomers(buildCustomers(orders));
      } catch (err) {
        console.error("Failed to load customers:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load customers. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const formatAmount = (amount) =>
    `KES ${Number(amount || 0).toLocaleString()}`;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="management-layout">
      <aside className="management-sidebar">
        <div className="management-brand">
          <h2>WaterFlow</h2>
          <span>Management</span>
        </div>

        <nav className="management-nav">
          <a href="/management/dashboard" className="management-nav-item">
            Dashboard
          </a>

          <a href="/management/products" className="management-nav-item">
            Products
          </a>

          <a href="/management/orders" className="management-nav-item">
            Orders
          </a>

          <a href="/management/inventory" className="management-nav-item">
            Inventory
          </a>

          <a href="/management/deliveries" className="management-nav-item">
            Deliveries
          </a>

          <a href="/management/drivers" className="management-nav-item">
            Drivers
          </a>

          <a href="/management/payments" className="management-nav-item">
            Payments
          </a>

          <a
            href="/management/customers"
            className="management-nav-item management-nav-active"
          >
            Customers
          </a>

          <a href="/management/notifications" className="management-nav-item">
            Notifications
          </a>

          <a href="/management/reports" className="management-nav-item">
            Reports
          </a>

          <a href="/management/subscriptions" className="management-nav-item">
            Subscriptions
          </a>
        </nav>
      </aside>

      <main className="management-main">
        <header className="management-topbar">
          <div>
            <h1>Customers</h1>
            <p>View customers and their WaterFlow order activity.</p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            className="management-refresh-button"
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        <section className="management-content">
          <div className="management-stat-grid">
            <div className="management-stat-card">
              <div className="management-stat-icon">
                <Users size={21} />
              </div>

              <div>
                <span>Total Customers</span>
                <strong>{customers.length}</strong>
              </div>
            </div>
          </div>

          <div className="management-panel-card">
            <div className="management-panel-header">
              <div>
                <h2>Customer List</h2>
                <p>Customers identified from management orders.</p>
              </div>

              <Users size={22} />
            </div>

            {loading ? (
              <div className="management-loading">Loading customers...</div>
            ) : error ? (
              <div className="management-empty-table">{error}</div>
            ) : customers.length === 0 ? (
              <div className="management-empty-table">No customers found.</div>
            ) : (
              <div className="management-table-wrapper">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Customer ID</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <strong>{customer.username}</strong>
                        </td>

                        <td>#{customer.id}</td>

                        <td>{customer.orderCount}</td>

                        <td>
                          <strong>{formatAmount(customer.totalSpent)}</strong>
                        </td>

                        <td>{formatDate(customer.lastOrder)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManagementCustomers;
