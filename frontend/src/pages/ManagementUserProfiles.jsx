import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Boxes,
  Truck,
  Users,
  UserRoundCog,
  Bell,
  BarChart3,
  Repeat,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Pencil,
} from "lucide-react";
import api from "../services/api";
import "./ManagementDashboard.css";
import "./ManagementUserProfiles.css";

function ManagementUserProfiles() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const menuItems = [
    ["Dashboard", LayoutDashboard, "/management/dashboard"],
    ["Products", Package, "/management/products"],
    ["Orders", ShoppingCart, "/management/orders"],
    ["Payments", CreditCard, "/management/payments"],
    ["Inventory", Boxes, "/management/inventory"],
    ["Deliveries", Truck, "/management/deliveries"],
    ["Customers", Users, "/management/customers"],
    ["Drivers", UserRoundCog, "/management/drivers"],
    ["User Profiles", Users, "/management/user-profiles"],
    ["Notifications", Bell, "/management/notifications"],
    ["Reports", BarChart3, "/management/reports"],
    ["Subscriptions", Repeat, "/management/subscriptions"],
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/management/users/");

      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("User profiles error:", error);

      if (error.response?.status === 403) {
        setError("You do not have permission to view user profiles.");
      } else {
        setError("Unable to load user profiles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profile = await api.get("/auth/protected/");

        if (
          String(profile.data.role || "")
            .trim()
            .toUpperCase() !== "MANAGEMENT"
        ) {
          navigate("/products");
          return;
        }

        setUsername(profile.data.username || "");

        await loadUsers();
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/products");
  };

  const handleNavigation = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  const openEditModal = (user) => {
    if (
      String(user.username).toLowerCase() === String(username).toLowerCase()
    ) {
      setError("You cannot change your own role.");
      return;
    }

    setEditingUser(user);
    setSelectedRole(user.role || "CUSTOMER");
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setSelectedRole("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.patch(`/auth/management/users/${editingUser.id}/`, {
        role: selectedRole,
      });

      setMessage(`Role for ${editingUser.username} updated successfully.`);

      setShowModal(false);
      setEditingUser(null);
      setSelectedRole("");

      await loadUsers();
    } catch (error) {
      console.error("Role update error:", error);

      setError(
        error.response?.data?.detail ||
          error.response?.data?.role?.[0] ||
          "Unable to update user role.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getRoleClass = (role) => {
    if (role === "MANAGEMENT") {
      return "user-profile-role-management";
    }

    if (role === "DRIVER") {
      return "user-profile-role-driver";
    }

    return "user-profile-role-customer";
  };

  const getRoleLabel = (role) => {
    if (role === "MANAGEMENT") {
      return "Management";
    }

    if (role === "DRIVER") {
      return "Driver";
    }

    return "Customer";
  };

  return (
    <div className="management-layout">
      <aside
        className={`management-sidebar ${
          sidebarOpen ? "management-sidebar-open" : ""
        }`}
      >
        <div className="management-brand">
          <div className="management-brand-icon">W</div>

          <div>
            <h1>WaterFlow</h1>
            <span>Management</span>
          </div>

          <button
            type="button"
            className="management-mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="management-nav">
          <p className="management-nav-title">MAIN MENU</p>

          {menuItems.map(([label, Icon, path]) => (
            <button
              key={label}
              type="button"
              className={`management-nav-item ${
                label === "User Profiles" ? "management-nav-active" : ""
              }`}
              onClick={() => handleNavigation(path)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="management-sidebar-bottom">
          <button
            type="button"
            className="management-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="management-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="management-main">
        <header className="management-topbar">
          <div className="management-topbar-left">
            <button
              type="button"
              className="management-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="management-page-label">Management Panel</p>
              <h2>User Profiles</h2>
            </div>
          </div>

          <div className="management-topbar-right">
            <div className="management-user">
              <div className="management-avatar">
                {username ? username.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="management-user-info">
                <strong>{username || "admin"}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="management-content">
          <div className="management-welcome">
            <div>
              <p>Manage WaterFlow users and assign their system roles.</p>
            </div>

            <div className="user-profiles-header-actions">
              <button
                type="button"
                className="user-profiles-refresh-button"
                onClick={loadUsers}
                disabled={loading}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>

          {message && (
            <div className="user-profiles-message user-profiles-success">
              {message}
            </div>
          )}

          {error && !showModal && (
            <div className="user-profiles-message user-profiles-error">
              {error}
            </div>
          )}

          <section className="management-panel-card">
            {loading ? (
              <div className="management-empty-table">
                <p>Loading user profiles...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="management-empty-table">
                <Users size={32} />
                <h4>No user profiles found</h4>
                <p>Registered WaterFlow users will appear here.</p>
              </div>
            ) : (
              <div className="user-profiles-table-wrapper">
                <table className="user-profiles-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const isCurrentUser =
                        String(user.username).toLowerCase() ===
                        String(username).toLowerCase();

                      return (
                        <tr key={user.id}>
                          <td>#{user.id}</td>

                          <td className="user-profile-username">
                            <strong>{user.username}</strong>
                          </td>

                          <td>{user.email || "—"}</td>

                          <td>{user.phone_number || "—"}</td>

                          <td>
                            <span
                              className={`user-profile-role ${getRoleClass(
                                user.role,
                              )}`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`user-profile-status ${
                                user.is_active
                                  ? "user-profile-active"
                                  : "user-profile-inactive"
                              }`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td>
                            <div className="user-profiles-actions">
                              <button
                                type="button"
                                className="user-profile-edit-button"
                                onClick={() => openEditModal(user)}
                                disabled={isCurrentUser}
                                title={
                                  isCurrentUser
                                    ? "You cannot change your own role."
                                    : "Change user role"
                                }
                              >
                                <Pencil size={14} />
                                Change Role
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {showModal && (
        <div className="user-profiles-modal-overlay">
          <div className="user-profiles-modal">
            <div className="user-profiles-modal-header">
              <div>
                <h2>Change User Role</h2>

                <p>Update the system role assigned to this user.</p>
              </div>

              <button
                type="button"
                className="user-profiles-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="user-profiles-selected-user">
                <span>Username</span>
                <strong>{editingUser?.username || "—"}</strong>
              </div>

              <div className="user-profiles-form-group">
                <label htmlFor="user-profile-role">Role</label>

                <select
                  id="user-profile-role"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  disabled={saving}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="DRIVER">Driver</option>
                  <option value="MANAGEMENT">Management</option>
                </select>
              </div>

              {error && (
                <div className="user-profiles-modal-error">{error}</div>
              )}

              <div className="user-profiles-modal-actions">
                <button
                  type="button"
                  className="user-profiles-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="user-profiles-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementUserProfiles;
