import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscriptions from "./pages/Subscriptions";
import DriverDashboard from "./pages/DriverDashboard";

import ManagementDashboard from "./pages/ManagementDashboard";
import ManagementProducts from "./pages/ManagementProducts";
import ManagementOrders from "./pages/ManagementOrders";
import ManagementInventory from "./pages/ManagementInventory";
import ManagementDeliveries from "./pages/ManagementDeliveries";
import ManagementDrivers from "./pages/ManagementDrivers";
import ManagementPayments from "./pages/ManagementPayments";
import ManagementCustomers from "./pages/ManagementCustomers";
import ManagementNotifications from "./pages/ManagementNotifications";
import ManagementReports from "./pages/ManagementReports";
import ManagementSubscriptions from "./pages/ManagementSubscriptions";
import ManagementDeliveryZones from "./pages/ManagementDeliveryZones";
import ManagementUserProfiles from "./pages/ManagementUserProfiles";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/management/delivery-zones"
          element={<ManagementDeliveryZones />}
        />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Driver routes */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />

        {/* Management routes */}
        <Route path="/management/dashboard" element={<ManagementDashboard />} />

        <Route path="/management/products" element={<ManagementProducts />} />

        <Route path="/management/orders" element={<ManagementOrders />} />

        <Route path="/management/inventory" element={<ManagementInventory />} />

        <Route
          path="/management/deliveries"
          element={<ManagementDeliveries />}
        />

        <Route path="/management/drivers" element={<ManagementDrivers />} />

        <Route path="/management/payments" element={<ManagementPayments />} />

        <Route path="/management/customers" element={<ManagementCustomers />} />

        <Route
          path="/management/user-profiles"
          element={<ManagementUserProfiles />}
        />

        <Route
          path="/management/notifications"
          element={<ManagementNotifications />}
        />

        <Route path="/management/reports" element={<ManagementReports />} />

        <Route
          path="/management/subscriptions"
          element={<ManagementSubscriptions />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
