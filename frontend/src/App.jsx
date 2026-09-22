import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import DriverDashboard from "./pages/DriverDashboard";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import ManagementDashboard from "./pages/ManagementDashboard";
import ManagementProducts from "./pages/ManagementProducts";
function ManagementPage({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>{title}</h1>

      <p style={{ color: "#64748b" }}>
        This management section is being connected to the WaterFlow backend.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer pages */}
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Driver */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />

        {/* Management */}
        <Route path="/management/dashboard" element={<ManagementDashboard />} />

        <Route path="/management/products" element={<ManagementProducts />} />

        <Route
          path="/management/orders"
          element={<ManagementPage title="Orders Management" />}
        />

        <Route
          path="/management/payments"
          element={<ManagementPage title="Payments Management" />}
        />

        <Route
          path="/management/inventory"
          element={<ManagementPage title="Inventory Management" />}
        />

        <Route
          path="/management/deliveries"
          element={<ManagementPage title="Deliveries Management" />}
        />

        <Route
          path="/management/customers"
          element={<ManagementPage title="Customers Management" />}
        />

        <Route
          path="/management/drivers"
          element={<ManagementPage title="Drivers Management" />}
        />

        <Route
          path="/management/notifications"
          element={<ManagementPage title="Notifications Management" />}
        />

        <Route
          path="/management/reports"
          element={<ManagementPage title="Reports" />}
        />

        <Route
          path="/management/subscriptions"
          element={<ManagementPage title="Subscriptions Management" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
