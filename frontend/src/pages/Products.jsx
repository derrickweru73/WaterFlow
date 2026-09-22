import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Droplets,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";
import "./Products.css";

const GUEST_CART_KEY = "waterflow_guest_cart";

function Products() {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || "");
  const [addingProduct, setAddingProduct] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        setProducts(response.data);
      } catch (error) {
        console.error("Products loading error:", error);
        setMessage("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    setAddingProduct(product.id);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        const existingCart = JSON.parse(
          localStorage.getItem(GUEST_CART_KEY) || "[]",
        );

        const existingItem = existingCart.find(
          (item) => Number(item.product) === Number(product.id),
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          existingCart.push({
            product: product.id,
            product_name: product.name,
            price: product.price,
            description: product.description,
            quantity: 1,
          });
        }

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(existingCart));

        window.dispatchEvent(new Event("cartUpdated"));

        setMessage(`${product.name} added to cart.`);
        return;
      }

      await api.post("/cart/items/", {
        product: product.id,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      setMessage(`${product.name} added to cart.`);
    } catch (error) {
      console.error("Add to cart error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setMessage("Your session has expired. Please sign in again.");
        return;
      }

      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.quantity?.[0] ||
          "Unable to add product to cart. Please try again.",
      );
    } finally {
      setTimeout(() => {
        setAddingProduct(null);
      }, 500);
    }
  };

  return (
    <div className="customer-home">
      <CustomerHeader showLogout={true} />

      <main className="customer-home-container">
        {message && (
          <div className="customer-notification">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        <section className="customer-hero">
          <div className="customer-hero-content">
            <div className="customer-hero-badge">
              <Droplets size={16} />
              <span>Fresh water, delivered</span>
            </div>

            <h1>
              Clean water,
              <br />
              <span>delivered to you.</span>
            </h1>

            <p>
              Order quality drinking water and refills from WaterFlow. Choose
              what you need and we'll handle the delivery.
            </p>

            <div className="customer-hero-actions">
              <a href="#available-products" className="customer-primary-button">
                Shop water
                <ArrowRight size={18} />
              </a>

              <Link to="/orders" className="customer-secondary-button">
                <Package size={18} />
                My orders
              </Link>
            </div>
          </div>

          <div className="customer-hero-visual">
            <div className="hero-water-circle hero-circle-large">
              <Droplets size={92} strokeWidth={1.2} />
            </div>

            <div className="hero-water-circle hero-circle-small">
              <CheckCircle2 size={32} />
            </div>

            <div className="hero-delivery-card">
              <Truck size={20} />
              <div>
                <strong>Reliable delivery</strong>
                <span>To your doorstep</span>
              </div>
            </div>
          </div>
        </section>

        <section className="customer-quick-actions">
          <Link to="/orders" className="quick-action-card">
            <div className="quick-action-icon">
              <Package size={21} />
            </div>
            <div className="quick-action-text">
              <strong>My Orders</strong>
              <span>View and track your orders</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/cart" className="quick-action-card">
            <div className="quick-action-icon">
              <ShoppingCart size={21} />
            </div>
            <div className="quick-action-text">
              <strong>Shopping Cart</strong>
              <span>Review your selected items</span>
            </div>
            <ArrowRight size={18} />
          </Link>

          <Link to="/notifications" className="quick-action-card">
            <div className="quick-action-icon">
              <Bell size={21} />
            </div>
            <div className="quick-action-text">
              <strong>Notifications</strong>
              <span>Stay updated on your orders</span>
            </div>
            <ArrowRight size={18} />
          </Link>
        </section>

        <section className="products-section" id="available-products">
          <div className="products-section-heading">
            <div>
              <div className="section-label">WATERFLOW STORE</div>

              <h2>Available Products</h2>

              <p>Choose the water refill product you need.</p>
            </div>

            <div className="products-count">
              {products.length} {products.length === 1 ? "product" : "products"}
            </div>
          </div>

          {loading && (
            <div className="products-loading">
              <div className="loading-spinner"></div>
              <p>Loading available products...</p>
            </div>
          )}

          {!loading && products.length === 0 && !message && (
            <div className="products-empty">
              <Droplets size={38} />
              <h3>No products available</h3>
              <p>
                There are currently no water products available. Please check
                again later.
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="customer-products-grid">
              {products.map((product) => {
                const stock =
                  product.inventory?.quantity ??
                  product.inventory_quantity ??
                  product.stock ??
                  0;

                const isAdding = addingProduct === product.id;

                return (
                  <article className="customer-product-card" key={product.id}>
                    <div className="product-visual">
                      <div className="product-water-icon">
                        <Droplets size={48} strokeWidth={1.4} />
                      </div>

                      {stock > 0 ? (
                        <span className="stock-badge">
                          <span className="stock-dot"></span>
                          Available
                        </span>
                      ) : (
                        <span className="stock-badge stock-empty">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="customer-product-content">
                      <span className="product-category">Water Refill</span>

                      <h3>{product.name}</h3>

                      <p className="customer-product-description">
                        {product.description}
                      </p>

                      <div className="customer-product-bottom">
                        <div>
                          <span className="price-label">Price</span>
                          <strong className="customer-product-price">
                            KSh {Number(product.price).toLocaleString()}
                          </strong>
                        </div>

                        <span className="customer-product-stock">
                          {stock > 0 ? `${stock} available` : "Unavailable"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="customer-product-button"
                        disabled={stock <= 0 || isAdding}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart size={18} />

                        {isAdding
                          ? "Adding..."
                          : stock > 0
                            ? "Add to cart"
                            : "Out of stock"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="customer-trust-section">
          <div className="trust-item">
            <div className="trust-icon">
              <Droplets size={21} />
            </div>
            <div>
              <strong>Quality Water</strong>
              <span>Clean and reliable drinking water</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <Truck size={21} />
            </div>
            <div>
              <strong>Doorstep Delivery</strong>
              <span>Get your order delivered to you</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <strong>Easy Ordering</strong>
              <span>Order, pay and track in one place</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="customer-footer">
        <div>
          <strong>
            <Droplets size={17} />
            WaterFlow
          </strong>
          <span>Water delivery made simple.</span>
        </div>

        <span>© 2026 WaterFlow</span>
      </footer>
    </div>
  );
}

export default Products;
