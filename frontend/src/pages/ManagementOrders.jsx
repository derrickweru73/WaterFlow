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
  MapPin,
  LogOut,
  Menu,
  X,
  RefreshCw,
  ChevronRight,
  XCircle,
  Save,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementOrders.css";

function ManagementOrders() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const menuItems = [
    ["Dashboard", LayoutDashboard, "/management/dashboard"],
    ["Products", Package, "/management/products"],
    ["Orders", ShoppingCart, "/management/orders"],
    ["Payments", CreditCard, "/management/payments"],
    ["Inventory", Boxes, "/management/inventory"],
    ["Deliveries", Truck, "/management/deliveries"],
    ["Customers", Users, "/management/customers"],
    ["Drivers", UserRoundCog, "/management/drivers"],
    ["User Profiles", Users, "/management/user-profiles"],
    ["Notifications", Bell, "/management/notifications"],
    ["Reports", BarChart3, "/management/reports"],
    ["Subscriptions", Repeat, "/management/subscriptions"],
    ["Delivery Zones", MapPin, "/management/delivery-zones"],
  ];

  const statusOptions = [
    { value: "PENDING_PAYMENT", label: "Pending Payment" },
    { value: "PAID", label: "Paid" },
    { value: "PROCESSING", label: "Processing" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/management/orders/");

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Orders error:", error);
      setMessage("Unable to load orders.");
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

        try {
          const response = await api.get("/management/orders/");
          setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error("Orders error:", error);
          setMessage("Unable to load orders.");
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
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

  const formatStatus = (status) => {
    return String(status || "UNKNOWN")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "DELIVERED") return "delivered";
    if (value === "PAID") return "paid";
    if (value === "PROCESSING") return "processing";
    if (value === "ASSIGNED") return "assigned";
    if (value === "OUT_FOR_DELIVERY") return "out-for-delivery";
    if (value === "CANCELLED") return "cancelled";

    return "pending";
  };

  const getPaymentClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "COMPLETED" || value === "PAID") {
      return "payment-completed";
    }

    if (value === "FAILED" || value === "REFUNDED") {
      return "payment-failed";
    }

    return "payment-pending";
  };

  const getPaymentLabel = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "COMPLETED") return "Completed";
    if (value === "FAILED") return "Failed";
    if (value === "REFUNDED") return "Refunded";
    if (value === "PENDING") return "Pending";
    if (value === "PAID") return "Paid";

    return status || "—";
  };

  const getItemCount = (order) => {
    if (!Array.isArray(order.items)) {
      return "—";
    }

    return order.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      setMessage("");

      const response = await api.patch(
        `/management/orders/${orderId}/status/`,
        {
          status: newStatus,
        },
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...response.data,
                status: response.data?.status || newStatus,
              }
            : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder && currentOrder.id === orderId
          ? {
              ...currentOrder,
              ...response.data,
              status: response.data?.status || newStatus,
            }
          : currentOrder,
      );

      setMessage(
        `Order #${orderId} status updated to ${formatStatus(newStatus)}.`,
      );
    } catch (error) {
      console.error("Status update error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.status?.[0] ||
        "Unable to update order status.";

      setMessage(errorMessage);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === "DELIVERED") {
      setMessage("A delivered order cannot be cancelled.");
      return;
    }

    if (order.status === "CANCELLED") {
      setMessage("This order is already cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Cancel order #${order.id}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    await updateOrderStatus(order.id, "CANCELLED");
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setMessage("");
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
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
                label === "Orders" ? "management-nav-active" : ""
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
              <h2>Orders</h2>
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
          <div className="management-welcome orders-management-header">
            <div>
              <p>
                Manage customer orders, review order details, and update
                delivery progress.
              </p>
            </div>

            <button
              type="button"
              className="orders-refresh-button"
              onClick={loadOrders}
              disabled={loading}
            >
              <RefreshCw size={15} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {message && (
            <div className="orders-management-message">{message}</div>
          )}

          <section className="management-panel-card">
            <div className="orders-table-header">
              <div>
                <h3>Customer Orders</h3>
                <p>
                  {orders.length} {orders.length === 1 ? "order" : "orders"} in
                  the system
                </p>
              </div>
            </div>

            {loading ? (
              <div className="management-empty-table">
                <p>Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="management-empty-table">
                <ShoppingCart size={32} />
                <h4>No orders found</h4>
                <p>Customer orders will appear here.</p>
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-management-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <button
                            type="button"
                            className="order-number-link"
                            onClick={() => openOrderDetails(order)}
                            title={`View order #${order.id}`}
                          >
                            #{order.id}
                          </button>
                        </td>

                        <td>
                          <div className="order-customer">
                            <div className="order-customer-avatar">
                              {String(
                                order.customer_username ||
                                  order.customer ||
                                  "U",
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span>
                              {order.customer_username ||
                                order.customer ||
                                "Unknown customer"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="order-items-count">
                            {getItemCount(order)}
                          </span>
                        </td>

                        <td>
                          <strong className="order-total-amount">
                            KES {formatAmount(order.total_amount)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`order-payment-badge ${getPaymentClass(
                              order.payment_status,
                            )}`}
                          >
                            {getPaymentLabel(order.payment_status)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`order-status-badge ${getStatusClass(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td>
                          <span className="order-date">
                            {formatDate(order.created_at)}
                          </span>
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

      {selectedOrder && (
        <div className="order-details-overlay" onClick={closeOrderDetails}>
          <div
            className="order-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-details-modal-header">
              <div>
                <p>Order Details</p>
                <h2>Order #{selectedOrder.id}</h2>
              </div>

              <button
                type="button"
                className="order-details-close"
                onClick={closeOrderDetails}
              >
                <X size={20} />
              </button>
            </div>

            <div className="order-details-modal-body">
              <div className="order-details-grid">
                <div className="order-detail-box">
                  <span>Customer</span>
                  <strong>
                    {selectedOrder.customer_username ||
                      selectedOrder.customer ||
                      "—"}
                  </strong>
                </div>

                <div className="order-detail-box">
                  <span>Order Date</span>
                  <strong>{formatDate(selectedOrder.created_at)}</strong>
                </div>

                <div className="order-detail-box">
                  <span>Payment</span>
                  <strong>
                    {getPaymentLabel(selectedOrder.payment_status)}
                  </strong>
                </div>

                <div className="order-detail-box">
                  <span>Total</span>
                  <strong>
                    KES {formatAmount(selectedOrder.total_amount)}
                  </strong>
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-section-heading">
                  <div>
                    <span className="order-section-label">Order Status</span>
                    <h3>Manage order progress</h3>
                  </div>

                  <span
                    className={`order-status-badge large ${getStatusClass(
                      selectedOrder.status,
                    )}`}
                  >
                    {formatStatus(selectedOrder.status)}
                  </span>
                </div>

                <div className="order-status-editor">
                  <select
                    className={`order-status-select order-details-status ${getStatusClass(
                      selectedOrder.status,
                    )}`}
                    value={selectedOrder.status || "PENDING_PAYMENT"}
                    disabled={updatingOrder === selectedOrder.id}
                    onChange={(event) =>
                      updateOrderStatus(selectedOrder.id, event.target.value)
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {updatingOrder === selectedOrder.id && (
                    <span className="order-saving">
                      <Save size={14} />
                      Saving...
                    </span>
                  )}
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-section-heading">
                  <div>
                    <span className="order-section-label">Delivery</span>
                    <h3>Delivery information</h3>
                  </div>
                </div>

                <div className="order-delivery-information">
                  <div>
                    <span>Delivery Zone</span>
                    <strong>
                      {selectedOrder.delivery_zone_name ||
                        selectedOrder.delivery_zone?.name ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>
                      {selectedOrder.delivery_address ||
                        selectedOrder.address ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Directions</span>
                    <strong>{selectedOrder.directions || "—"}</strong>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-section-heading">
                  <div>
                    <span className="order-section-label">Products</span>
                    <h3>Order items</h3>
                  </div>

                  <span className="order-item-total">
                    {getItemCount(selectedOrder)} items
                  </span>
                </div>

                {Array.isArray(selectedOrder.items) &&
                selectedOrder.items.length > 0 ? (
                  <div className="order-detail-items">
                    {selectedOrder.items.map((item, index) => (
                      <div className="order-detail-item" key={item.id || index}>
                        <div className="order-item-product">
                          <div className="order-item-icon">
                            <Package size={16} />
                          </div>

                          <div>
                            <strong>
                              {item.product_name ||
                                item.product?.name ||
                                "Product"}
                            </strong>

                            <span>Quantity: {Number(item.quantity || 0)}</span>
                          </div>
                        </div>

                        <strong className="order-item-price">
                          KES{" "}
                          {formatAmount(
                            Number(item.price || 0) *
                              Number(item.quantity || 0),
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="order-no-items">No item details available.</p>
                )}
              </div>

              <div className="order-detail-actions">
                <button
                  type="button"
                  className="order-details-close-button"
                  onClick={closeOrderDetails}
                >
                  Close
                </button>

                {selectedOrder.status !== "DELIVERED" &&
                  selectedOrder.status !== "CANCELLED" && (
                    <button
                      type="button"
                      className="order-details-cancel-button"
                      onClick={() => handleCancelOrder(selectedOrder)}
                      disabled={updatingOrder === selectedOrder.id}
                    >
                      <XCircle size={15} />
                      Cancel Order
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementOrders;
