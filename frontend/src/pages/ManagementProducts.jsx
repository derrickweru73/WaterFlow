import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Boxes,
  Truck,
  Users,
  UserRoundCog,
  Bell,
  BarChart3,
  Repeat,
  LogOut,
  Menu,
  MapPin,
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementProducts.css";

function ManagementProducts() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_active: true,
  });

  const menuItems = [
    ["Dashboard", LayoutDashboard, "/management/dashboard"],
    ["Products", Package, "/management/products"],
    ["Delivery Zones", MapPin, "/management/delivery-zones"],
    ["Orders", ShoppingCart, "/management/orders"],
    ["Payments", CreditCard, "/management/payments"],
    ["Inventory", Boxes, "/management/inventory"],
    ["Deliveries", Truck, "/management/deliveries"],
    ["Customers", Users, "/management/customers"],
    ["Drivers", UserRoundCog, "/management/drivers"],
    ["Notifications", Bell, "/management/notifications"],
    ["Reports", BarChart3, "/management/reports"],
    ["Subscriptions", Repeat, "/management/subscriptions"],
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/products/"),
        api.get("/categories/"),
      ]);

      const productsData = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data.results || [];

      const categoriesData = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : categoriesResponse.data.results || [];

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Product loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profile = await api.get("/auth/protected/");

        if (
          String(profile.data.role || "")
            .trim()
            .toUpperCase() !== "MANAGEMENT"
        ) {
          navigate("/products");
          return;
        }

        setUsername(profile.data.username || "admin");

        await loadData();
      } catch (err) {
        console.error("Management authentication error:", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name || "";
      const category = product.category?.name || "";

      return (
        name.toLowerCase().includes(value) ||
        category.toLowerCase().includes(value)
      );
    });
  }, [products, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/products");
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      description: "",
      price: "",
      category_id: "",
      is_active: true,
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category_id: product.category?.id ? String(product.category.id) : "",
      is_active: product.is_active !== false,
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingProduct(null);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      setSaving(false);
      return;
    }

    if (!form.category_id) {
      setError("Please select a category.");
      setSaving(false);
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category_id: Number(form.category_id),
      is_active: form.is_active,
    };

    try {
      if (editingProduct) {
        await api.patch(`/management/products/${editingProduct.id}/`, payload);

        setMessage("Product updated successfully.");
      } else {
        await api.post("/management/products/", payload);

        setMessage("Product added successfully.");
      }

      setShowModal(false);
      setEditingProduct(null);

      setForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        is_active: true,
      });

      await loadData();
    } catch (err) {
      console.error("Product save error:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find((item) => item);

        setError(firstError || "Unable to save product.");
      } else {
        setError("Unable to save product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/management/products/${product.id}/delete/`);

      setMessage("Product deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("Product delete error:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find((item) => item);

        setError(firstError || "Unable to delete product.");
      } else {
        setError("Unable to delete product. Please try again.");
      }
    }
  };

  const formatAmount = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <div className="management-layout">
      <aside
        className={`management-sidebar ${
          sidebarOpen ? "management-sidebar-open" : ""
        }`}
      >
        <div className="management-brand">
          <div className="management-brand-icon">W</div>

          <div>
            <h1>WaterFlow</h1>
            <span>Management</span>
          </div>

          <button
            type="button"
            className="management-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="management-nav">
          <p className="management-nav-title">MAIN MENU</p>

          {menuItems.map(([label, Icon, path]) => (
            <button
              key={label}
              type="button"
              className={`management-nav-item ${
                label === "Products" ? "management-nav-active" : ""
              }`}
              onClick={() => handleNavigation(path)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            className="management-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="management-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="management-main">
        <header className="management-topbar">
          <div className="management-topbar-left">
            <button
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="management-page-label">Management Panel</p>
              <h2>Products</h2>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">
                {username ? username.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="management-user-info">
                <strong>{username || "admin"}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="management-content">
          <div className="management-welcome">
            <div>
              <p>
                Manage WaterFlow products, pricing, categories and availability.
              </p>
            </div>

            <div className="products-header-actions">
              <button
                type="button"
                className="products-add-button"
                onClick={openAddModal}
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          {message && (
            <div className="products-message products-success">{message}</div>
          )}

          {error && !showModal && (
            <div className="products-message products-error">{error}</div>
          )}

          <section className="management-panel-card">
            <div className="products-section-header">
              <div>
                <h3>Products</h3>
                <p>
                  {filteredProducts.length} product
                  {filteredProducts.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="products-search">
                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="management-empty-table">
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="management-empty-table">
                <Package size={32} />
                <h4>No products found</h4>
                <p>Click "Add Product" to add your first product.</p>
              </div>
            ) : (
              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Inventory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => {
                      const inventoryQuantity =
                        product.inventory?.quantity ?? 0;

                      return (
                        <tr key={product.id}>
                          <td>#{product.id}</td>

                          <td className="products-product-name">
                            <strong>{product.name}</strong>

                            {product.description && (
                              <span>{product.description}</span>
                            )}
                          </td>

                          <td>{product.category?.name || "Uncategorized"}</td>

                          <td className="products-price">
                            {formatAmount(product.price)}
                          </td>

                          <td className="products-inventory">
                            {inventoryQuantity}
                          </td>

                          <td>
                            <span
                              className={`products-status ${
                                product.is_active
                                  ? "products-active"
                                  : "products-inactive"
                              }`}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td>
                            <div className="products-actions">
                              <button
                                type="button"
                                className="products-edit-button"
                                onClick={() => openEditModal(product)}
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="products-delete-button"
                                onClick={() => handleDelete(product)}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {showModal && (
        <div className="products-modal-overlay">
          <div className="products-modal">
            <div className="products-modal-header">
              <div>
                <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

                <p>
                  {editingProduct
                    ? "Update the product information."
                    : "Add a new WaterFlow product."}
                </p>
              </div>

              <button
                type="button"
                className="products-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="products-form-group">
                <label htmlFor="product-name">Product Name</label>

                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. 20L Water Refill"
                  disabled={saving}
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="product-description">Description</label>

                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the product..."
                  rows="3"
                  disabled={saving}
                />
              </div>

              <div className="products-form-row">
                <div className="products-form-group">
                  <label htmlFor="product-category">Category</label>

                  <select
                    id="product-category"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="products-form-group">
                  <label htmlFor="product-price">Price</label>

                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="150"
                    disabled={saving}
                  />
                </div>
              </div>

              <label className="products-checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  disabled={saving}
                />

                <span>
                  <strong>Product is active</strong>
                  <small>Active products can be displayed to customers.</small>
                </span>
              </label>

              {error && <div className="products-modal-error">{error}</div>}

              <div className="products-modal-actions">
                <button
                  type="button"
                  className="products-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="products-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementProducts;
