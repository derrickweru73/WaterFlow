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

function ManagementInventory() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [inventory, setInventory] = useState([]);
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

  const loadInventory = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/inventory/");

      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Inventory error:", error);
      setMessage("Unable to load inventory.");
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
        await loadInventory();
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
                label === "Inventory" ? "management-nav-active" : ""
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
              <h2>Inventory</h2>
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
              <h1>Inventory Management</h1>
              <p>Monitor available WaterFlow stock.</p>
            </div>

            <button type="button" onClick={loadInventory} style={refreshButton}>
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {message && <div style={messageStyle}>{message}</div>}

          <section className="management-panel-card">
            {loading ? (
              <div className="management-empty-table">
                <p>Loading inventory...</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="management-empty-table">
                <Boxes size={32} />
                <h4>No inventory found</h4>
                <p>Inventory records will appear here.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Product</th>
                      <th style={thStyle}>Quantity</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inventory.map((item) => {
                      const quantity =
                        item.quantity ??
                        item.stock_quantity ??
                        item.available_quantity ??
                        0;

                      const productName =
                        item.product_name ||
                        item.product?.name ||
                        (typeof item.product === "string" ? item.product : "—");

                      return (
                        <tr key={item.id}>
                          <td style={tdStyle}>#{item.id}</td>

                          <td style={tdStyle}>
                            <strong>{productName}</strong>
                          </td>

                          <td style={tdStyle}>{quantity}</td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                ...statusStyle,
                                ...(Number(quantity) <= 5
                                  ? lowStockStyle
                                  : stockStyle),
                              }}
                            >
                              {Number(quantity) <= 5 ? "Low Stock" : "In Stock"}
                            </span>
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

const stockStyle = {
  background: "#dcfce7",
  color: "#15803d",
};

const lowStockStyle = {
  background: "#fee2e2",
  color: "#b91c1c",
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

export default ManagementInventory;
