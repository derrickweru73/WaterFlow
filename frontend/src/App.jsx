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
import ManagementOrders from "./pages/ManagementOrders";
import ManagementInventory from "./pages/ManagementInventory";
import ManagementDeliveries from "./pages/ManagementDeliveries";
import ManagementDrivers from "./pages/ManagementDrivers";

function ManagementPage({ title }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f5f9",
        padding: "30px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#7c3aed",
            marginBottom: "12px",
          }}
        >
          {title}
        </h1>

        <p style={{ color: "#777080" }}>
          This management section is being connected to the WaterFlow backend.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Products />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Driver Routes */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />

        {/* Management Dashboard */}
        <Route path="/management/dashboard" element={<ManagementDashboard />} />

        {/* Connected Management Pages */}
        <Route path="/management/products" element={<ManagementProducts />} />

        <Route path="/management/orders" element={<ManagementOrders />} />

        <Route path="/management/inventory" element={<ManagementInventory />} />

        <Route
          path="/management/deliveries"
          element={<ManagementDeliveries />}
        />

        <Route path="/management/drivers" element={<ManagementDrivers />} />

        {/* Remaining Management Pages */}
        <Route
          path="/management/payments"
          element={<ManagementPage title="Payments Management" />}
        />

        <Route
          path="/management/customers"
          element={<ManagementPage title="Customers Management" />}
        />

        <Route
          path="/management/notifications"
          element={<ManagementPage title="Notifications Management" />}
        />

        <Route
          path="/management/reports"
          element={<ManagementPage title="Reports Management" />}
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
