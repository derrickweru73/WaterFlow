import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoundCog } from "lucide-react";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementDashboard.css";

function ManagementDrivers() {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/management/drivers/");

      setDrivers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Drivers error:", error);
      setMessage("Unable to load drivers.");
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

        await loadDrivers();
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  return (
    <ManagementLayout title="Drivers">
      <div className="management-welcome">
        <div>
          <p>View WaterFlow delivery drivers.</p>
        </div>
      </div>

      {message && <div style={messageStyle}>{message}</div>}

      <section className="management-panel-card">
        {loading ? (
          <div className="management-empty-table">
            <p>Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="management-empty-table">
            <UserRoundCog size={32} />
            <h4>No drivers found</h4>
            <p>Driver accounts will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                </tr>
              </thead>

              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td style={tdStyle}>#{driver.id}</td>

                    <td style={tdStyle}>
                      <strong>{driver.username || "—"}</strong>
                    </td>

                    <td style={tdStyle}>{driver.email || "—"}</td>

                    <td style={tdStyle}>
                      {driver.phone_number ||
                        driver.profile?.phone_number ||
                        "—"}
                    </td>
                  </tr>
                ))}
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
};

const messageStyle = {
  marginBottom: "18px",
  padding: "12px 15px",
  background: "#f0e7ff",
  color: "#6d28d9",
  borderRadius: "9px",
  fontSize: "13px",
};

export default ManagementDrivers;
 