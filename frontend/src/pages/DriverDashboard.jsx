import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  LogOut,
  MapPin,
  Package,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Clock3,
  User,
  ArrowRight,
  Truck,
  RefreshCw,
} from "lucide-react";
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
        localStorage.removeItem("refresh_token");
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
    localStorage.removeItem("username");

    navigate("/");
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ASSIGNED":
        return {
          label: "Assigned",
          className: "status-assigned",
          icon: <Clock3 size={15} />,
        };

      case "OUT_FOR_DELIVERY":
        return {
          label: "Out for Delivery",
          className: "status-out",
          icon: <Truck size={15} />,
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          className: "status-delivered",
          icon: <CheckCircle2 size={15} />,
        };

      case "FAILED":
        return {
          label: "Failed",
          className: "status-failed",
          icon: <AlertCircle size={15} />,
        };

      default:
        return {
          label: formatStatus(status),
          className: "status-default",
          icon: <Package size={15} />,
        };
    }
  };

  const totalDeliveries = deliveries.length;

  const assignedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "ASSIGNED",
  ).length;

  const activeDeliveries = deliveries.filter(
    (delivery) => delivery.status === "OUT_FOR_DELIVERY",
  ).length;

  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === "DELIVERED",
  ).length;

  return (
    <div className="driver-dashboard-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .driver-dashboard-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 30%),
            #f7fafc;
          color: #172033;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .driver-dashboard-page button,
        .driver-dashboard-page a {
          font: inherit;
        }

        .driver-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #e8edf3;
        }

        .driver-topbar-inner {
          width: min(1180px, calc(100% - 40px));
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .driver-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #172033;
        }

        .driver-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #e8f7ff;
          color: #0891b2;
        }

        .driver-brand-copy {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .driver-brand-copy strong {
          font-size: 18px;
          letter-spacing: -0.3px;
        }

        .driver-brand-copy span {
          margin-top: 4px;
          color: #7a8798;
          font-size: 12px;
        }

        .driver-topbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .driver-role {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #f3f7fa;
          color: #526174;
          font-size: 13px;
          font-weight: 600;
        }

        .driver-logout {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #536173;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .driver-logout:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #172033;
        }

        .driver-main {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 42px 0 64px;
        }

        .driver-hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 38px 40px;
          background: linear-gradient(135deg, #083344 0%, #0e7490 58%, #0891b2 100%);
          color: white;
          box-shadow: 0 18px 45px rgba(8, 51, 68, 0.14);
        }

        .driver-hero::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          right: -80px;
          top: -100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .driver-hero-content {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }

        .driver-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 13px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .driver-hero h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.08;
          letter-spacing: -1.2px;
        }

        .driver-hero p {
          max-width: 620px;
          margin: 13px 0 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: 15px;
          line-height: 1.7;
        }

        .driver-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 24px 0 34px;
        }

        .driver-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #e7edf3;
          border-radius: 16px;
          box-shadow: 0 7px 22px rgba(15, 23, 42, 0.045);
        }

        .driver-stat-icon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #eff8fb;
          color: #087f9d;
        }

        .driver-stat-content {
          min-width: 0;
        }

        .driver-stat-content span {
          display: block;
          color: #7b8797;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .driver-stat-content strong {
          display: block;
          color: #172033;
          font-size: 23px;
          line-height: 1;
        }

        .driver-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 17px;
        }

        .driver-section-heading h2 {
          margin: 0;
          color: #172033;
          font-size: 23px;
          letter-spacing: -0.5px;
        }

        .driver-section-heading p {
          margin: 6px 0 0;
          color: #7b8797;
          font-size: 14px;
        }

        .driver-refresh {
          display: flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #dfe7ee;
          background: white;
          color: #526174;
          border-radius: 10px;
          padding: 9px 13px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .driver-refresh:hover {
          background: #f8fafc;
        }

        .driver-error {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 14px 16px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fff7f7;
          color: #b42318;
          font-size: 14px;
        }

        .driver-delivery-list {
          display: grid;
          gap: 18px;
        }

        .driver-delivery-card {
          background: white;
          border: 1px solid #e5ebf1;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.045);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .driver-delivery-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 13px 32px rgba(15, 23, 42, 0.07);
        }

        .driver-delivery-card.active-delivery {
          border-color: #a5d8e5;
        }

        .driver-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 23px 25px 19px;
          border-bottom: 1px solid #edf1f5;
        }

        .driver-order-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7a8798;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .driver-order-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #edf8fb;
          color: #087f9d;
        }

        .driver-card-title {
          margin: 12px 0 3px;
          color: #172033;
          font-size: 19px;
          letter-spacing: -0.3px;
        }

        .driver-card-order {
          margin: 0;
          color: #8a95a4;
          font-size: 13px;
        }

        .driver-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-assigned {
          background: #fff7e6;
          color: #a15c00;
        }

        .status-out {
          background: #eaf8ff;
          color: #0369a1;
        }

        .status-delivered {
          background: #ecfdf3;
          color: #087443;
        }

        .status-failed {
          background: #fff1f2;
          color: #be123c;
        }

        .status-default {
          background: #f1f5f9;
          color: #475569;
        }

        .driver-card-body {
          padding: 22px 25px;
        }

        .driver-info-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr 1fr;
          gap: 14px;
        }

        .driver-info-box {
          min-width: 0;
          padding: 15px;
          border-radius: 13px;
          background: #f8fafc;
          border: 1px solid #edf1f5;
        }

        .driver-info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 7px;
          color: #8994a4;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        .driver-info-value {
          display: block;
          color: #263246;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.45;
          word-break: break-word;
        }

        .driver-card-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 18px 25px 22px;
          background: #fbfcfd;
          border-top: 1px solid #edf1f5;
        }

        .driver-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 10px 15px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .driver-action:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .driver-start {
          background: #087f9d;
          color: white;
        }

        .driver-start:hover:not(:disabled) {
          background: #066b84;
        }

        .driver-complete {
          background: #14804a;
          color: white;
        }

        .driver-complete:hover:not(:disabled) {
          background: #0f693d;
        }

        .driver-failed {
          background: white;
          color: #be123c;
          border-color: #f3c4cd;
        }

        .driver-failed:hover:not(:disabled) {
          background: #fff6f7;
        }

        .driver-maps {
          background: white;
          color: #3b4b61;
          border-color: #dce4eb;
        }

        .driver-maps:hover {
          background: #f3f7fa;
        }

        .driver-loading,
        .driver-empty {
          padding: 60px 25px;
          text-align: center;
          background: white;
          border: 1px solid #e5ebf1;
          border-radius: 20px;
        }

        .driver-loading-icon,
        .driver-empty-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 15px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #edf8fb;
          color: #087f9d;
        }

        .driver-loading p,
        .driver-empty p {
          margin: 7px 0 0;
          color: #7b8797;
          font-size: 14px;
        }

        .driver-empty h3 {
          margin: 0;
          color: #263246;
          font-size: 19px;
        }

        .driver-empty .driver-empty-icon {
          background: #f1f5f9;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .driver-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .driver-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .driver-topbar-inner,
          .driver-main {
            width: min(100% - 24px, 1180px);
          }

          .driver-topbar-inner {
            min-height: 68px;
          }

          .driver-brand-copy span,
          .driver-role {
            display: none;
          }

          .driver-hero {
            padding: 28px 23px;
            border-radius: 19px;
          }

          .driver-stats {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .driver-stat-card {
            padding: 15px;
          }

          .driver-stat-icon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .driver-stat-content strong {
            font-size: 20px;
          }

          .driver-section-heading {
            align-items: flex-start;
          }

          .driver-refresh span {
            display: none;
          }

          .driver-card-top {
            padding: 19px;
          }

          .driver-card-body {
            padding: 17px 19px;
          }

          .driver-card-actions {
            padding: 16px 19px 19px;
          }

          .driver-info-grid {
            grid-template-columns: 1fr;
          }

          .driver-status {
            padding: 6px 8px;
            font-size: 11px;
          }

          .driver-action {
            width: 100%;
          }
        }
      `}</style>

      {/* TOP NAVIGATION */}
      <header className="driver-topbar">
        <div className="driver-topbar-inner">
          <div className="driver-brand">
            <div className="driver-brand-icon">
              <Droplets size={22} />
            </div>

            <div className="driver-brand-copy">
              <strong>WaterFlow</strong>
              <span>Water delivery made simple</span>
            </div>
          </div>

          <div className="driver-topbar-right">
            <div className="driver-role">
              <Truck size={15} />
              Driver Portal
            </div>

            <button type="button" onClick={logout} className="driver-logout">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="driver-main">
        {/* HERO */}
        <section className="driver-hero">
          <div className="driver-hero-content">
            <div className="driver-eyebrow">
              <Truck size={14} />
              Driver Dashboard
            </div>

            <h1>Ready for today's deliveries?</h1>

            <p>
              Manage your assigned orders, update delivery progress, and
              navigate directly to your customers using Google Maps.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="driver-stats">
          <div className="driver-stat-card">
            <div className="driver-stat-icon">
              <Package size={20} />
            </div>

            <div className="driver-stat-content">
              <span>Total Deliveries</span>
              <strong>{totalDeliveries}</strong>
            </div>
          </div>

          <div className="driver-stat-card">
            <div className="driver-stat-icon">
              <Clock3 size={20} />
            </div>

            <div className="driver-stat-content">
              <span>Assigned</span>
              <strong>{assignedDeliveries}</strong>
            </div>
          </div>

          <div className="driver-stat-card">
            <div className="driver-stat-icon">
              <Navigation size={20} />
            </div>

            <div className="driver-stat-content">
              <span>Out for Delivery</span>
              <strong>{activeDeliveries}</strong>
            </div>
          </div>

          <div className="driver-stat-card">
            <div className="driver-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div className="driver-stat-content">
              <span>Completed</span>
              <strong>{completedDeliveries}</strong>
            </div>
          </div>
        </section>

        {/* DELIVERY SECTION */}
        <section>
          <div className="driver-section-heading">
            <div>
              <h2>My Deliveries</h2>
              <p>View and manage the orders currently assigned to you.</p>
            </div>

            {!loading && (
              <button
                type="button"
                className="driver-refresh"
                onClick={fetchDeliveries}
              >
                <RefreshCw size={15} />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="driver-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="driver-loading">
              <div className="driver-loading-icon">
                <RefreshCw size={22} />
              </div>

              <strong>Loading your deliveries...</strong>

              <p>Please wait while we retrieve your assigned orders.</p>
            </div>
          ) : deliveries.length === 0 ? (
            /* EMPTY */
            <div className="driver-empty">
              <div className="driver-empty-icon">
                <Package size={23} />
              </div>

              <h3>No deliveries assigned</h3>

              <p>
                You currently have no deliveries assigned to you. Check again
                later.
              </p>
            </div>
          ) : (
            /* DELIVERIES */
            <div className="driver-delivery-list">
              {deliveries.map((delivery) => {
                const statusConfig = getStatusConfig(delivery.status);

                const isUpdating = updatingId === delivery.id;

                const isActive = delivery.status === "OUT_FOR_DELIVERY";

                return (
                  <article
                    key={delivery.id}
                    className={`driver-delivery-card ${
                      isActive ? "active-delivery" : ""
                    }`}
                  >
                    {/* CARD HEADER */}
                    <div className="driver-card-top">
                      <div>
                        <div className="driver-order-label">
                          <div className="driver-order-icon">
                            <Package size={17} />
                          </div>
                          Delivery #{delivery.id}
                        </div>

                        <h3 className="driver-card-title">
                          Order #{delivery.order_id}
                        </h3>

                        <p className="driver-card-order">Assigned delivery</p>
                      </div>

                      <span
                        className={`driver-status ${statusConfig.className}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* INFORMATION */}
                    <div className="driver-card-body">
                      <div className="driver-info-grid">
                        <div className="driver-info-box">
                          <div className="driver-info-label">
                            <User size={13} />
                            Customer
                          </div>

                          <strong className="driver-info-value">
                            {delivery.customer_username || "Customer"}
                          </strong>
                        </div>

                        <div className="driver-info-box">
                          <div className="driver-info-label">
                            <MapPin size={13} />
                            Delivery Address
                          </div>

                          <strong className="driver-info-value">
                            {delivery.delivery_address ||
                              "Address not available"}
                          </strong>
                        </div>

                        <div className="driver-info-box">
                          <div className="driver-info-label">Latitude</div>

                          <strong className="driver-info-value">
                            {delivery.latitude || "Not available"}
                          </strong>
                        </div>

                        <div className="driver-info-box">
                          <div className="driver-info-label">Longitude</div>

                          <strong className="driver-info-value">
                            {delivery.longitude || "Not available"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="driver-card-actions">
                      {delivery.status === "ASSIGNED" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(delivery.id, "OUT_FOR_DELIVERY")
                          }
                          disabled={isUpdating}
                          className="driver-action driver-start"
                        >
                          <Navigation size={16} />

                          {isUpdating ? "Updating..." : "Start Delivery"}

                          {!isUpdating && <ArrowRight size={15} />}
                        </button>
                      )}

                      {delivery.status === "OUT_FOR_DELIVERY" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(delivery.id, "DELIVERED")}
                          disabled={isUpdating}
                          className="driver-action driver-complete"
                        >
                          <CheckCircle2 size={16} />

                          {isUpdating ? "Updating..." : "Mark as Delivered"}
                        </button>
                      )}

                      {(delivery.status === "ASSIGNED" ||
                        delivery.status === "OUT_FOR_DELIVERY") && (
                        <button
                          type="button"
                          onClick={() => updateStatus(delivery.id, "FAILED")}
                          disabled={isUpdating}
                          className="driver-action driver-failed"
                        >
                          <AlertCircle size={16} />

                          {isUpdating ? "Updating..." : "Delivery Failed"}
                        </button>
                      )}

                      {delivery.latitude && delivery.longitude && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="driver-action driver-maps"
                        >
                          <MapPin size={16} />
                          Open in Maps
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DriverDashboard;
