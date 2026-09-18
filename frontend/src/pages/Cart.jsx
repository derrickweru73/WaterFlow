import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";
function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [message, setMessage] = useState("");

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart/");
      setCart(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
        return;
      }

      setMessage("Unable to load your cart.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    const loadCart = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };

    loadCart();
  }, [navigate]);

  const handleIncrease = async (item) => {
    setUpdatingItem(item.id);
    setMessage("");

    try {
      await api.patch(`/cart/items/${item.id}/`, {
        quantity: item.quantity + 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      await fetchCart();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.quantity?.[0] ||
          "Unable to increase quantity.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      return;
    }

    setUpdatingItem(item.id);
    setMessage("");

    try {
      await api.patch(`/cart/items/${item.id}/`, {
        quantity: item.quantity - 1,
      });

      await fetchCart();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.quantity?.[0] ||
          "Unable to decrease quantity.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleDelete = async (item) => {
    setUpdatingItem(item.id);
    setMessage("");

    try {
      await api.delete(`/cart/items/${item.id}/delete/`);

      window.dispatchEvent(new Event("cartUpdated"));

      await fetchCart();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail || "Unable to remove item from cart.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleBackToProducts = () => {
    navigate("/products");
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-container">
          <p className="products-message">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <CustomerHeader returnTo="/products" returnLabel="Return to Products" />

        <section className="products-intro">
          <h2>Your Cart</h2>
          <p>Review and update the products you have selected.</p>
        </section>

        {message && <p className="products-message">{message}</p>}

        {!message && (!cart?.items || cart.items.length === 0) && (
          <div className="product-card">
            <h3>Your cart is empty</h3>

            <p className="product-description">
              Add some water products to your cart to continue.
            </p>

            <button className="product-button" onClick={handleBackToProducts}>
              Browse Products
            </button>
          </div>
        )}

        {!message && cart?.items?.length > 0 && (
          <div>
            <div className="products-grid">
              {cart.items.map((item) => {
                const isUpdating = updatingItem === item.id;

                return (
                  <div className="product-card" key={item.id}>
                    <h3>{item.product_name}</h3>

                    <p className="product-description">
                      Quantity selected: {item.quantity}
                    </p>

                    <p className="product-price">
                      KSh {Number(item.subtotal).toLocaleString()}
                    </p>

                    <p className="product-stock">Subtotal</p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDecrease(item)}
                        disabled={isUpdating || item.quantity <= 1}
                        style={{
                          width: "40px",
                          height: "40px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          background: "#ffffff",
                          fontSize: "20px",
                          cursor:
                            isUpdating || item.quantity <= 1
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        −
                      </button>

                      <strong
                        style={{
                          minWidth: "30px",
                          textAlign: "center",
                          fontSize: "18px",
                        }}
                      >
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() => handleIncrease(item)}
                        disabled={isUpdating}
                        style={{
                          width: "40px",
                          height: "40px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          background: "#ffffff",
                          fontSize: "20px",
                          cursor: isUpdating ? "not-allowed" : "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="product-button"
                      onClick={() => handleDelete(item)}
                      disabled={isUpdating}
                      style={{
                        background: "#dc2626",
                      }}
                    >
                      {isUpdating ? "Updating..." : "Remove Item"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="product-card" style={{ marginTop: "25px" }}>
              <h3>Total: KSh {Number(cart.total || 0).toLocaleString()}</h3>

              <button className="product-button" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
