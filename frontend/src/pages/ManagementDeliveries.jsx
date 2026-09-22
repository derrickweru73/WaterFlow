import { useEffect, useState } from "react";
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
  LogOut,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementDeliveries() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const menuItems = [
    ["Dashboard", LayoutDashboard, "/management/dashboard"],
    ["Products", Package, "/management/products"],
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

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/management/deliveries/");

      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Deliveries error:", error);
      setMessage("Unable to load deliveries.");
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
        await loadDeliveries();
      } catch (error) {
        console.error(error);
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

  const getStatusStyle = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "DELIVERED") {
      return {
        background: "#dcfce7",
        color: "#15803d",
      };
    }

    if (value === "OUT_FOR_DELIVERY") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (value === "ASSIGNED") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  const formatStatus = (status) =>
    String(status || "PENDING")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

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

          {menuItems.map(([label, Icon, path]) => (
            <button
              key={label}
              type="button"
              className={`management-nav-item ${
                label === "Deliveries" ? "management-nav-active" : ""
              }`}
              onClick={() => handleNavigation(path)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
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
              <h2>Deliveries</h2>
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
              <h1>Delivery Management</h1>
              <p>Monitor and manage customer deliveries.</p>
            </div>

            <button
              type="button"
              onClick={loadDeliveries}
              style={refreshButton}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {message && <div style={messageStyle}>{message}</div>}

          <section className="management-panel-card">
            {loading ? (
              <div className="management-empty-table">
                <p>Loading deliveries...</p>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="management-empty-table">
                <Truck size={32} />
                <h4>No deliveries found</h4>
                <p>Delivery records will appear here.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Delivery</th>
                      <th style={thStyle}>Order</th>
                      <th style={thStyle}>Driver</th>
                      <th style={thStyle}>Address</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td style={tdStyle}>
                          <strong>#{delivery.id}</strong>
                        </td>

                        <td style={tdStyle}>#{delivery.order || "—"}</td>

                        <td style={tdStyle}>
                          {delivery.driver_username ||
                            delivery.driver_name ||
                            delivery.driver?.username ||
                            "Unassigned"}
                        </td>

                        <td style={tdStyle}>
                          {delivery.delivery_address || delivery.address || "—"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...statusStyle,
                              ...getStatusStyle(delivery.status),
                            }}
                          >
                            {formatStatus(delivery.status)}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          {delivery.created_at
                            ? new Date(delivery.created_at).toLocaleDateString(
                                "en-KE",
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 10px",
  borderBottom: "1px solid #ece9f1",
  color: "#777080",
  fontSize: "11px",
  fontWeight: 600,
};

const tdStyle = {
  padding: "15px 10px",
  borderBottom: "1px solid #f0edf3",
  color: "#514b5a",
};

const statusStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 600,
};

const refreshButton = {
  border: "1px solid #e5e1ea",
  background: "#fff",
  borderRadius: "9px",
  padding: "10px 14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const messageStyle = {
  marginBottom: "18px",
  padding: "12px 15px",
  background: "#f0e7ff",
  color: "#6d28d9",
  borderRadius: "9px",
  fontSize: "13px",
};

export default ManagementDeliveries;
