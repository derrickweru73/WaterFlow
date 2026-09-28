import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield, LogOut, ArrowLeft } from "lucide-react";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";
import "./CustomerProfile.css";

function CustomerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/auth/protected/");
        setProfile(response.data);
      } catch (err) {
        console.error("Profile error:", err);
        setError("Unable to load your profile.");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");

        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/");
  };

  if (loading) {
    return (
      <>
        <CustomerHeader />

        <main className="customer-profile-page">
          <div className="customer-profile-loading">
            <p>Loading your profile...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CustomerHeader />

        <main className="customer-profile-page">
          <div className="customer-profile-error">
            <p>{error}</p>

            <button type="button" onClick={() => navigate("/products")}>
              Back to Products
            </button>
          </div>
        </main>
      </>
    );
  }

  const username =
    profile?.username || localStorage.getItem("username") || "Customer";

  const email = profile?.email || "Not provided";
  const phone = profile?.phone_number || "Not provided";
  const role = profile?.role || "CUSTOMER";

  return (
    <>
      <CustomerHeader />

      <main className="customer-profile-page">
        <div className="customer-profile-container">
          <button
            type="button"
            className="customer-profile-back"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft size={17} />
            Back to Products
          </button>

          <section className="customer-profile-card">
            <div className="customer-profile-header">
              <div className="customer-profile-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1>My Profile</h1>
                <p>Manage and view your WaterFlow account information.</p>
              </div>
            </div>

            <div className="customer-profile-details">
              <div className="customer-profile-detail">
                <div className="customer-profile-detail-icon">
                  <User size={19} />
                </div>

                <div>
                  <span>Username</span>
                  <strong>{username}</strong>
                </div>
              </div>

              <div className="customer-profile-detail">
                <div className="customer-profile-detail-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <span>Email Address</span>
                  <strong>{email}</strong>
                </div>
              </div>

              <div className="customer-profile-detail">
                <div className="customer-profile-detail-icon">
                  <Phone size={19} />
                </div>

                <div>
                  <span>Phone Number</span>
                  <strong>{phone}</strong>
                </div>
              </div>

              <div className="customer-profile-detail">
                <div className="customer-profile-detail-icon">
                  <Shield size={19} />
                </div>

                <div>
                  <span>Account Type</span>
                  <strong>{role}</strong>
                </div>
              </div>
            </div>

            <div className="customer-profile-actions">
              <button
                type="button"
                className="customer-profile-logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default CustomerProfile;
 