import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await api.get("/cart/");
        setCart(response.data);

        if (!response.data?.items?.length) {
          navigate("/cart");
        }
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryPlace.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    if (!deliveryZone) {
      setMessage("Please enter your delivery zone.");
      return;
    }

    setPlacingOrder(true);
    setMessage("");

    try {
      const response = await api.post("/orders/", {
        delivery_place: deliveryPlace.trim(),
        delivery_zone: Number(deliveryZone),
        delivery_instructions: deliveryInstructions.trim(),
      });

      window.dispatchEvent(new Event("cartUpdated"));

      navigate("/payment", {
        state: {
          order: response.data,
        },
      });
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
        return;
      }

      const data = error.response?.data;

      setMessage(
        data?.detail ||
          data?.delivery_place?.[0] ||
          data?.delivery_zone?.[0] ||
          "Unable to place order. Please check your details.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-container">
          <p className="products-message">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <CustomerHeader returnTo="/cart" returnLabel="Return to Cart" />

        <section className="products-intro">
          <h2>Checkout</h2>
          <p>Enter your delivery details to place your order.</p>
        </section>

        {message && <p className="products-message">{message}</p>}

        <div className="checkout-layout">
          <div className="product-card">
            <h3>Delivery Details</h3>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label htmlFor="deliveryPlace">Delivery Address</label>

                <input
                  id="deliveryPlace"
                  type="text"
                  value={deliveryPlace}
                  onChange={(e) => setDeliveryPlace(e.target.value)}
                  placeholder="e.g. Westlands, Nairobi"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryZone">Delivery Zone</label>

                <input
                  id="deliveryZone"
                  type="number"
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  placeholder="Enter delivery zone ID"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryInstructions">
                  Delivery Instructions
                </label>

                <textarea
                  id="deliveryInstructions"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Optional instructions for the driver"
                  rows="4"
                />
              </div>

              <button
                className="product-button"
                type="submit"
                disabled={placingOrder}
              >
                {placingOrder ? "Placing Order..." : "Continue to Payment"}
              </button>
            </form>
          </div>

          <div className="product-card">
            <h3>Order Summary</h3>

            {cart?.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>

                <strong>KSh {Number(item.subtotal).toLocaleString()}</strong>
              </div>
            ))}

            <hr />

            <h3>
              Products Total: KSh {Number(cart?.total || 0).toLocaleString()}
            </h3>

            <p className="product-description">
              Delivery fee will be calculated by the server based on your
              selected delivery zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
