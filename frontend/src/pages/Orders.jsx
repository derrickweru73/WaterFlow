import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock3,
  Truck,
  MapPin,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Droplets,
} from "lucide-react";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Orders() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState(false);

  const viewOrder = async (orderId) => {
    try {
      setDetailLoading(true);
      setError("");

      const response = await api.get(`/my-orders/${orderId}/`);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setGuest(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/my-orders/");
      const fetchedOrders = response.data;

      setOrders(fetchedOrders);

      const paidOrderId = location.state?.orderId;

      if (paidOrderId) {
        await viewOrder(paidOrderId);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setGuest(true);
        setOrders([]);
        return;
      }

      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "orders-status orders-status-delivered";

      case "OUT_FOR_DELIVERY":
        return "orders-status orders-status-out";

      case "ASSIGNED":
        return "orders-status orders-status-assigned";

      case "PROCESSING":
        return "orders-status orders-status-processing";

      case "PAID":
        return "orders-status orders-status-paid";

      case "PENDING_PAYMENT":
        return "orders-status orders-status-pending";

      case "CANCELLED":
        return "orders-status orders-status-cancelled";

      default:
        return "orders-status orders-status-default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const statusOrder = [
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "ASSIGNED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const getProgressIcon = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return <CreditCard size={16} />;

      case "PAID":
        return <CheckCircle2 size={16} />;

      case "PROCESSING":
        return <Package size={16} />;

      case "ASSIGNED":
        return <Truck size={16} />;

      case "OUT_FOR_DELIVERY":
        return <MapPin size={16} />;

      case "DELIVERED":
        return <CheckCircle2 size={16} />;

      default:
        return <Clock3 size={16} />;
    }
  };

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) => !["DELIVERED", "CANCELLED"].includes(order.status),
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  const totalSpent = orders
    .filter(
      (order) =>
        order.payment_status === "COMPLETED" ||
        order.status !== "PENDING_PAYMENT",
    )
    .reduce((total, order) => total + Number(order.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="orders-page">
        <style>{ordersStyles}</style>

        <CustomerHeader
          returnTo="/products"
          returnLabel="Return to Products"
          minimal={true}
        />

        <main className="orders-main">
          <div className="orders-loading">
            <div className="orders-loading-icon">
              <RefreshCw size={23} />
            </div>

            <h3>Loading your orders...</h3>

            <p>We're retrieving your order history.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <style>{ordersStyles}</style>

      <CustomerHeader
        returnTo="/products"
        returnLabel="Return to Products"
        minimal={true}
      />

      <main className="orders-main">
        {/* HERO */}
        <section className="orders-hero">
          <div className="orders-hero-content">
            <div className="orders-eyebrow">
              <Droplets size={14} />
              Your WaterFlow Orders
            </div>

            <h1>My Orders</h1>

            <p>
              Track your water deliveries, review your order history, and stay
              updated from payment to delivery.
            </p>
          </div>
        </section>

        {guest ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <Package size={26} />
            </div>

            <h3>Your orders will appear here</h3>

            <p>
              Sign in to view your previous orders and track your deliveries.
            </p>

            <div className="orders-empty-actions">
              <Link
                to="/login"
                state={{ returnTo: "/orders" }}
                className="orders-primary-button"
              >
                Sign In
              </Link>

              <Link to="/products" className="orders-secondary-button">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="orders-error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <ShoppingBag size={26} />
            </div>

            <h3>No orders yet</h3>

            <p>
              Your orders will appear here after you place your first order.
            </p>

            <Link to="/products" className="orders-primary-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* STATISTICS */}
            <section className="orders-stats">
              <div className="orders-stat">
                <div className="orders-stat-icon">
                  <Package size={19} />
                </div>

                <div>
                  <span>Total Orders</span>
                  <strong>{totalOrders}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <div className="orders-stat-icon">
                  <Truck size={19} />
                </div>

                <div>
                  <span>Active Orders</span>
                  <strong>{activeOrders}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <div className="orders-stat-icon">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <span>Delivered</span>
                  <strong>{deliveredOrders}</strong>
                </div>
              </div>

              <div className="orders-stat">
                <div className="orders-stat-icon">
                  <CreditCard size={19} />
                </div>

                <div>
                  <span>Order Value</span>
                  <strong>KES {totalSpent.toFixed(2)}</strong>
                </div>
              </div>
            </section>

            <div className="orders-heading">
              <div>
                <h2>Order History</h2>
                <p>Select an order to view its full tracking information.</p>
              </div>

              <button
                type="button"
                className="orders-refresh"
                onClick={fetchOrders}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* ORDERS + DETAILS */}
            <div className="orders-layout">
              <section className="orders-list">
                {orders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <article
                      key={order.id}
                      className={`order-card ${
                        isSelected ? "order-card-selected" : ""
                      }`}
                      onClick={() => viewOrder(order.id)}
                    >
                      <div className="order-card-top">
                        <div className="order-card-title-area">
                          <div className="order-icon">
                            <Package size={18} />
                          </div>

                          <div>
                            <h3>Order #{order.id}</h3>

                            <p>{new Date(order.created_at).toLocaleString()}</p>
                          </div>
                        </div>

                        <span className={getStatusClass(order.status)}>
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <div className="order-card-content">
                        <div className="order-detail-row">
                          <span>
                            <CreditCard size={14} />
                            Payment
                          </span>

                          <strong>{formatStatus(order.payment_status)}</strong>
                        </div>

                        <div className="order-detail-row">
                          <span>
                            <ShoppingBag size={14} />
                            Total
                          </span>

                          <strong className="order-price">
                            KES {Number(order.total_amount).toFixed(2)}
                          </strong>
                        </div>

                        <div className="order-address">
                          <span>
                            <MapPin size={14} />
                            Delivery Address
                          </span>

                          <p>{order.delivery_address || "Not available"}</p>
                        </div>
                      </div>

                      <div className="order-card-footer">
                        <span>View tracking details</span>

                        <ChevronRight size={17} />
                      </div>
                    </article>
                  );
                })}
              </section>

              {/* DETAILS */}
              <section className="order-details">
                {!selectedOrder ? (
                  <div className="order-details-placeholder">
                    <div className="details-placeholder-icon">
                      <Package size={26} />
                    </div>

                    <h3>Select an Order</h3>

                    <p>
                      Select an order from your history to view its tracking
                      details.
                    </p>
                  </div>
                ) : detailLoading ? (
                  <div className="order-details-placeholder">
                    <div className="details-placeholder-icon">
                      <RefreshCw size={23} />
                    </div>

                    <h3>Loading order...</h3>

                    <p>Retrieving your order information.</p>
                  </div>
                ) : (
                  <article className="order-details-card">
                    {/* DETAIL HEADER */}
                    <div className="order-details-header">
                      <div>
                        <span className="details-overline">ORDER DETAILS</span>

                        <h2>Order #{selectedOrder.id}</h2>

                        <p>
                          {new Date(selectedOrder.created_at).toLocaleString()}
                        </p>
                      </div>

                      <span className={getStatusClass(selectedOrder.status)}>
                        {formatStatus(selectedOrder.status)}
                      </span>
                    </div>

                    {/* PROGRESS */}
                    <div className="order-section">
                      <div className="section-title">
                        <div>
                          <h3>Delivery Progress</h3>
                          <p>Follow your order from payment to doorstep.</p>
                        </div>
                      </div>

                      <div className="tracking-timeline">
                        {statusOrder.map((status, index) => {
                          const currentIndex = statusOrder.indexOf(
                            selectedOrder.status,
                          );

                          const completed = currentIndex >= index;

                          const current = selectedOrder.status === status;

                          return (
                            <div
                              key={status}
                              className={`tracking-step ${
                                completed ? "tracking-step-complete" : ""
                              } ${current ? "tracking-step-current" : ""}`}
                            >
                              <div className="tracking-line-wrap">
                                <div className="tracking-dot">
                                  {getProgressIcon(status)}
                                </div>

                                {index < statusOrder.length - 1 && (
                                  <div
                                    className={`tracking-line ${
                                      currentIndex > index
                                        ? "tracking-line-complete"
                                        : ""
                                    }`}
                                  />
                                )}
                              </div>

                              <div className="tracking-step-text">
                                <strong>{formatStatus(status)}</strong>

                                {current && <span>Current status</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ITEMS */}
                    <div className="order-section">
                      <div className="section-title">
                        <div>
                          <h3>Order Items</h3>
                          <p>Products included in this order.</p>
                        </div>
                      </div>

                      <div className="order-items">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.id} className="order-item">
                            <div className="order-item-icon">
                              <Droplets size={18} />
                            </div>

                            <div className="order-item-main">
                              <strong>{item.product_name}</strong>

                              <span>Quantity: {item.quantity}</span>
                            </div>

                            <strong className="order-item-price">
                              KES {Number(item.subtotal).toFixed(2)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DELIVERY */}
                    <div className="order-section">
                      <div className="section-title">
                        <div>
                          <h3>Delivery Information</h3>

                          <p>Where your order will be delivered.</p>
                        </div>
                      </div>

                      <div className="delivery-info-card">
                        <div className="delivery-info-icon">
                          <MapPin size={20} />
                        </div>

                        <div>
                          <span>Delivery Address</span>

                          <strong>
                            {selectedOrder.delivery_address || "Not available"}
                          </strong>
                        </div>
                      </div>

                      <div className="delivery-info-grid">
                        {selectedOrder.delivery_instructions && (
                          <div className="delivery-info-box">
                            <span>Delivery Instructions</span>

                            <strong>
                              {selectedOrder.delivery_instructions}
                            </strong>
                          </div>
                        )}

                        {selectedOrder.delivery_zone_name && (
                          <div className="delivery-info-box">
                            <span>Delivery Zone</span>

                            <strong>{selectedOrder.delivery_zone_name}</strong>
                          </div>
                        )}

                        <div className="delivery-info-box">
                          <span>Delivery Fee</span>

                          <strong>
                            KES{" "}
                            {Number(selectedOrder.delivery_fee || 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT */}
                    <div className="order-payment-section">
                      <div className="payment-heading">
                        <div className="payment-icon">
                          <CreditCard size={18} />
                        </div>

                        <div>
                          <h3>Payment Summary</h3>
                          <span>
                            Payment {formatStatus(selectedOrder.payment_status)}
                          </span>
                        </div>
                      </div>

                      <div className="payment-row">
                        <span>Payment Status</span>

                        <strong>
                          {formatStatus(selectedOrder.payment_status)}
                        </strong>
                      </div>

                      <div className="payment-row payment-total">
                        <span>Order Total</span>

                        <strong>
                          KES {Number(selectedOrder.total_amount).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </article>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const ordersStyles = `
  * {
    box-sizing: border-box;
  }

  .orders-page {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at top right,
        rgba(14, 165, 233, 0.07),
        transparent 30%
      ),
      #f7fafc;
    color: #172033;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .orders-main {
    width: min(1180px, calc(100% - 40px));
    margin: 0 auto;
    padding: 34px 0 65px;
  }

  .orders-hero {
    position: relative;
    overflow: hidden;
    border-radius: 23px;
    padding: 34px 38px;
    background:
      linear-gradient(
        135deg,
        #083344 0%,
        #0e7490 60%,
        #0891b2 100%
      );
    color: white;
    box-shadow:
      0 16px 40px rgba(8, 51, 68, 0.12);
  }

  .orders-hero::after {
    content: "";
    position: absolute;
    width: 260px;
    height: 260px;
    right: -75px;
    top: -110px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  .orders-hero-content {
    position: relative;
    z-index: 1;
    max-width: 700px;
  }

  .orders-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 11px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .orders-hero h1 {
    margin: 0;
    font-size: clamp(28px, 4vw, 38px);
    letter-spacing: -1px;
  }

  .orders-hero p {
    max-width: 650px;
    margin: 11px 0 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 14px;
    line-height: 1.7;
  }

  .orders-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin: 22px 0 34px;
  }

  .orders-stat {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 18px;
    background: white;
    border: 1px solid #e6ecf2;
    border-radius: 15px;
    box-shadow:
      0 6px 20px rgba(15, 23, 42, 0.04);
  }

  .orders-stat-icon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #edf8fb;
    color: #087f9d;
  }

  .orders-stat span {
    display: block;
    margin-bottom: 4px;
    color: #8490a0;
    font-size: 11px;
    font-weight: 650;
  }

  .orders-stat strong {
    color: #172033;
    font-size: 20px;
    line-height: 1;
  }

  .orders-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 16px;
  }

  .orders-heading h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.4px;
  }

  .orders-heading p {
    margin: 5px 0 0;
    color: #7b8797;
    font-size: 13px;
  }

  .orders-refresh {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid #dce5ec;
    background: white;
    color: #526174;
    border-radius: 10px;
    padding: 9px 13px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
  }

  .orders-refresh:hover {
    background: #f8fafc;
  }

  .orders-layout {
    display: grid;
    grid-template-columns: minmax(360px, 0.86fr) minmax(500px, 1.14fr);
    align-items: start;
    gap: 20px;
  }

  .orders-list {
    display: grid;
    gap: 13px;
  }

  .order-card {
    background: white;
    border: 1px solid #e5ebf1;
    border-radius: 17px;
    overflow: hidden;
    cursor: pointer;
    box-shadow:
      0 5px 19px rgba(15, 23, 42, 0.035);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .order-card:hover {
    transform: translateY(-1px);
    border-color: #c9dce5;
    box-shadow:
      0 10px 25px rgba(15, 23, 42, 0.065);
  }

  .order-card-selected {
    border-color: #79bfd0;
    box-shadow:
      0 8px 25px rgba(8, 127, 157, 0.10);
  }

  .order-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 17px 18px 15px;
    border-bottom: 1px solid #edf1f5;
  }

  .order-card-title-area {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .order-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 37px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #edf8fb;
    color: #087f9d;
  }

  .order-card h3 {
    margin: 0;
    color: #202c3f;
    font-size: 16px;
  }

  .order-card-title-area p {
    margin: 4px 0 0;
    color: #8b96a5;
    font-size: 11px;
  }

  .orders-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    padding: 6px 9px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 750;
  }

  .orders-status-delivered {
    background: #ecfdf3;
    color: #087443;
  }

  .orders-status-out {
    background: #eaf8ff;
    color: #0369a1;
  }

  .orders-status-assigned {
    background: #fff7e6;
    color: #a15c00;
  }

  .orders-status-processing,
  .orders-status-paid {
    background: #edf8fb;
    color: #087f9d;
  }

  .orders-status-pending {
    background: #fff8e8;
    color: #a16207;
  }

  .orders-status-cancelled,
  .orders-status-default {
    background: #f1f5f9;
    color: #64748b;
  }

  .order-card-content {
    padding: 14px 18px 15px;
  }

  .order-detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 0;
  }

  .order-detail-row span,
  .order-address > span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8994a4;
    font-size: 11px;
    font-weight: 650;
  }

  .order-detail-row strong {
    color: #39465a;
    font-size: 12px;
  }

  .order-price {
    color: #087f9d !important;
    font-size: 14px !important;
  }

  .order-address {
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid #f0f3f6;
  }

  .order-address p {
    margin: 6px 0 0;
    color: #39465a;
    font-size: 12px;
    line-height: 1.5;
  }

  .order-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 18px;
    background: #fbfcfd;
    border-top: 1px solid #edf1f5;
    color: #087f9d;
    font-size: 11px;
    font-weight: 700;
  }

  .order-details {
    position: sticky;
    top: 96px;
    min-width: 0;
  }

  .order-details-placeholder {
    min-height: 410px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 35px;
    text-align: center;
    background: white;
    border: 1px solid #e5ebf1;
    border-radius: 19px;
  }

  .details-placeholder-icon,
  .orders-empty-icon,
  .orders-loading-icon {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    margin-bottom: 14px;
    border-radius: 15px;
    background: #edf8fb;
    color: #087f9d;
  }

  .order-details-placeholder h3 {
    margin: 0;
    color: #253146;
    font-size: 18px;
  }

  .order-details-placeholder p {
    max-width: 300px;
    margin: 7px 0 0;
    color: #8994a4;
    font-size: 13px;
    line-height: 1.6;
  }

  .order-details-card {
    background: white;
    border: 1px solid #e5ebf1;
    border-radius: 19px;
    overflow: hidden;
    box-shadow:
      0 8px 26px rgba(15, 23, 42, 0.045);
  }

  .order-details-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    padding: 22px 23px;
    border-bottom: 1px solid #edf1f5;
  }

  .details-overline {
    color: #8994a4;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.7px;
  }

  .order-details-header h2 {
    margin: 6px 0 3px;
    color: #1d293d;
    font-size: 22px;
    letter-spacing: -0.5px;
  }

  .order-details-header p {
    margin: 0;
    color: #8994a4;
    font-size: 11px;
  }

  .order-section {
    padding: 21px 23px;
    border-bottom: 1px solid #edf1f5;
  }

  .section-title {
    margin-bottom: 17px;
  }

  .section-title h3 {
    margin: 0;
    color: #263246;
    font-size: 15px;
  }

  .section-title p {
    margin: 4px 0 0;
    color: #8994a4;
    font-size: 11px;
  }

  .tracking-timeline {
    display: grid;
    gap: 0;
  }

  .tracking-step {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 10px;
    min-height: 55px;
  }

  .tracking-line-wrap {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .tracking-dot {
    position: relative;
    z-index: 2;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #f1f5f9;
    color: #9aa5b3;
    border: 2px solid #e2e8f0;
  }

  .tracking-step-complete .tracking-dot {
    background: #edf8fb;
    color: #087f9d;
    border-color: #9ed4df;
  }

  .tracking-step-current .tracking-dot {
    background: #087f9d;
    color: white;
    border-color: #087f9d;
    box-shadow:
      0 0 0 5px rgba(8, 127, 157, 0.09);
  }

  .tracking-line {
    position: absolute;
    top: 30px;
    bottom: -2px;
    width: 2px;
    background: #e7edf2;
  }

  .tracking-line-complete {
    background: #9ed4df;
  }

  .tracking-step-text {
    padding: 5px 0 17px;
  }

  .tracking-step-text strong {
    display: block;
    color: #697689;
    font-size: 12px;
    font-weight: 650;
  }

  .tracking-step-complete .tracking-step-text strong {
    color: #263246;
  }

  .tracking-step-current .tracking-step-text strong {
    color: #087f9d;
    font-weight: 750;
  }

  .tracking-step-text span {
    display: block;
    margin-top: 3px;
    color: #087f9d;
    font-size: 10px;
    font-weight: 700;
  }

  .order-items {
    display: grid;
    gap: 9px;
  }

  .order-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px;
    border: 1px solid #edf1f5;
    border-radius: 11px;
    background: #fbfcfd;
  }

  .order-item-icon {
    width: 35px;
    height: 35px;
    flex: 0 0 35px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #edf8fb;
    color: #087f9d;
  }

  .order-item-main {
    min-width: 0;
    flex: 1;
  }

  .order-item-main strong {
    display: block;
    color: #303d50;
    font-size: 12px;
  }

  .order-item-main span {
    display: block;
    margin-top: 3px;
    color: #8994a4;
    font-size: 10px;
  }

  .order-item-price {
    color: #263246;
    font-size: 12px;
    white-space: nowrap;
  }

  .delivery-info-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #edf1f5;
    border-radius: 12px;
  }

  .delivery-info-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 37px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #edf8fb;
    color: #087f9d;
  }

  .delivery-info-card span,
  .delivery-info-box span {
    display: block;
    margin-bottom: 4px;
    color: #8994a4;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.35px;
  }

  .delivery-info-card strong,
  .delivery-info-box strong {
    display: block;
    color: #354257;
    font-size: 12px;
    line-height: 1.5;
  }

  .delivery-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
    margin-top: 9px;
  }

  .delivery-info-box {
    padding: 12px;
    background: #fbfcfd;
    border: 1px solid #edf1f5;
    border-radius: 10px;
  }

  .order-payment-section {
    padding: 19px 23px;
    background: #fbfcfd;
  }

  .payment-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .payment-icon {
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #edf8fb;
    color: #087f9d;
  }

  .payment-heading h3 {
    margin: 0;
    color: #263246;
    font-size: 14px;
  }

  .payment-heading span {
    display: block;
    margin-top: 3px;
    color: #8994a4;
    font-size: 10px;
  }

  .payment-row {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 7px 0;
    color: #6d798a;
    font-size: 12px;
  }

  .payment-row strong {
    color: #354257;
  }

  .payment-total {
    margin-top: 5px;
    padding-top: 13px;
    border-top: 1px solid #e7edf2;
    color: #263246;
    font-weight: 700;
  }

  .payment-total strong {
    color: #087f9d;
    font-size: 16px;
  }

  .orders-empty,
  .orders-loading {
    padding: 60px 25px;
    text-align: center;
    background: white;
    border: 1px solid #e5ebf1;
    border-radius: 19px;
    box-shadow:
      0 7px 24px rgba(15, 23, 42, 0.035);
  }

  .orders-empty-icon,
  .orders-loading-icon {
    margin-left: auto;
    margin-right: auto;
  }

  .orders-empty h3,
  .orders-loading h3 {
    margin: 0;
    color: #263246;
    font-size: 19px;
  }

  .orders-empty p,
  .orders-loading p {
    max-width: 500px;
    margin: 8px auto 0;
    color: #8994a4;
    font-size: 13px;
    line-height: 1.6;
  }

  .orders-empty-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .orders-primary-button,
  .orders-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 10px 16px;
    border-radius: 10px;
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
  }

  .orders-primary-button {
    background: #087f9d;
    color: white;
  }

  .orders-primary-button:hover {
    background: #066b84;
  }

  .orders-secondary-button {
    border: 1px solid #dce5ec;
    background: white;
    color: #526174;
  }

  .orders-secondary-button:hover {
    background: #f8fafc;
  }

  .orders-error {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 14px 16px;
    border: 1px solid #fecaca;
    border-radius: 12px;
    background: #fff7f7;
    color: #b42318;
    font-size: 13px;
  }

  .orders-loading-icon {
    animation: orders-spin 1.2s linear infinite;
  }

  @keyframes orders-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1050px) {
    .orders-layout {
      grid-template-columns: 1fr;
    }

    .order-details {
      position: static;
    }

    .orders-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 650px) {
    .orders-main {
      width: min(100% - 24px, 1180px);
      padding-top: 22px;
    }

    .orders-hero {
      padding: 27px 22px;
      border-radius: 18px;
    }

    .orders-stats {
      grid-template-columns: 1fr 1fr;
      gap: 9px;
    }

    .orders-stat {
      padding: 14px;
      gap: 9px;
    }

    .orders-stat-icon {
      width: 34px;
      height: 34px;
      flex-basis: 34px;
    }

    .orders-stat strong {
      font-size: 17px;
    }

    .orders-heading {
      align-items: flex-start;
    }

    .orders-refresh {
      padding: 9px;
    }

    .orders-refresh {
      font-size: 0;
    }

    .orders-refresh svg {
      margin: 0;
    }

    .order-card-top,
    .order-details-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .orders-status {
      align-self: flex-start;
    }

    .order-details-header {
      padding: 19px;
    }

    .order-section,
    .order-payment-section {
      padding-left: 19px;
      padding-right: 19px;
    }

    .delivery-info-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default Orders;
