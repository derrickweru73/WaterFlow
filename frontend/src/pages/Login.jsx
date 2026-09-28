import { useState } from "react";
import { Droplets } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/products";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Step 1: Log the user in
      const response = await api.post("/auth/login/", formData);

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("username", formData.username);

      // Step 2: Get the logged-in user's role
      const profileResponse = await api.get("/auth/protected/");

      const role = String(profileResponse.data.role || "")
        .trim()
        .toUpperCase();

      // Step 3: Send each type of user to the correct dashboard/page
      if (role === "MANAGEMENT") {
        navigate("/management/dashboard");
        return;
      }

      if (role === "DRIVER") {
        navigate("/driver/dashboard");
        return;
      }

      // Customers can return to the page they originally wanted
      navigate(returnTo);
    } catch (err) {
      console.error("Login error:", err);

      // If the login succeeded but fetching the profile failed,
      // remove the incomplete login session.
      if (err.response?.config?.url?.includes("/auth/protected/")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
      }

      setError(
        err.response?.data?.detail ||
          "Invalid username or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        {/* WaterFlow Branding */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Droplets size={34} strokeWidth={2} />
          </div>

          <h1>WaterFlow</h1>

          <p>Water delivery made simple.</p>
        </div>

        {/* Login Card */}
        <section className="login-card">
          <div className="login-card-header">
            <h2>Sign in</h2>
            <p>Welcome back. Enter your details to continue.</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Username</label>

              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="login-register">
            <span>Don't have an account?</span>{" "}
            <Link to="/register">Create an account</Link>
          </div>

          <div className="login-home">
            <Link to="/products">Return to Home</Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="login-footer">
          <strong>WaterFlow</strong>
          <span>© 2026</span>
        </footer>
      </div>
    </main>
  );
}

export default Login;
