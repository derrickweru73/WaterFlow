import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";

const GUEST_CART_KEY = "waterflow_guest_cart";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.returnTo || "/products";
  const incomingMessage = location.state?.message || "";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(incomingMessage);
  const [loading, setLoading] = useState(false);

  const mergeGuestCart = async () => {
    const guestCart = JSON.parse(
      localStorage.getItem(GUEST_CART_KEY) || "[]",
    );

    if (!guestCart.length) {
      return;
    }

    const cartResponse = await api.get("/cart/");
    const currentCart = cartResponse.data;

    for (const guestItem of guestCart) {
      const existingItem = currentCart.items?.find(
        (item) => item.product === guestItem.product,
      );

      if (existingItem) {
        await api.patch(`/cart/items/${existingItem.id}/`, {
          quantity:
            Number(existingItem.quantity) + Number(guestItem.quantity),
        });
      } else {
        await api.post("/cart/items/", {
          product: guestItem.product,
          quantity: guestItem.quantity,
        });
      }
    }

    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const profileResponse = await api.get("/auth/protected/");
      const role = profileResponse.data.role;

      if (role === "DRIVER") {
        navigate("/driver/dashboard");
        return;
      }

      if (role === "MANAGEMENT") {
        navigate("/products", {
          state: {
            message: `Welcome back, ${username}! You are now signed in.`,
          },
        });
        return;
      }

      await mergeGuestCart();

      navigate(returnTo, {
        state: {
          message: `Welcome back, ${username}! You are now signed in.`,
        },
      });
    } catch (error) {
      console.error(error);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setMessage("Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>WaterFlow</h1>
          <p>Water Delivery & Refill Management System</p>
        </div>

        <div className="login-content">
          <button
            type="button"
            className="header-return-button"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft size={18} />
            <span>Return to Home</span>
          </button>

          <h2>Sign in</h2>

          <p className="login-subtitle">
            Welcome back. Enter your details to continue.
          </p>

          {returnTo === "/checkout" && (
            <p className="login-subtitle">
              Sign in to continue with your order.
            </p>
          )}

          {message && <p className="login-message">{message}</p>}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <Link
              to="/register"
              state={{ returnTo }}
              className="register-link"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
 