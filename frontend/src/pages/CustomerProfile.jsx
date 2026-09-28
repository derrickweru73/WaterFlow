import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  ArrowLeft,
  Pencil,
  Save,
  X,
} from "lucide-react";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";
import "./CustomerProfile.css";

function CustomerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        /*
         * Use the existing protected endpoint to load the profile.
         * This endpoint is already working in the deployed backend.
         */
        const response = await api.get("/auth/protected/");

        const username = response.data.username || "";
        const role = response.data.role || "CUSTOMER";

        /*
         * The protected endpoint does not provide email/phone,
         * so keep those fields empty until the editable profile
         * endpoint is available.
         */
        setProfile({
          username,
          email: "",
          phone_number: "",
          role,
        });

        setFormData({
          username,
          email: "",
          phone_number: "",
        });

        /*
         * Try to load the full profile information.
         * If the endpoint is not deployed yet, the basic profile
         * above will still remain visible.
         */
        try {
          const profileResponse = await api.get("/auth/profile/");

          setProfile(profileResponse.data);

          setFormData({
            username: profileResponse.data.username || "",
            email: profileResponse.data.email || "",
            phone_number: profileResponse.data.phone_number || "",
          });
        } catch (profileError) {
          console.warn(
            "Full profile endpoint not available yet:",
            profileError,
          );
        }
      } catch (err) {
        console.error("Profile error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("username");

          navigate("/login");
          return;
        }

        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setFormData({
      username: profile?.username || "",
      email: profile?.email || "",
      phone_number: profile?.phone_number || "",
    });

    setEditing(true);
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setFormData({
      username: profile?.username || "",
      email: profile?.email || "",
      phone_number: profile?.phone_number || "",
    });

    setEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/auth/profile/", formData);

      setProfile(response.data);

      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        phone_number: response.data.phone_number || "",
      });

      localStorage.setItem(
        "username",
        response.data.username || "",
      );

      setEditing(false);
      setSuccess("Your profile has been updated successfully.");

      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.error("Profile update error:", err);

      const message =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.phone_number?.[0] ||
        err.response?.data?.detail ||
        "Unable to update your profile.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

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

  if (error && !profile) {
    return (
      <>
        <CustomerHeader />

        <main className="customer-profile-page">
          <div className="customer-profile-error">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => navigate("/products")}
            >
              Back to Products
            </button>
          </div>
        </main>
      </>
    );
  }

  const username = profile?.username || "Customer";
  const email = profile?.email || "";
  const phone = profile?.phone_number || "";
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

              <div className="customer-profile-header-text">
                <h1>My Profile</h1>

                <p>
                  Manage and view your WaterFlow account information.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="customer-profile-edit"
                  onClick={handleEdit}
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            {success && (
              <div className="customer-profile-success">
                {success}
              </div>
            )}

            {error && (
              <div className="customer-profile-form-error">
                {error}
              </div>
            )}

            {editing ? (
              <form
                className="customer-profile-form"
                onSubmit={handleSave}
              >
                <div className="customer-profile-form-group">
                  <label htmlFor="username">
                    Username
                  </label>

                  <div className="customer-profile-input-wrapper">
                    <User size={18} />

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="customer-profile-form-group">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="customer-profile-input-wrapper">
                    <Mail size={18} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="customer-profile-form-group">
                  <label htmlFor="phone_number">
                    Phone Number
                  </label>

                  <div className="customer-profile-input-wrapper">
                    <Phone size={18} />

                    <input
                      id="phone_number"
                      name="phone_number"
                      type="text"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="e.g. 0712345678"
                    />
                  </div>
                </div>

                <div className="customer-profile-form-group">
                  <label>Account Type</label>

                  <div className="customer-profile-readonly">
                    <Shield size={18} />
                    <span>{role}</span>
                  </div>

                  <small>
                    Account type cannot be changed.
                  </small>
                </div>

                <div className="customer-profile-form-actions">
                  <button
                    type="button"
                    className="customer-profile-cancel"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="customer-profile-save"
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <>
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
                      <strong>
                        {email || "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="customer-profile-detail">
                    <div className="customer-profile-detail-icon">
                      <Phone size={19} />
                    </div>

                    <div>
                      <span>Phone Number</span>
                      <strong>
                        {phone || "Not provided"}
                      </strong>
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
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default CustomerProfile;
 