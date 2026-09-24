import { useEffect, useState } from "react";
import {
  ShoppingCart,
  ArrowLeft,
  LogOut,
  Bell,
  Droplets,
  Home,
  Package,
  Repeat,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerHeader({
  showLogout = false,
  returnTo = "/products",
  returnLabel = "Return",
  minimal = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [customerName, setCustomerName] = useState("");

  const fetchCartCount = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      try {
        const guestCart = JSON.parse(
          localStorage.getItem("waterflow_guest_cart") || "[]",
        );

        const totalQuantity = guestCart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0,
        );

        setCartCount(totalQuantity);
      } catch (error) {
        console.error("Unable to load guest cart count:", error);
        setCartCount(0);
      }

      return;
    }

    try {
      const response = await api.get("/cart/");

      const items = response.data?.items || [];

      const totalQuantity = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.error("Unable to load cart count:", error);
      setCartCount(0);
    }
  };

  const fetchNotificationCount = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setNotificationCount(0);
      return;
    }

    try {
      const response = await api.get("/notifications/");

      const notifications = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const unreadCount = notifications.filter(
        (notification) => !notification.is_read,
      ).length;

      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Unable to load notification count:", error);
      setNotificationCount(0);
    }
  };

  const fetchCustomerName = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCustomerName("");
      return;
    }

    const savedUsername = localStorage.getItem("username") || "";

    setCustomerName(savedUsername);
  };

  useEffect(() => {
    fetchCartCount();
    fetchNotificationCount();
    fetchCustomerName();

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    const handleNotificationsUpdated = () => {
      fetchNotificationCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("notificationsUpdated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdated,
      );
    };
  }, []);

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleReturn = () => {
    navigate(returnTo);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/products") {
      return location.pathname === "/products" || location.pathname === "/";
    }

    return location.pathname === path;
  };

  return (
    <header className="customer-header">
      <div className="customer-header-inner">
        <Link to="/products" className="customer-header-brand">
          <div className="customer-brand-icon">
            <Droplets size={21} />
          </div>

          <div className="customer-brand-text">
            <strong>WaterFlow</strong>
            <span>Water delivery made simple</span>
          </div>
        </Link>

        {minimal ? (
          <div className="customer-header-actions">
            <button
              type="button"
              className="header-return-button"
              onClick={handleReturn}
            >
              <ArrowLeft size={18} />
              <span>{returnLabel}</span>
            </button>
          </div>
        ) : (
          <>
            <nav className="customer-nav">
              <Link
                to="/products"
                className={`customer-nav-link ${
                  isActive("/products") ? "active" : ""
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>

              <Link
                to="/products"
                className={`customer-nav-link ${
                  isActive("/products") ? "active" : ""
                }`}
              >
                <Droplets size={16} />
                <span>Products</span>
              </Link>

              <Link
                to="/orders"
                className={`customer-nav-link ${
                  isActive("/orders") ? "active" : ""
                }`}
              >
                <Package size={16} />
                <span>My Orders</span>
              </Link>

              <Link
                to="/subscriptions"
                className={`customer-nav-link ${
                  isActive("/subscriptions") ? "active" : ""
                }`}
              >
                <Repeat size={16} />
                <span>Subscriptions</span>
              </Link>

              <Link
                to="/notifications"
                className={`customer-nav-link ${
                  isActive("/notifications") ? "active" : ""
                }`}
              >
                <span className="nav-icon-with-badge">
                  <Bell size={16} />

                  {notificationCount > 0 && (
                    <span className="nav-notification-badge">
                      {notificationCount}
                    </span>
                  )}
                </span>

                <span>Notifications</span>
              </Link>

              <button
                type="button"
                className={`customer-nav-link customer-cart-nav ${
                  isActive("/cart") ? "active" : ""
                }`}
                onClick={handleCartClick}
              >
                <span className="nav-icon-with-badge">
                  <ShoppingCart size={17} />

                  {cartCount > 0 && (
                    <span className="nav-cart-badge">{cartCount}</span>
                  )}
                </span>

                <span>Cart</span>
              </button>
            </nav>

            <div className="customer-header-right">
              {customerName && (
                <div className="customer-profile">
                  <div className="customer-avatar">
                    {customerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="customer-profile-name">
                    <span>Welcome</span>
                    <strong>{customerName}</strong>
                  </div>
                </div>
              )}

              {showLogout && (
                <button
                  type="button"
                  className="logout-button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default CustomerHeader;
