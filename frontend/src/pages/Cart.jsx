import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Droplets,
  CreditCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

const GUEST_CART_KEY = "waterflow_guest_cart";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [guest, setGuest] = useState(false);

  const getGuestCart = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    } catch (error) {
      console.error("Unable to read guest cart:", error);
      return [];
    }
  };

  const saveGuestCart = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const fetchCart = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      const guestItems = getGuestCart();

      setGuest(true);
      setCart({ items: guestItems });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/cart/");

      setCart(response.data);
      setGuest(false);
    } catch (error) {
      console.error("Unable to load cart:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setGuest(true);
        setCart({ items: getGuestCart() });
        return;
      }

      setMessage("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateGuestQuantity = (productId, quantity) => {
    const items = getGuestCart();

    const updatedItems = items.map((item) =>
      Number(item.product) === Number(productId)
        ? {
            ...item,
            quantity,
          }
        : item,
    );

    saveGuestCart(updatedItems);
    setCart({ items: updatedItems });
  };

  const removeGuestItem = (productId) => {
    const items = getGuestCart();

    const updatedItems = items.filter(
      (item) => Number(item.product) !== Number(productId),
    );

    saveGuestCart(updatedItems);
    setCart({ items: updatedItems });
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    if (guest) {
      updateGuestQuantity(item.product, newQuantity);
      return;
    }

    try {
      setMessage("");

      // Logged-in customer: update the CART ITEM, not the cart itself.
      await api.patch(`/cart/items/${item.id}/`, {
        quantity: newQuantity,
      });

      await fetchCart();

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Unable to update cart:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.detail ||
          "Unable to update item quantity.",
      );
    }
  };

  const removeItem = async (item) => {
    if (guest) {
      removeGuestItem(item.product);
      return;
    }

    try {
      setMessage("");

      // Logged-in customer: delete the CART ITEM.
      await api.delete(`/cart/items/${item.id}/delete/`);

      await fetchCart();

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Unable to remove item:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.detail ||
          "Unable to remove item.",
      );
    }
  };

  const getItemPrice = (item) => {
    return Number(
      item.unit_price ??
        item.price ??
        item.product_price ??
        0,
    );
  };

  const getItemSubtotal = (item) => {
    if (item.subtotal !== undefined) {
      return Number(item.subtotal);
    }

    return getItemPrice(item) * Number(item.quantity || 0);
  };

  const total = cart.items.reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0,
  );

  const totalItems = cart.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      return;
    }

    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="cart-page">
        <CustomerHeader
          returnTo="/products"
          returnLabel="Return to Products"
          minimal={true}
        />

        <main className="cart-main">
          <div className="cart-loading">
            <div className="cart-loading-icon">
              <ShoppingCart size={24} />
            </div>

            <h3>Loading your cart...</h3>

            <p>We're checking the items you've selected.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <CustomerHeader
        returnTo="/products"
        returnLabel="Continue Shopping"
        minimal={true}
      />

      <main className="cart-main">
        <section className="cart-hero">
          <div className="cart-hero-icon">
            <ShoppingCart size={25} />
          </div>

          <div>
            <div className="cart-eyebrow">
              <Droplets size={14} />
              WATERFLOW STORE
            </div>

            <h1>Your Cart</h1>

            <p>Review and update the products you have selected.</p>
          </div>
        </section>

        {message && <div className="cart-message">{message}</div>}

        {cart.items.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={28} />
            </div>

            <h2>Your cart is empty</h2>

            <p>You have not added any water products to your cart yet.</p>

            <Link to="/products" className="cart-primary-button">
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-section-heading">
                <div>
                  <h2>Selected Products</h2>

                  <p>
                    {totalItems} item
                    {totalItems !== 1 ? "s" : ""} in your cart
                  </p>
                </div>
              </div>

              <div className="cart-items">
                {cart.items.map((item) => {
                  const price = getItemPrice(item);
                  const subtotal = getItemSubtotal(item);

                  return (
                    <article
                      key={item.id ?? item.product}
                      className="cart-item-card"
                    >
                      <div className="cart-item-icon">
                        <Droplets size={22} />
                      </div>

                      <div className="cart-item-content">
                        <div className="cart-item-top">
                          <div>
                            <h3>
                              {item.product_name ||
                                item.name ||
                                "Water Product"}
                            </h3>

                            <p className="cart-item-price">
                              KSh {price.toFixed(2)} per item
                            </p>
                          </div>

                          <strong className="cart-item-subtotal">
                            KSh {subtotal.toFixed(2)}
                          </strong>
                        </div>

                        <div className="cart-item-bottom">
                          <div className="cart-quantity">
                            <span>Quantity</span>

                            <div className="cart-quantity-control">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(item.quantity) - 1,
                                  )
                                }
                                disabled={Number(item.quantity) <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus size={15} />
                              </button>

                              <strong>{item.quantity}</strong>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    Number(item.quantity) + 1,
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={15} />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="cart-remove-button"
                            onClick={() => removeItem(item)}
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-header">
                <div className="cart-summary-icon">
                  <CreditCard size={19} />
                </div>

                <div>
                  <h2>Order Summary</h2>
                  <p>Review your purchase</p>
                </div>
              </div>

              <div className="cart-summary-details">
                <div>
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>KSh {total.toFixed(2)}</strong>
                </div>

                <div>
                  <span>Delivery</span>
                  <strong>Calculated at checkout</strong>
                </div>
              </div>

              <div className="cart-total">
                <span>Total</span>

                <strong>KSh {total.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="cart-continue-button">
                Continue Shopping
              </Link>

            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
 