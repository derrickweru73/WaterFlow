import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

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
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleBackToProducts = () => {
    navigate("/products");
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
        <header className="products-header">
          <div>
            <h1>WaterFlow</h1>
            <p>Water Delivery & Refill Management System</p>
          </div>

          <button className="logout-button" onClick={handleBackToProducts}>
            Continue Shopping
          </button>
        </header>

        <section className="products-intro">
          <h2>Your Cart</h2>
          <p>Review the products you have selected.</p>
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
              {cart.items.map((item) => (
                <div className="product-card" key={item.id}>
                  <h3>{item.product_name}</h3>

                  <p className="product-description">
                    Quantity: {item.quantity}
                  </p>

                  <p className="product-description">
                    Unit price: KSh {Number(item.unit_price).toLocaleString()}
                  </p>

                  <p className="product-price">
                    KSh {Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="product-card" style={{ marginTop: "25px" }}>
              <h3>Total: KSh {Number(cart.total || 0).toLocaleString()}</h3>

              <button className="product-button">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
