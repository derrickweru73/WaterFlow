import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setMessage("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    setAddingProduct(product.id);
    setMessage("");

    try {
      await api.post("/cart/items/", {
        product: product.id,
        quantity: 1,
      });

      setMessage(`${product.name} added to cart.`);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
        return;
      }

      setMessage(
        error.response?.data?.detail ||
          "Unable to add product to cart. Please try again.",
      );
    } finally {
      setAddingProduct(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <header className="products-header">
          <div>
            <h1>WaterFlow</h1>
            <p>Water Delivery & Refill Management System</p>
          </div>

          <div>
            <button
              className="logout-button"
              onClick={() => navigate("/cart")}
              style={{ marginRight: "10px" }}
            >
              Cart
            </button>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="products-intro">
          <h2>Available Products</h2>
          <p>Choose the water refill product you need.</p>
        </section>

        {loading && <p className="products-message">Loading products...</p>}

        {message && <p className="products-message">{message}</p>}

        {!loading && !message && (
          <div className="products-grid">
            {products.map((product) => {
              const stock = product.inventory?.quantity || 0;

              return (
                <div className="product-card" key={product.id}>
                  <div className="product-card-content">
                    <h3>{product.name}</h3>

                    <p className="product-description">{product.description}</p>

                    <p className="product-price">
                      KSh {Number(product.price).toLocaleString()}
                    </p>

                    <p className="product-stock">
                      {stock > 0 ? `${stock} available` : "Out of stock"}
                    </p>

                    <button
                      className="product-button"
                      disabled={stock <= 0 || addingProduct === product.id}
                      onClick={() => handleAddToCart(product)}
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
