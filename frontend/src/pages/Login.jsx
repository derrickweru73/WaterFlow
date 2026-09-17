import { useState } from "react";
import api from "../services/api";

function Login() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

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

  setMessage("Login successful!");
} catch (error) {
  console.error(error);
  setMessage("Login failed. Check your username and password.");
} finally {
  setLoading(false);
}
 
};

return (
  <div className="login-page">
    {" "}
    <div className="login-card">
      {" "}
      <div className="login-header">
        {" "}
        <h1>WaterFlow</h1> <p>Water Delivery & Refill Management System</p>{" "}
      </div>
      <div className="login-content">
        <h2>Sign in</h2>

        <p className="login-subtitle">
          Welcome back. Enter your details to continue.
        </p>

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

        {message && <p className="login-message">{message}</p>}

        <p className="register-text">
          Don't have an account?{" "}
          <a href="/register" className="register-link">
            Register
          </a>
        </p>
      </div>
    </div>
  </div>
);
}

export default Login;
