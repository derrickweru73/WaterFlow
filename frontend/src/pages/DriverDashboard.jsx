import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DriverDashboard() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/driver/deliveries/");
      setDeliveries(response.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Failed to load your assigned deliveries.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const updateStatus = async (deliveryId, newStatus) => {
    try {
      setUpdatingId(deliveryId);
      setError("");

      await api.patch(`/driver/deliveries/${deliveryId}/status/`, {
        status: newStatus,
      });

      await fetchDeliveries();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.status?.[0] ||
          err.response?.data?.detail ||
          "Failed to update delivery status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "driver-status driver-status-assigned";
      case "OUT_FOR_DELIVERY":
        return "driver-status driver-status-out";
      case "DELIVERED":
        return "driver-status driver-status-delivered";
      case "FAILED":
        return "driver-status driver-status-failed";
      default:
        return "driver-status driver-status-default";
    }
  };

  return (
    <div className="driver-page">
      <div className="driver-container">
        <header className="driver-header">
          <div className="driver-header-brand">
            <h1>WaterFlow</h1>
            <p>Driver Dashboard</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="driver-logout-button"
          >
            Logout
          </button>
        </header>

        <section className="driver-intro">
          <h2>My Deliveries</h2>
          <p>
            View and manage deliveries assigned to you.
          </p>
        </section>

        {error && (
          <div className="driver-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="driver-message">
            Loading deliveries...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="driver-empty">
            <h3>No deliveries assigned</h3>
            <p>
              You currently have no deliveries assigned to you.
            </p>
          </div>
        ) : (
          <div className="driver-deliveries">
            {deliveries.map((delivery) => (
              <article
                key={delivery.id}
                className="driver-card"
              >
                <div className="driver-card-header">
                  <div>
                    <h3>
                      Delivery #{delivery.id}
                    </h3>

                    <p>
                      Order #{delivery.order_id}
                    </p>
                  </div>

                  <span className={getStatusClass(delivery.status)}>
                    {formatStatus(delivery.status)}
                  </span>
                </div>

                <div className="driver-information">
                  <div className="driver-info-item">
                    <span>Customer</span>
                    <strong>
                      {delivery.customer_username}
                    </strong>
                  </div>

                  <div className="driver-info-item driver-address">
                    <span>Delivery Address</span>
                    <strong>
                      {delivery.delivery_address}
                    </strong>
                  </div>

                  <div className="driver-info-item">
                    <span>Latitude</span>
                    <strong>
                      {delivery.latitude || "Not available"}
                    </strong>
                  </div>

                  <div className="driver-info-item">
                    <span>Longitude</span>
                    <strong>
                      {delivery.longitude || "Not available"}
                    </strong>
                  </div>
                </div>

                <div className="driver-actions">
                  {delivery.status === "ASSIGNED" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          delivery.id,
                          "OUT_FOR_DELIVERY",
                        )
                      }
                      disabled={updatingId === delivery.id}
                      className="driver-action-button driver-start-button"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Start Delivery"}
                    </button>
                  )}

                  {delivery.status === "OUT_FOR_DELIVERY" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          delivery.id,
                          "DELIVERED",
                        )
                      }
                      disabled={updatingId === delivery.id}
                      className="driver-action-button driver-complete-button"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Mark as Delivered"}
                    </button>
                  )}

                  {(delivery.status === "ASSIGNED" ||
                    delivery.status === "OUT_FOR_DELIVERY") && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          delivery.id,
                          "FAILED",
                        )
                      }
                      disabled={updatingId === delivery.id}
                      className="driver-action-button driver-failed-button"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Delivery Failed"}
                    </button>
                  )}

                  {delivery.latitude &&
                    delivery.longitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="driver-action-button driver-maps-button"
                      >
                        Open in Maps
                      </a>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverDashboard;
 