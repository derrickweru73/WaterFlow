import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          navigate("/");
          return;
        }

        const [cartResponse, zonesResponse] = await Promise.all([
          api.get("/cart/"),
          api.get("/delivery-zones/"),
        ]);

        setCart(cartResponse.data);
        setDeliveryZones(zonesResponse.data);

        if (!cartResponse.data?.items?.length) {
          navigate("/cart");
          return;
        }
      } catch (error) {
        console.error("Checkout loading error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/");
          return;
        }

        setMessage("Unable to load checkout details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [navigate]);

  const handleDeliveryPlaceChange = async (e) => {
    const value = e.target.value;

    setDeliveryPlace(value);
    setMessage("");

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchingPlaces(true);

      const response = await api.get("/google/place-autocomplete/", {
        params: {
          input: value.trim(),
        },
      });

      const results =
        response.data?.predictions ||
        response.data?.results ||
        response.data ||
        [];

      setSuggestions(Array.isArray(results) ? results : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Google autocomplete error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    const placeId = suggestion.place_id || suggestion.placeId || suggestion.id;

    const description =
      suggestion.description ||
      suggestion.formatted_address ||
      suggestion.name ||
      "";

    if (!placeId) {
      setDeliveryPlace(description);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchingPlaces(true);

      const response = await api.get("/google/place-details/", {
        params: {
          place_id: placeId,
        },
      });

      const place = response.data?.result || response.data;

      const formattedAddress = place?.formatted_address || description;

      setDeliveryPlace(formattedAddress);
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Google place details error:", error);

      setDeliveryPlace(description);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingPlaces(false);
    }
  };

  const handlePlaceBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handlePlaceFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryPlace.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    if (!deliveryZone) {
      setMessage("Please select your delivery zone.");
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
      console.error("Place order error:", error);

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
          <CustomerHeader returnTo="/cart" returnLabel="Return to Cart" />

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

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    id="deliveryPlace"
                    type="text"
                    value={deliveryPlace}
                    onChange={handleDeliveryPlaceChange}
                    onFocus={handlePlaceFocus}
                    onBlur={handlePlaceBlur}
                    placeholder="Start typing your location..."
                    autoComplete="off"
                    required
                  />

                  {searchingPlaces && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#6b7280",
                      }}
                    >
                      Searching locations...
                    </small>
                  )}

                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#ffffff",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        marginTop: "4px",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                      }}
                    >
                      {suggestions.map((suggestion, index) => {
                        const description =
                          suggestion.description ||
                          suggestion.formatted_address ||
                          suggestion.name ||
                          "Location";

                        return (
                          <button
                            key={
                              suggestion.place_id || suggestion.placeId || index
                            }
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "12px 14px",
                              border: "none",
                              borderBottom:
                                index < suggestions.length - 1
                                  ? "1px solid #e5e7eb"
                                  : "none",
                              background: "#ffffff",
                              textAlign: "left",
                              cursor: "pointer",
                              color: "#374151",
                            }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.background = "#f3f4f6";
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.background = "#ffffff";
                            }}
                          >
                            {description}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#6b7280",
                  }}
                >
                  Start typing and select your location from the suggestions.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="deliveryZone">Delivery Zone</label>

                <select
                  id="deliveryZone"
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  required
                >
                  <option value="">Select your delivery zone</option>

                  {deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — KSh{" "}
                      {Number(zone.delivery_fee).toLocaleString()} delivery
                    </option>
                  ))}
                </select>
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
                disabled={placingOrder || deliveryZones.length === 0}
              >
                {placingOrder ? "Placing Order..." : "Continue to Payment"}
              </button>
            </form>

            {deliveryZones.length === 0 && (
              <p className="products-message">
                No delivery zones are currently available.
              </p>
            )}
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
                  gap: "15px",
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
              Delivery fee will be added based on your selected delivery zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
