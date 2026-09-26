import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, UserPlus } from "lucide-react";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";

function ManagementDeliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [assigningDelivery, setAssigningDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/management/deliveries/");

      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Deliveries error:", error);
      setMessage("Unable to load deliveries.");
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await api.get("/management/drivers/");

      setDrivers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Drivers error:", error);
      setDrivers([]);
      setMessage("Unable to load drivers.");
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

        await Promise.all([loadDeliveries(), loadDrivers()]);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const handleDriverChange = (deliveryId, driverId) => {
    setSelectedDrivers((previous) => ({
      ...previous,
      [deliveryId]: driverId,
    }));
  };

  const handleAssignDriver = async (delivery) => {
    const driverId = selectedDrivers[delivery.id];

    if (!driverId) {
      setMessage("Please select a driver first.");
      return;
    }

    try {
      setAssigningDelivery(delivery.id);
      setMessage("");

      await api.patch(`/management/deliveries/${delivery.id}/assign/`, {
        driver_id: Number(driverId),
      });

      setMessage(`Driver assigned successfully to Delivery #${delivery.id}.`);

      await loadDeliveries();

      setSelectedDrivers((previous) => ({
        ...previous,
        [delivery.id]: "",
      }));
    } catch (error) {
      console.error("Assign driver error:", error);

      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.driver?.[0] ||
          "Unable to assign driver. Please try again.",
      );
    } finally {
      setAssigningDelivery(null);
    }
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "DELIVERED") {
      return {
        background: "#dcfce7",
        color: "#15803d",
      };
    }

    if (value === "OUT_FOR_DELIVERY") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (value === "ASSIGNED") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  const formatStatus = (status) =>
    String(status || "PENDING")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <ManagementLayout title="Deliveries">
      <div className="management-welcome">
        <div>
          <p>Monitor deliveries and assign them to drivers.</p>
        </div>
      </div>

      {message && <div style={messageStyle}>{message}</div>}

      <section className="management-panel-card">
        {loading ? (
          <div className="management-empty-table">
            <p>Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="management-empty-table">
            <Truck size={32} />
            <h4>No deliveries found</h4>
            <p>Delivery records will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Delivery</th>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>Driver</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>

              <tbody>
                {deliveries.map((delivery) => {
                  const driverName =
                    delivery.driver_username ||
                    delivery.driver_name ||
                    delivery.driver?.username;

                  const isUnassigned = !driverName;

                  return (
                    <tr key={delivery.id}>
                      <td style={tdStyle}>
                        <strong>#{delivery.id}</strong>
                      </td>

                      <td style={tdStyle}>#{delivery.order || "—"}</td>

                      <td style={tdStyle}>
                        {isUnassigned ? (
                          <div style={assignContainer}>
                            <select
                              value={selectedDrivers[delivery.id] || ""}
                              onChange={(event) =>
                                handleDriverChange(
                                  delivery.id,
                                  event.target.value,
                                )
                              }
                              style={selectStyle}
                              disabled={assigningDelivery === delivery.id}
                            >
                              <option value="">Select driver</option>

                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.username}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleAssignDriver(delivery)}
                              disabled={
                                !selectedDrivers[delivery.id] ||
                                assigningDelivery === delivery.id
                              }
                              style={assignButton}
                            >
                              <UserPlus size={14} />

                              {assigningDelivery === delivery.id
                                ? "Assigning..."
                                : "Assign"}
                            </button>
                          </div>
                        ) : (
                          <div style={assignedDriver}>
                            <div style={assignedDriverIcon}>
                              {driverName.charAt(0).toUpperCase()}
                            </div>

                            <strong>{driverName}</strong>
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>
                        {delivery.delivery_address || delivery.address || "—"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            ...statusStyle,
                            ...getStatusStyle(delivery.status),
                          }}
                        >
                          {formatStatus(delivery.status)}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {delivery.created_at
                          ? new Date(delivery.created_at).toLocaleDateString(
                              "en-KE",
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ManagementLayout>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 10px",
  borderBottom: "1px solid #ece9f1",
  color: "#777080",
  fontSize: "11px",
  fontWeight: 600,
};

const tdStyle = {
  padding: "15px 10px",
  borderBottom: "1px solid #f0edf3",
  color: "#514b5a",
  verticalAlign: "middle",
};

const statusStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 600,
};

const assignContainer = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  minWidth: "220px",
};

const selectStyle = {
  minWidth: "125px",
  padding: "8px 9px",
  border: "1px solid #ddd8e3",
  borderRadius: "8px",
  background: "#fff",
  color: "#514b5a",
  fontSize: "11px",
  outline: "none",
};

const assignButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  padding: "8px 10px",
  border: "none",
  borderRadius: "8px",
  background: "#075985",
  color: "#fff",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const assignedDriver = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const assignedDriverIcon = {
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#eaf7fb",
  color: "#075985",
  fontSize: "11px",
  fontWeight: 800,
};

const messageStyle = {
  marginBottom: "18px",
  padding: "12px 15px",
  background: "#f0e7ff",
  color: "#6d28d9",
  borderRadius: "9px",
  fontSize: "13px",
};

export default ManagementDeliveries;
