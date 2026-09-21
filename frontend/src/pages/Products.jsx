import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

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

        localStorage.setItem(
          GUEST_CART_KEY,
          JSON.stringify(existingCart),
        );

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
    <div className="products-page">
      <div className="products-container">
        <CustomerHeader showLogout={true} />

        {message && (
          <div className="products-notification">
            {message}
          </div>
        )}

        <section className="products-intro">
          <h2>Available Products</h2>
          <p>Choose the water refill product you need.</p>
        </section>

        {loading && (
          <p className="products-message">
            Loading products...
          </p>
        )}

        {!loading && products.length === 0 && !message && (
          <p className="products-message">
            No products are currently available.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => {
              const stock =
                product.inventory?.quantity ??
                product.inventory_quantity ??
                product.stock ??
                0;

              return (
                <div
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-card-content">
                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <p className="product-price">
                      KSh{" "}
                      {Number(product.price).toLocaleString()}
                    </p>

                    <p className="product-stock">
                      {stock > 0
                        ? `${stock} available`
                        : "Out of stock"}
                    </p>

                    <button
                      type="button"
                      className="product-button"
                      disabled={
                        stock <= 0 ||
                        addingProduct === product.id
                      }
                      onClick={() =>
                        handleAddToCart(product)
                      }
                    >
                      {addingProduct === product.id
                        ? "Adding..."
                        : stock > 0
                          ? "Add to cart"
                          : "Out of stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
  