import { useEffect, useState } from "react";
import { ShoppingCart, ArrowLeft, LogOut, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerHeader({
  showLogout = false,
  returnTo = "/products",
  returnLabel = "Return",
}) {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCartCount(0);
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

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
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

    navigate("/");
  };

  return (
    <header className="customer-header">
      <div className="customer-header-brand">
        <h1>WaterFlow</h1>
        <p>Water Delivery & Refill Management System</p>
      </div>

      <div className="customer-header-actions">
        {!showLogout && (
          <button
            type="button"
            className="header-return-button"
            onClick={handleReturn}
          >
            <ArrowLeft size={18} />
            <span>{returnLabel}</span>
          </button>
        )}

        {/* My Orders */}
        <Link to="/orders" className="header-orders-link">
          My Orders
        </Link>

        {/* Cart */}
        <button
          type="button"
          className="cart-icon-button"
          onClick={handleCartClick}
          title="View Cart"
          aria-label={`View Cart. ${cartCount} items`}
        >
          <ShoppingCart size={24} />

          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>

        {showLogout && (
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default CustomerHeader;
