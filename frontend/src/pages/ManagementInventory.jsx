import { useEffect, useState } from "react";
import { Boxes, Plus, Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementInventory.css";

function ManagementInventory() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/inventory/");

      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Inventory error:", error);
      setError("Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get("/products/");

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Products error:", error);
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

        await Promise.all([loadInventory(), loadProducts()]);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const getProductName = (item) => {
    if (item.product_name) {
      return item.product_name;
    }

    if (item.product?.name) {
      return item.product.name;
    }

    if (typeof item.product === "string") {
      return item.product;
    }

    const product = products.find(
      (productItem) => productItem.id === item.product,
    );

    return product?.name || product?.product_name || `Product #${item.product}`;
  };

  const openAddModal = () => {
    setEditingItem(null);
    setProductId("");
    setQuantity("");
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setProductId(item.product);
    setQuantity(item.quantity ?? 0);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingItem(null);
    setProductId("");
    setQuantity("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!editingItem && !productId) {
      setError("Please select a product.");
      return;
    }

    if (quantity === "" || Number(quantity) < 0) {
      setError("Quantity must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);

      if (editingItem) {
        await api.patch(`/management/inventory/${editingItem.id}/`, {
          quantity: Number(quantity),
        });

        setMessage("Inventory updated successfully.");
      } else {
        await api.post("/management/inventory/", {
          product: Number(productId),
          quantity: Number(quantity),
        });

        setMessage("Inventory added successfully.");
      }

      setShowModal(false);
      setEditingItem(null);
      setProductId("");
      setQuantity("");

      await loadInventory();
    } catch (error) {
      console.error("Inventory save error:", error);

      const responseData = error.response?.data;

      setError(
        responseData?.detail ||
          responseData?.product?.[0] ||
          responseData?.quantity?.[0] ||
          "Unable to save inventory.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const productName = getProductName(item);

    const confirmed = window.confirm(
      `Are you sure you want to delete the inventory record for "${productName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/management/inventory/${item.id}/delete/`);

      setMessage("Inventory record deleted successfully.");

      await loadInventory();
    } catch (error) {
      console.error("Inventory delete error:", error);

      setError(
        error.response?.data?.detail || "Unable to delete inventory record.",
      );
    }
  };

  return (
    <ManagementLayout title="Inventory">
      <div className="management-welcome">
        <div>
          <p>Monitor and manage available WaterFlow stock.</p>
        </div>

        <div className="inventory-header-actions">
          <button
            type="button"
            className="inventory-add-button"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add Inventory
          </button>
        </div>
      </div>

      {message && (
        <div className="inventory-message inventory-success">{message}</div>
      )}

      {error && !showModal && (
        <div className="inventory-message inventory-error">{error}</div>
      )}

      <section className="management-panel-card">
        {loading ? (
          <div className="management-empty-table">
            <p>Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="management-empty-table">
            <Boxes size={32} />
            <h4>No inventory found</h4>
            <p>Click "Add Inventory" to add your first stock record.</p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => {
                  const quantity =
                    item.quantity ??
                    item.stock_quantity ??
                    item.available_quantity ??
                    0;

                  const numericQuantity = Number(quantity);

                  let statusText = "In Stock";
                  let statusClass = "inventory-stock";

                  if (numericQuantity === 0) {
                    statusText = "Out of Stock";
                    statusClass = "inventory-out";
                  } else if (numericQuantity <= 10) {
                    statusText = "Low Stock";
                    statusClass = "inventory-low";
                  }

                  return (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td className="inventory-product-name">
                        <strong>{getProductName(item)}</strong>
                      </td>

                      <td className="inventory-quantity">{quantity}</td>

                      <td>
                        <span className={`inventory-status ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>

                      <td>
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <div className="inventory-actions">
                          <button
                            type="button"
                            className="inventory-edit-button"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="inventory-delete-button"
                            onClick={() => handleDelete(item)}
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

      {showModal && (
        <div className="inventory-modal-overlay">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div>
                <h2>{editingItem ? "Edit Inventory" : "Add Inventory"}</h2>

                <p>
                  {editingItem
                    ? "Update the available stock quantity."
                    : "Add stock for a WaterFlow product."}
                </p>
              </div>

              <button
                type="button"
                className="inventory-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {!editingItem ? (
                <div className="inventory-form-group">
                  <label htmlFor="inventory-product">Product</label>

                  <select
                    id="inventory-product"
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    disabled={saving}
                  >
                    <option value="">Select a product</option>

                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name ||
                          product.product_name ||
                          `Product #${product.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="inventory-selected-product">
                  <span>Product</span>
                  <strong>{getProductName(editingItem)}</strong>
                </div>
              )}

              <div className="inventory-form-group">
                <label htmlFor="inventory-quantity">Quantity</label>

                <input
                  id="inventory-quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter quantity"
                  disabled={saving}
                />
              </div>

              {error && <div className="inventory-modal-error">{error}</div>}

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                      ? "Update Inventory"
                      : "Add Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagementLayout>
  );
}

export default ManagementInventory;
