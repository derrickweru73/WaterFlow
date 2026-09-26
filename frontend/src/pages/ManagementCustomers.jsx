import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  CreditCard,
  Users,
  Plus,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementCustomers.css";

function ManagementCustomers() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
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

  const buildCustomers = (orders) => {
    const customerMap = new Map();

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

      if (!customerMap.has(String(customerId))) {
        customerMap.set(String(customerId), {
          id: customerId,
          username: customerUsername,
          email: order.customer_email || order.email || "—",
          phone: order.customer_phone || order.phone_number || "—",
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: null,
        });
      }

      const customer = customerMap.get(String(customerId));

      customer.totalOrders += 1;

      const paymentStatus = String(order.payment_status || "").toUpperCase();
      const orderStatus = String(order.status || "").toUpperCase();

      const completed =
        paymentStatus === "COMPLETED" ||
        [
          "PAID",
          "PROCESSING",
          "ASSIGNED",
          "OUT_FOR_DELIVERY",
          "DELIVERED",
        ].includes(orderStatus);

      if (completed) {
        customer.totalSpent += Number(order.total_amount || 0);
      }

      if (
        order.created_at &&
        (!customer.lastOrder ||
          new Date(order.created_at) > new Date(customer.lastOrder))
      ) {
        customer.lastOrder = order.created_at;
      }

      if (customer.email === "—" && (order.customer_email || order.email)) {
        customer.email = order.customer_email || order.email;
      }

      if (
        customer.phone === "—" &&
        (order.customer_phone || order.phone_number)
      ) {
        customer.phone = order.customer_phone || order.phone_number;
      }
    });

    return Array.from(customerMap.values()).sort((a, b) =>
      String(a.username).localeCompare(String(b.username)),
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
      console.error(err);
      setError("Unable to load customers.");
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
        await loadCustomers();
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };

  const openCreateModal = () => {
    setForm({
      username: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setFormError("");
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();

    setFormError("");
    setMessage("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.phone_number.trim() ||
      !form.password
    ) {
      setFormError("Please complete all required fields.");
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

      setForm({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
      });

      setMessage("Customer created successfully.");

      await loadCustomers();
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (typeof data === "string") {
        setFormError(data);
      } else if (data?.username) {
        setFormError(
          Array.isArray(data.username) ? data.username[0] : data.username,
        );
      } else if (data?.email) {
        setFormError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else if (data?.detail) {
        setFormError(data.detail);
      } else {
        setFormError("Unable to create customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        String(customer.username || "")
          .toLowerCase()
          .includes(term) ||
        String(customer.email || "")
          .toLowerCase()
          .includes(term) ||
        String(customer.phone || "")
          .toLowerCase()
          .includes(term) ||
        String(customer.id || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [customers, searchTerm]);

  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0,
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpent || 0),
    0,
  );

  const activeCustomers = customers.filter(
    (customer) => customer.totalOrders > 0,
  ).length;

  const formatAmount = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

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

  return (
    <ManagementLayout title="Customers">
      <div className="management-welcome">
        <div>
          <p>Manage customer accounts and view their order activity.</p>
        </div>

        <div className="customer-header-actions">
          <button className="customer-add-button" onClick={openCreateModal}>
            <Plus />
            Add Customer
          </button>
        </div>
      </div>

      {message && <div className="customer-success">{message}</div>}

      {error && <div className="customer-error">{error}</div>}

      <div className="customer-stats">
        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <Users />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>{totalCustomers}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <UserPlus />
          </div>

          <div>
            <span>Active Customers</span>
            <strong>{activeCustomers}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <ShoppingCart />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon">
            <CreditCard />
          </div>

          <div>
            <span>Customer Revenue</span>
            <strong>{formatAmount(totalRevenue)}</strong>
          </div>
        </div>
      </div>

      <section className="management-panel-card">
        <div className="customer-section-header">
          <div>
            <h3>Customer List</h3>
            <p>{filteredCustomers.length} customers displayed</p>
          </div>

          <div className="customer-search">
            <Search />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="customer-loading">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="customer-empty">
            <Users />
            <h3>No customers found</h3>
            <p>
              {searchTerm
                ? "Try changing your search."
                : "No customer accounts are available yet."}
            </p>
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name">
                        <div className="customer-avatar">
                          {String(customer.username || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{customer.username}</strong>
                          <span>ID #{customer.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{customer.email}</td>

                    <td>{customer.phone}</td>

                    <td>
                      <span className="customer-order-count">
                        {customer.totalOrders}
                      </span>
                    </td>

                    <td className="customer-amount">
                      {formatAmount(customer.totalSpent)}
                    </td>

                    <td>{formatDate(customer.lastOrder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <h3>Add Customer</h3>
                <p>Create a new WaterFlow customer account.</p>
              </div>

              <button
                className="customer-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X />
              </button>
            </div>

            <form className="customer-form" onSubmit={handleCreateCustomer}>
              {formError && (
                <div className="customer-form-error">{formError}</div>
              )}

              <div className="customer-form-grid">
                <div className="customer-form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleFormChange}
                    placeholder="Enter username"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleFormChange}
                    placeholder="07XXXXXXXX"
                  />
                </div>

                <div className="customer-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div className="customer-form-group customer-form-full">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleFormChange}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-save-button"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagementLayout>
  );
}

export default ManagementCustomers;
