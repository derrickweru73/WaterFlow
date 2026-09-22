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
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";

function ManagementProducts() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [products, setProducts] = useState([]);
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

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/products/");

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Products error:", error);
      setMessage("Unable to load products.");
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
        await loadProducts();
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
                label === "Products" ? "management-nav-active" : ""
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
              <h2>Products</h2>
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
              <h1>Products Management</h1>
              <p>Manage WaterFlow products and their prices.</p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={loadProducts}
                style={{
                  border: "1px solid #e5e1ea",
                  background: "#fff",
                  borderRadius: "9px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              <button
                type="button"
                style={{
                  border: 0,
                  background: "#7c3aed",
                  color: "#fff",
                  borderRadius: "9px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
                onClick={() =>
                  setMessage("Product creation form will be connected next.")
                }
              >
                <Plus size={15} />
                Add Product
              </button>
            </div>
          </div>

          {message && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 15px",
                background: "#f0e7ff",
                color: "#6d28d9",
                borderRadius: "9px",
                fontSize: "13px",
              }}
            >
              {message}
            </div>
          )}

          <section className="management-panel-card">
            {loading ? (
              <div className="management-empty-table">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="management-empty-table">
                <Package size={32} />
                <h4>No products found</h4>
                <p>Add products from the management system.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>Product</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Price</th>
                      <th style={thStyle}>Availability</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td style={tdStyle}>
                          <strong>{product.name || "Unnamed Product"}</strong>
                        </td>

                        <td style={tdStyle}>
                          {product.category_name || product.category || "—"}
                        </td>

                        <td style={tdStyle}>
                          KES{" "}
                          {Number(product.price || 0).toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        <td style={tdStyle}>
                          {product.is_available === false
                            ? "Unavailable"
                            : "Available"}
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                setMessage(
                                  `Edit Product #${product.id} will be connected next.`,
                                )
                              }
                              style={actionButton}
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                setMessage(
                                  `Delete Product #${product.id} will be connected next.`,
                                )
                              }
                              style={deleteButton}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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

const actionButton = {
  border: "1px solid #e5e1ea",
  background: "#fff",
  color: "#7c3aed",
  borderRadius: "7px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const deleteButton = {
  ...actionButton,
  color: "#dc2626",
};

export default ManagementProducts;
