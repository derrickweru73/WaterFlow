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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">WaterFlow</h1>
            <p className="text-sm text-blue-100">Driver Dashboard</p>
          </div>

          <button
            onClick={logout}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Deliveries</h2>
          <p className="text-gray-600 mt-1">
            View and manage deliveries assigned to you.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600">Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              No deliveries assigned
            </h3>
            <p className="text-gray-500 mt-2">
              You currently have no deliveries assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Delivery #{delivery.id}
                    </h3>

                    <p className="text-gray-600">Order #{delivery.order_id}</p>
                  </div>

                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      delivery.status === "ASSIGNED"
                        ? "bg-yellow-100 text-yellow-800"
                        : delivery.status === "OUT_FOR_DELIVERY"
                          ? "bg-blue-100 text-blue-800"
                          : delivery.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {delivery.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-800">
                      {delivery.customer_username}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-semibold text-gray-800">
                      {delivery.delivery_address}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="font-semibold text-gray-800">
                      {delivery.latitude || "Not available"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="font-semibold text-gray-800">
                      {delivery.longitude || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {delivery.status === "ASSIGNED" && (
                    <button
                      onClick={() =>
                        updateStatus(delivery.id, "OUT_FOR_DELIVERY")
                      }
                      disabled={updatingId === delivery.id}
                      className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Start Delivery"}
                    </button>
                  )}

                  {delivery.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => updateStatus(delivery.id, "DELIVERED")}
                      disabled={updatingId === delivery.id}
                      className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Mark as Delivered"}
                    </button>
                  )}

                  {(delivery.status === "ASSIGNED" ||
                    delivery.status === "OUT_FOR_DELIVERY") && (
                    <button
                      onClick={() => updateStatus(delivery.id, "FAILED")}
                      disabled={updatingId === delivery.id}
                      className="bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {updatingId === delivery.id
                        ? "Updating..."
                        : "Delivery Failed"}
                    </button>
                  )}

                  {delivery.latitude && delivery.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-900"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DriverDashboard;
