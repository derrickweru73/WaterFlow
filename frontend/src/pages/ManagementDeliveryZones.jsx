import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementDeliveryZones.css";

function ManagementDeliveryZones() {
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    area: "",
    delivery_fee: "",
    is_active: true,
  });

  const loadZones = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/management/delivery-zones/");

      setZones(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Delivery zones error:", err);
      setError("Unable to load delivery zones.");
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

        await loadZones();
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const resetForm = () => {
    setFormData({
      name: "",
      area: "",
      delivery_fee: "",
      is_active: true,
    });

    setEditingZone(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setMessage("");
    setError("");

    setFormData({
      name: "",
      area: "",
      delivery_fee: "",
      is_active: true,
    });

    setEditingZone(null);
    setShowForm(true);
  };

  const openEditForm = (zone) => {
    setMessage("");
    setError("");

    setFormData({
      name: zone.name || "",
      area: zone.area || "",
      delivery_fee: zone.delivery_fee ?? "",
      is_active: zone.is_active !== false,
    });

    setEditingZone(zone);
    setShowForm(true);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Zone name is required.");
      return;
    }

    if (!formData.area.trim()) {
      setError("Area covered is required.");
      return;
    }

    if (formData.delivery_fee === "") {
      setError("Delivery fee is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: formData.name.trim(),
        area: formData.area.trim(),
        delivery_fee: Number(formData.delivery_fee),
        is_active: formData.is_active,
      };

      if (editingZone) {
        await api.patch(
          `/management/delivery-zones/${editingZone.id}/`,
          payload,
        );

        setMessage("Delivery zone updated successfully.");
      } else {
        await api.post("/management/delivery-zones/", payload);

        setMessage("Delivery zone added successfully.");
      }

      resetForm();
      await loadZones();
    } catch (err) {
      console.error("Save delivery zone error:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.area?.[0] ||
        err.response?.data?.delivery_fee?.[0];

      setError(backendMessage || "Unable to save delivery zone.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zone) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${zone.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(`/management/delivery-zones/${zone.id}/`);

      setMessage(`"${zone.name}" was deleted successfully.`);

      await loadZones();
    } catch (err) {
      console.error("Delete delivery zone error:", err);

      const backendMessage =
        err.response?.data?.detail || "Unable to delete this delivery zone.";

      setError(backendMessage);
    }
  };

  const formatFee = (fee) =>
    `KSh ${Number(fee || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <ManagementLayout title="Delivery Zones">
      <div className="management-welcome">
        <div>
          <p>Manage delivery areas and delivery fees for customers.</p>
        </div>

        <div className="delivery-zone-header-actions">
          <button
            type="button"
            className="delivery-zone-add-button"
            onClick={openAddForm}
          >
            <Plus size={15} />
            Add Delivery Zone
          </button>
        </div>
      </div>

      {message && <div className="delivery-zone-success">{message}</div>}

      {error && <div className="delivery-zone-error">{error}</div>}

      <section className="management-panel-card">
        <div className="delivery-zone-section-header">
          <div>
            <h3>Delivery Areas</h3>
            <p>
              {zones.length} {zones.length === 1 ? "zone" : "zones"} configured
            </p>
          </div>
        </div>

        {loading ? (
          <div className="management-empty-table">
            <p>Loading delivery zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="management-empty-table">
            <MapPin size={32} />
            <h4>No delivery zones found</h4>
            <p>Add your first delivery zone to get started.</p>
          </div>
        ) : (
          <div className="delivery-zone-table-wrapper">
            <table className="delivery-zone-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Area</th>
                  <th>Delivery Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td>
                      <div className="delivery-zone-name">
                        <div className="delivery-zone-icon">
                          <MapPin size={17} />
                        </div>

                        <strong>{zone.name}</strong>
                      </div>
                    </td>

                    <td>{zone.area || "—"}</td>

                    <td className="delivery-zone-fee">
                      {formatFee(zone.delivery_fee)}
                    </td>

                    <td>
                      <span
                        className={`delivery-zone-status ${
                          zone.is_active ? "active" : "inactive"
                        }`}
                      >
                        {zone.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="delivery-zone-actions">
                        <button
                          type="button"
                          title="Edit"
                          className="delivery-zone-action edit"
                          onClick={() => openEditForm(zone)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          className="delivery-zone-action delete"
                          onClick={() => handleDelete(zone)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div className="delivery-zone-modal-overlay">
          <div className="delivery-zone-modal">
            <div className="delivery-zone-modal-header">
              <div>
                <h2>
                  {editingZone ? "Edit Delivery Zone" : "Add Delivery Zone"}
                </h2>

                <p>Enter the area and delivery fee for this zone.</p>
              </div>

              <button
                type="button"
                className="delivery-zone-modal-close"
                onClick={resetForm}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="delivery-zone-field">
                <label htmlFor="zone-name">Zone Name</label>

                <input
                  id="zone-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Nairobi CBD"
                />
              </div>

              <div className="delivery-zone-field">
                <label htmlFor="zone-area">Area Covered</label>

                <input
                  id="zone-area"
                  name="area"
                  type="text"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g. Nairobi CBD"
                />
              </div>

              <div className="delivery-zone-field">
                <label htmlFor="zone-fee">Delivery Fee (KSh)</label>

                <input
                  id="zone-fee"
                  name="delivery_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <label className="delivery-zone-checkbox">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />

                <span>Active zone</span>
              </label>

              <div className="delivery-zone-modal-actions">
                <button
                  type="button"
                  className="delivery-zone-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="delivery-zone-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingZone
                      ? "Save Changes"
                      : "Add Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagementLayout>
  );
}

export default ManagementDeliveryZones;
 