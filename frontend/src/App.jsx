import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

import InfoPages from "./pages/InfoPages";
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
import CustomerProfile from "./pages/CustomerProfile";

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

function CustomerPage({ children }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />

        <Route
          path="/products"
          element={<CustomerPage><Products /></CustomerPage>}
        />

        <Route
          path="/cart"
          element={<CustomerPage><Cart /></CustomerPage>}
        />

        <Route
          path="/checkout"
          element={<CustomerPage><Checkout /></CustomerPage>}
        />

        <Route
          path="/payment"
          element={<CustomerPage><Payment /></CustomerPage>}
        />

        <Route
          path="/orders"
          element={<CustomerPage><Orders /></CustomerPage>}
        />

        <Route
          path="/profile"
          element={<CustomerPage><CustomerProfile /></CustomerPage>}
        />

        <Route
          path="/subscriptions"
          element={<CustomerPage><Subscriptions /></CustomerPage>}
        />

        <Route
          path="/notifications"
          element={<CustomerPage><Notifications /></CustomerPage>}
        />

        <Route
          path="/login"
          element={<CustomerPage><Login /></CustomerPage>}
        />

        <Route
          path="/register"
          element={<CustomerPage><Register /></CustomerPage>}
        />

        <Route
          path="/about"
          element={<CustomerPage><InfoPages /></CustomerPage>}
        />

        <Route
          path="/mission"
          element={<CustomerPage><InfoPages /></CustomerPage>}
        />

        <Route
          path="/why-waterflow"
          element={<CustomerPage><InfoPages /></CustomerPage>}
        />

        <Route
          path="/contact"
          element={<CustomerPage><InfoPages /></CustomerPage>}
        />

        <Route
          path="/help-support"
          element={<CustomerPage><InfoPages /></CustomerPage>}
        />

        <Route
          path="/driver/dashboard"
          element={<DriverDashboard />}
        />

        <Route
          path="/management/dashboard"
          element={<ManagementDashboard />}
        />

        <Route
          path="/management/products"
          element={<ManagementProducts />}
        />

        <Route
          path="/management/orders"
          element={<ManagementOrders />}
        />

        <Route
          path="/management/inventory"
          element={<ManagementInventory />}
        />

        <Route
          path="/management/deliveries"
          element={<ManagementDeliveries />}
        />

        <Route
          path="/management/drivers"
          element={<ManagementDrivers />}
        />

        <Route
          path="/management/payments"
          element={<ManagementPayments />}
        />

        <Route
          path="/management/customers"
          element={<ManagementCustomers />}
        />

        <Route
          path="/management/user-profiles"
          element={<ManagementUserProfiles />}
        />

        <Route
          path="/management/notifications"
          element={<ManagementNotifications />}
        />

        <Route
          path="/management/reports"
          element={<ManagementReports />}
        />

        <Route
          path="/management/subscriptions"
          element={<ManagementSubscriptions />}
        />

        <Route
          path="/management/delivery-zones"
          element={<ManagementDeliveryZones />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
 