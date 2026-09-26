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
  LogOut,
  Menu,
  X,
  RefreshCw,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementCustomers.css";

function ManagementCustomers() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("admin");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState("");

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

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const buildCustomers = (orders) => {
    const customerMap = {};

    orders.forEach((order) => {
      const customerId =
        order.customer?.id ||
        order.customer_id ||
        order.customer_username ||
        order.customer ||
        "unknown";

      const customerUsername =
        order.customer_username ||
        (typeof order.customer === "string"
          ? order.customer
          : `Customer ${customerId}`);

      const key = String(customerId);

      if (!customerMap[key]) {
        customerMap[key] = {
          id: customerId,
          username: customerUsername,
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
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        String(customer.username).toLowerCase().includes(search) ||
        String(customer.id).toLowerCase().includes(search)
      );
    });
  }, [customers, searchTerm]);

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

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    });

    setFormError("");
  };

  const openModal = () => {
    resetForm();
    setMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();

    setFormError("");
    setMessage("");

    if (!form.username.trim()) {
      setFormError("Username is required.");
      return;
    }

    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/auth/register/", {
        username: form.username.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
      });

      setShowModal(false);
      resetForm();
      setMessage("Customer created successfully.");

      await loadCustomers();
    } catch (err) {
      console.error("Failed to create customer:", err);

      const responseData = err.response?.data;

      if (typeof responseData === "object" && responseData !== null) {
        const firstError = Object.values(responseData).flat()[0];

        setFormError(
          firstError || "Failed to create customer. Please try again.",
        );
      } else {
        setFormError("Failed to create customer. Please try again.");
      }
    } finally {
      setSaving(false);
    }
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
            <h2>WaterFlow</h2>
            <span>Management</span>
          </div>
        </div>

        <div className="management-nav-title">MAIN MENU</div>

        <nav className="management-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`management-nav-item ${
                  item.path === "/management/customers"
                    ? "management-nav-active"
                    : ""
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            onClick={handleLogout}
            className="management-logout-button"
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
          <X size={21} />
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
              <h1>Customers</h1>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="management-user-info">
                <strong>{username}</strong>
                <span>Management</span>
              </div>
            </div>
          </div>
        </header>

        <section className="management-content">
          <div className="customers-welcome">
            <div>
              <h2>Customer Management</h2>
              <p>Manage WaterFlow customers and view their order activity.</p>
            </div>

            <div className="customers-header-actions">
              <button
                type="button"
                onClick={loadCustomers}
                className="customers-refresh-button"
                disabled={loading}
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                type="button"
                onClick={openModal}
                className="customers-add-button"
              >
                <Plus size={16} />
                Add Customer
              </button>
            </div>
          </div>

          {message && (
            <div className="customers-message customers-success">{message}</div>
          )}

          {error && (
            <div className="customers-message customers-error">{error}</div>
          )}

          <div className="customers-summary">
            <div className="customers-summary-item">
              <div className="customers-summary-icon">
                <Users size={18} />
              </div>

              <div>
                <span>Total Customers</span>
                <strong>{customers.length}</strong>
              </div>
            </div>

            <div className="customers-summary-item">
              <div className="customers-summary-icon">
                <ShoppingCart size={18} />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>
                  {customers.reduce(
                    (total, customer) => total + customer.orderCount,
                    0,
                  )}
                </strong>
              </div>
            </div>

            <div className="customers-summary-item">
              <div className="customers-summary-icon">
                <CreditCard size={18} />
              </div>

              <div>
                <span>Total Customer Spend</span>
                <strong>
                  {formatAmount(
                    customers.reduce(
                      (total, customer) =>
                        total + Number(customer.totalSpent || 0),
                      0,
                    ),
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="customers-panel">
            <div className="customers-panel-header">
              <div>
                <h2>Customer List</h2>
                <p>Customers identified from management orders.</p>
              </div>

              <div className="customers-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="customers-empty">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="customers-empty">
                {searchTerm
                  ? "No customers match your search."
                  : "No customers found."}
              </div>
            ) : (
              <div className="customers-table-wrapper">
                <table className="customers-table">
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
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="customers-name">
                            <div className="customers-avatar">
                              {String(customer.username)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>{customer.username}</strong>
                          </div>
                        </td>

                        <td className="customers-id">#{customer.id}</td>

                        <td className="customers-orders">
                          {customer.orderCount}
                        </td>

                        <td className="customers-spent">
                          {formatAmount(customer.totalSpent)}
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

      {showModal && (
        <div className="customers-modal-overlay">
          <div className="customers-modal">
            <div className="customers-modal-header">
              <div>
                <h2>Add Customer</h2>
                <p>Create a new WaterFlow customer account.</p>
              </div>

              <button
                type="button"
                className="customers-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              {formError && (
                <div className="customers-modal-error">{formError}</div>
              )}

              <div className="customers-form-group">
                <label htmlFor="customer-username">Username</label>
                <input
                  id="customer-username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleFormChange}
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </div>

              <div className="customers-form-group">
                <label htmlFor="customer-email">Email</label>
                <input
                  id="customer-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  autoComplete="off"
                />
              </div>

              <div className="customers-form-group">
                <label htmlFor="customer-phone">Phone Number</label>
                <input
                  id="customer-phone"
                  name="phone_number"
                  type="text"
                  value={form.phone_number}
                  onChange={handleFormChange}
                  placeholder="e.g. 0712345678"
                  autoComplete="off"
                />
              </div>

              <div className="customers-form-row">
                <div className="customers-form-group">
                  <label htmlFor="customer-password">Password</label>
                  <input
                    id="customer-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="customers-form-group">
                  <label htmlFor="customer-confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="customer-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleFormChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="customers-modal-actions">
                <button
                  type="button"
                  className="customers-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customers-save-button"
                  disabled={saving}
                >
                  <UserPlus size={16} />
                  {saving ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementCustomers;
