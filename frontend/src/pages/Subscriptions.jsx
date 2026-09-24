import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";
import "./Subscriptions.css";

const FREQUENCIES = [
  {
    value: "WEEKLY",
    label: "Weekly",
    description: "Every 7 days",
  },
  {
    value: "BIWEEKLY",
    label: "Biweekly",
    description: "Every 14 days",
  },
  {
    value: "MONTHLY",
    label: "Monthly",
    description: "Every 30 days",
  },
];

function Subscriptions() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [frequency, setFrequency] = useState("WEEKLY");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [nextDeliveryDate, setNextDeliveryDate] = useState("");

  const [deliveryPlace, setDeliveryPlace] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [subscriptionsResponse, productsResponse, zonesResponse] =
          await Promise.all([
            api.get("/subscriptions/"),
            api.get("/products/"),
            api.get("/delivery-zones/"),
          ]);

        const subscriptionData =
          subscriptionsResponse.data?.results ||
          subscriptionsResponse.data ||
          [];

        const productData =
          productsResponse.data?.results || productsResponse.data || [];

        const zoneData =
          zonesResponse.data?.results || zonesResponse.data || [];

        setSubscriptions(
          Array.isArray(subscriptionData) ? subscriptionData : [],
        );

        setProducts(
          Array.isArray(productData)
            ? productData.filter((product) => product.is_active !== false)
            : [],
        );

        setDeliveryZones(Array.isArray(zoneData) ? zoneData : []);
      } catch (error) {
        console.error("Subscription loading error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          navigate("/login", {
            replace: true,
            state: {
              returnTo: "/subscriptions",
            },
          });

          return;
        }

        setMessage("Unable to load subscription information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const activeSubscriptions = useMemo(
    () =>
      subscriptions.filter((subscription) => subscription.status === "ACTIVE"),
    [subscriptions],
  );

  const pausedSubscriptions = useMemo(
    () =>
      subscriptions.filter((subscription) => subscription.status === "PAUSED"),
    [subscriptions],
  );

  const pendingSubscriptions = useMemo(
    () =>
      subscriptions.filter(
        (subscription) => subscription.status === "PENDING_PAYMENT",
      ),
    [subscriptions],
  );

  const nextSubscription = useMemo(() => {
    const upcoming = subscriptions
      .filter(
        (subscription) =>
          subscription.status === "ACTIVE" && subscription.next_delivery_date,
      )
      .sort(
        (a, b) =>
          new Date(a.next_delivery_date) - new Date(b.next_delivery_date),
      );

    return upcoming[0] || null;
  }, [subscriptions]);

  const selectedProduct = useMemo(
    () => products.find((product) => Number(product.id) === Number(productId)),
    [products, productId],
  );

  const selectedZone = useMemo(
    () =>
      deliveryZones.find((zone) => Number(zone.id) === Number(deliveryZone)),
    [deliveryZones, deliveryZone],
  );

  const estimatedTotal =
    selectedProduct && selectedZone
      ? Number(selectedProduct.price) * Number(quantity || 0) +
        Number(selectedZone.delivery_fee || 0)
      : 0;

  const resetForm = () => {
    setFrequency("WEEKLY");
    setProductId("");
    setQuantity(1);
    setNextDeliveryDate("");
    setDeliveryPlace("");
    setDeliveryZone("");
    setDeliveryInstructions("");

    setSuggestions([]);
    setShowSuggestions(false);
    setSearchingPlaces(false);
    setMessage("");
  };

  const openForm = () => {
    setMessage("");

    if (!nextDeliveryDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const formattedDate = tomorrow.toISOString().split("T")[0];

      setNextDeliveryDate(formattedDate);
    }

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

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

  const handleCreateSubscription = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          returnTo: "/subscriptions",
        },
      });

      return;
    }

    if (!productId) {
      setMessage("Please select a water product.");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      setMessage("Quantity must be at least 1.");
      return;
    }

    if (!nextDeliveryDate) {
      setMessage("Please select your first delivery date.");
      return;
    }

    if (!deliveryPlace.trim()) {
      setMessage("Please enter your delivery address.");
      return;
    }

    if (!deliveryZone) {
      setMessage("Please select your delivery zone.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await api.post("/subscriptions/", {
        delivery_address: deliveryPlace.trim(),
        delivery_zone: Number(deliveryZone),
        delivery_instructions: deliveryInstructions.trim(),
        frequency,
        next_delivery_date: nextDeliveryDate,
        items: [
          {
            product: Number(productId),
            quantity: Number(quantity),
          },
        ],
      });

      console.log("Subscription response:", response.data);

      const createdOrder = response.data?.order;

      if (!createdOrder?.id) {
        setMessage(
          "Subscription was created, but the payment order was not returned.",
        );
        setSaving(false);
        return;
      }

      /*
       * The subscription is still PENDING_PAYMENT.
       * Send the first subscription order to the
       * existing M-Pesa payment page.
       */
      navigate("/payment", {
        state: {
          order: createdOrder,
          paymentContext: "subscription",
          subscription: response.data?.subscription || null,
        },
      });
    } catch (error) {
      console.error("Create subscription error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login", {
          replace: true,
          state: {
            returnTo: "/subscriptions",
          },
        });

        return;
      }

      const data = error.response?.data;

      setMessage(
        data?.detail ||
          data?.delivery_address?.[0] ||
          data?.delivery_zone?.[0] ||
          data?.frequency?.[0] ||
          data?.next_delivery_date?.[0] ||
          data?.items?.[0] ||
          "Unable to create subscription. Please check your details.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubscriptionAction = async (subscription, action) => {
    const actionText =
      action === "pause" ? "pause" : action === "resume" ? "resume" : "cancel";

    if (
      action === "cancel" &&
      !window.confirm("Are you sure you want to cancel this subscription?")
    ) {
      return;
    }

    try {
      setMessage("");

      const response = await api.patch(
        `/subscriptions/${subscription.id}/action/`,
        {
          action,
        },
      );

      setSubscriptions((current) =>
        current.map((item) =>
          item.id === subscription.id ? response.data : item,
        ),
      );

      setMessage(`Subscription ${actionText}d successfully.`);
    } catch (error) {
      console.error("Subscription action error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login", {
          replace: true,
          state: {
            returnTo: "/subscriptions",
          },
        });

        return;
      }

      setMessage(
        error.response?.data?.detail || `Unable to ${actionText} subscription.`,
      );
    }
  };

  if (!token) {
    return (
      <div className="products-page">
        <div className="products-container">
          <CustomerHeader
            minimal
            returnTo="/products"
            returnLabel="Back to Products"
          />

          <section className="subscriptions-login-state">
            <div className="subscriptions-login-icon">
              <Repeat size={30} />
            </div>

            <h2>Stay on schedule with WaterFlow</h2>

            <p>
              Subscribe to regular water deliveries and choose a weekly,
              biweekly, or monthly plan.
            </p>

            <div className="subscriptions-login-actions">
              <button
                type="button"
                className="product-button"
                onClick={() =>
                  navigate("/login", {
                    state: {
                      returnTo: "/subscriptions",
                    },
                  })
                }
              >
                Sign In
              </button>

              <button
                type="button"
                className="subscription-secondary-button"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-container">
          <CustomerHeader returnTo="/products" returnLabel="Back to Products" />

          <p className="products-message">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <CustomerHeader returnTo="/products" returnLabel="Back to Products" />

        <section className="subscriptions-hero">
          <div>
            <span className="subscriptions-eyebrow">
              WATERFLOW SUBSCRIPTIONS
            </span>

            <h1>
              Keep your water supply
              <span> on schedule.</span>
            </h1>

            <p>
              Choose a delivery frequency that works for you. Subscriptions are
              optional, and your first subscription delivery is paid securely
              through M-Pesa.
            </p>

            <button
              type="button"
              className="subscription-primary-button"
              onClick={openForm}
            >
              <Plus size={18} />
              Create Subscription
            </button>
          </div>

          <div className="subscriptions-hero-icon">
            <Repeat size={76} strokeWidth={1.5} />
          </div>
        </section>

        {message && <div className="subscriptions-alert">{message}</div>}

        <section className="subscription-stats">
          <div className="subscription-stat-card">
            <div className="subscription-stat-icon active">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Active</span>
              <strong>{activeSubscriptions.length}</strong>
            </div>
          </div>

          <div className="subscription-stat-card">
            <div className="subscription-stat-icon paused">
              <Pause size={20} />
            </div>

            <div>
              <span>Paused</span>
              <strong>{pausedSubscriptions.length}</strong>
            </div>
          </div>

          <div className="subscription-stat-card">
            <div className="subscription-stat-icon pending">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Awaiting Payment</span>
              <strong>{pendingSubscriptions.length}</strong>
            </div>
          </div>

          <div className="subscription-stat-card">
            <div className="subscription-stat-icon delivery">
              <Truck size={20} />
            </div>

            <div>
              <span>Next Delivery</span>
              <strong>
                {nextSubscription
                  ? new Date(
                      nextSubscription.next_delivery_date,
                    ).toLocaleDateString()
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        {subscriptions.length === 0 ? (
          <section className="subscriptions-empty">
            <div className="subscriptions-empty-icon">
              <Repeat size={30} />
            </div>

            <h2>No subscriptions yet</h2>

            <p>
              Want regular water deliveries? Create a subscription and choose
              how often you'd like your water delivered.
            </p>

            <button
              type="button"
              className="subscription-primary-button"
              onClick={openForm}
            >
              <Plus size={18} />
              Create Your First Subscription
            </button>
          </section>
        ) : (
          <section className="subscriptions-list">
            <div className="subscriptions-section-heading">
              <div>
                <span>YOUR PLANS</span>
                <h2>Subscription Plans</h2>
              </div>

              <button
                type="button"
                className="subscription-refresh-button"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="subscription-cards">
              {subscriptions.map((subscription) => {
                const frequency = FREQUENCIES.find(
                  (item) => item.value === subscription.frequency,
                );

                return (
                  <article className="subscription-card" key={subscription.id}>
                    <div className="subscription-card-top">
                      <div>
                        <span className="subscription-card-label">
                          PLAN #{subscription.id}
                        </span>

                        <h3>{frequency?.label || subscription.frequency}</h3>
                      </div>

                      <span
                        className={`subscription-status ${subscription.status.toLowerCase()}`}
                      >
                        {subscription.status === "PENDING_PAYMENT"
                          ? "Awaiting Payment"
                          : subscription.status}
                      </span>
                    </div>

                    <div className="subscription-card-body">
                      <div className="subscription-detail">
                        <Repeat size={17} />
                        <div>
                          <span>Frequency</span>
                          <strong>
                            {frequency?.description || subscription.frequency}
                          </strong>
                        </div>
                      </div>

                      <div className="subscription-detail">
                        <CalendarDays size={17} />
                        <div>
                          <span>Next delivery</span>
                          <strong>
                            {subscription.next_delivery_date
                              ? new Date(
                                  subscription.next_delivery_date,
                                ).toLocaleDateString()
                              : "Not scheduled"}
                          </strong>
                        </div>
                      </div>

                      <div className="subscription-detail">
                        <Truck size={17} />
                        <div>
                          <span>Delivery address</span>
                          <strong>{subscription.delivery_address}</strong>
                        </div>
                      </div>

                      <div className="subscription-products">
                        {subscription.items?.map((item) => (
                          <div
                            className="subscription-product-row"
                            key={item.id}
                          >
                            <span>{item.product_name}</span>

                            <strong>× {item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {subscription.status === "PENDING_PAYMENT" && (
                      <div className="subscription-pending-note">
                        <Clock3 size={16} />
                        Complete the first payment to activate this
                        subscription.
                      </div>
                    )}

                    {subscription.status !== "PENDING_PAYMENT" &&
                      subscription.status !== "CANCELLED" && (
                        <div className="subscription-actions">
                          {subscription.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSubscriptionAction(subscription, "pause")
                              }
                            >
                              <Pause size={15} />
                              Pause
                            </button>
                          )}

                          {subscription.status === "PAUSED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSubscriptionAction(subscription, "resume")
                              }
                            >
                              <Play size={15} />
                              Resume
                            </button>
                          )}

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              handleSubscriptionAction(subscription, "cancel")
                            }
                          >
                            <Trash2 size={15} />
                            Cancel
                          </button>
                        </div>
                      )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {showForm && (
          <div className="subscription-modal-backdrop">
            <div className="subscription-modal">
              <div className="subscription-modal-header">
                <div>
                  <span>CREATE SUBSCRIPTION</span>
                  <h2>Set up regular delivery</h2>
                </div>

                <button
                  type="button"
                  className="subscription-close-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="subscription-form"
                onSubmit={handleCreateSubscription}
              >
                <div className="subscription-form-section">
                  <h3>1. Choose your frequency</h3>

                  <div className="frequency-grid">
                    {FREQUENCIES.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`frequency-option ${
                          frequency === option.value ? "selected" : ""
                        }`}
                        onClick={() => setFrequency(option.value)}
                      >
                        <Repeat size={19} />

                        <span>
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="subscription-form-section">
                  <h3>2. Choose your water</h3>

                  <div className="subscription-form-grid">
                    <div className="form-group">
                      <label htmlFor="subscriptionProduct">Water Product</label>

                      <select
                        id="subscriptionProduct"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                      >
                        <option value="">Select a product</option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} — KSh{" "}
                            {Number(product.price).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subscriptionQuantity">Quantity</label>

                      <input
                        id="subscriptionQuantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="nextDeliveryDate">
                      First Delivery Date
                    </label>

                    <input
                      id="nextDeliveryDate"
                      type="date"
                      value={nextDeliveryDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setNextDeliveryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="subscription-form-section">
                  <h3>3. Delivery details</h3>

                  <div className="form-group">
                    <label htmlFor="subscriptionAddress">
                      Delivery Address
                    </label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <input
                        id="subscriptionAddress"
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
                        <small className="subscription-searching">
                          Searching locations...
                        </small>
                      )}

                      {showSuggestions && suggestions.length > 0 && (
                        <div className="subscription-suggestions">
                          {suggestions.map((suggestion, index) => {
                            const description =
                              suggestion.description ||
                              suggestion.formatted_address ||
                              suggestion.name ||
                              "Location";

                            return (
                              <button
                                key={
                                  suggestion.place_id ||
                                  suggestion.placeId ||
                                  index
                                }
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                              >
                                {description}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <small className="subscription-help">
                      Start typing and select your location from the
                      suggestions.
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subscriptionZone">Delivery Zone</label>

                    <select
                      id="subscriptionZone"
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
                    <label htmlFor="subscriptionInstructions">
                      Delivery Instructions
                    </label>

                    <textarea
                      id="subscriptionInstructions"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Optional instructions for the driver"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="subscription-payment-preview">
                  <div>
                    <span>First payment</span>
                    <small>Products + delivery fee</small>
                  </div>

                  <strong>KSh {estimatedTotal.toLocaleString()}</strong>
                </div>

                <div className="subscription-modal-actions">
                  <button
                    type="button"
                    className="subscription-secondary-button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="subscription-primary-button"
                    disabled={
                      saving ||
                      products.length === 0 ||
                      deliveryZones.length === 0
                    }
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={17} className="subscription-spin" />
                        Creating...
                      </>
                    ) : (
                      <>Continue to Payment</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscriptions;
