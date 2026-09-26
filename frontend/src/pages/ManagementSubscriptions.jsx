import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Repeat, Search, Pause, Play, Ban } from "lucide-react";
import api from "../services/api";
import ManagementLayout from "../components/ManagementLayout";
import "./ManagementSubscriptions.css";

function ManagementSubscriptions() {
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/subscriptions/management/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load subscriptions.");
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

        await loadSubscriptions();
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    loadPage();
  }, [navigate]);

  const getCustomerName = (subscription) => {
    return (
      subscription.customer_username ||
      subscription.customer_name ||
      subscription.customer?.username ||
      subscription.customer?.name ||
      (typeof subscription.customer === "string"
        ? subscription.customer
        : "Customer")
    );
  };

  const getProductName = (subscription) => {
    return (
      subscription.product_name ||
      subscription.product?.name ||
      subscription.product?.title ||
      "Water Refill"
    );
  };

  const getFrequency = (subscription) => {
    return String(
      subscription.frequency ||
        subscription.interval ||
        subscription.billing_frequency ||
        "—",
    );
  };

  const getStatus = (subscription) => {
    return String(subscription.status || "UNKNOWN").toUpperCase();
  };

  const getQuantity = (subscription) => {
    return (
      subscription.quantity ||
      subscription.items?.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ) ||
      0
    );
  };

  const getAmount = (subscription) => {
    return Number(
      subscription.total_amount ||
        subscription.amount ||
        subscription.price ||
        0,
    );
  };

  const getNextDeliveryDate = (subscription) => {
    return (
      subscription.next_delivery_date ||
      subscription.next_delivery ||
      subscription.next_delivery_at ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString()}`;
  };

  const handleAction = async (subscription, action) => {
    const subscriptionId = subscription.id;

    try {
      setActionId(subscriptionId);
      setError("");
      setMessage("");

      await api.patch(`/subscriptions/management/${subscriptionId}/action/`, {
        action,
      });

      if (action === "pause") {
        setMessage("Subscription paused successfully.");
      } else if (action === "resume") {
        setMessage("Subscription resumed successfully.");
      } else if (action === "cancel") {
        setMessage("Subscription cancelled successfully.");
      } else {
        setMessage("Subscription updated successfully.");
      }

      await loadSubscriptions();
    } catch (err) {
      console.error(err);

      const detail = err.response?.data?.detail || err.response?.data?.message;

      setError(detail || "Unable to update the subscription.");
    } finally {
      setActionId(null);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const customer = getCustomerName(subscription).toLowerCase();
      const product = getProductName(subscription).toLowerCase();
      const id = String(subscription.id || "").toLowerCase();
      const frequency = getFrequency(subscription).toLowerCase();
      const status = getStatus(subscription).toLowerCase();

      const matchesSearch =
        !term ||
        customer.includes(term) ||
        product.includes(term) ||
        id.includes(term);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      const matchesFrequency =
        frequencyFilter === "all" || frequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesFrequency;
    });
  }, [subscriptions, searchTerm, statusFilter, frequencyFilter]);

  const totalSubscriptions = subscriptions.length;

  const activeSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "ACTIVE",
  ).length;

  const pausedSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "PAUSED",
  ).length;

  const cancelledSubscriptions = subscriptions.filter(
    (subscription) => getStatus(subscription) === "CANCELLED",
  ).length;

  const frequencies = useMemo(() => {
    return [
      ...new Set(
        subscriptions
          .map((subscription) => getFrequency(subscription))
          .filter((frequency) => frequency !== "—"),
      ),
    ];
  }, [subscriptions]);

  return (
    <ManagementLayout title="Subscriptions">
      <div className="management-welcome">
        <div>
          <p>
            Manage recurring water delivery subscriptions and customer
            schedules.
          </p>
        </div>
      </div>

      {message && <div className="subscription-success">{message}</div>}

      {error && <div className="subscription-error">{error}</div>}

      <div className="subscription-stats">
        <div className="subscription-stat-card">
          <div className="subscription-stat-icon">
            <Repeat />
          </div>

          <div>
            <span>Total Subscriptions</span>
            <strong>{totalSubscriptions}</strong>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon active">
            <Play />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeSubscriptions}</strong>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon paused">
            <Pause />
          </div>

          <div>
            <span>Paused</span>
            <strong>{pausedSubscriptions}</strong>
          </div>
        </div>

        <div className="subscription-stat-card">
          <div className="subscription-stat-icon cancelled">
            <Ban />
          </div>

          <div>
            <span>Cancelled</span>
            <strong>{cancelledSubscriptions}</strong>
          </div>
        </div>
      </div>

      <section className="management-panel-card">
        <div className="subscription-section-header">
          <div>
            <h3>Subscription List</h3>
            <p>{filteredSubscriptions.length} subscriptions displayed</p>
          </div>

          <div className="subscription-filter-row">
            <div className="subscription-search">
              <Search />

              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <select
              className="subscription-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="subscription-filter"
              value={frequencyFilter}
              onChange={(event) => setFrequencyFilter(event.target.value)}
            >
              <option value="all">All Frequencies</option>

              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="subscription-loading">Loading subscriptions...</div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="subscription-empty">
            <Repeat />
            <h3>No subscriptions found</h3>
            <p>
              {searchTerm || statusFilter !== "all" || frequencyFilter !== "all"
                ? "Try changing your filters."
                : "There are no subscriptions yet."}
            </p>
          </div>
        ) : (
          <div className="subscription-table-wrapper">
            <table className="subscription-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Frequency</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Next Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscriptions.map((subscription) => {
                  const status = getStatus(subscription);
                  const isActionLoading = actionId === subscription.id;

                  return (
                    <tr key={subscription.id}>
                      <td>
                        <div className="subscription-customer">
                          <div className="subscription-avatar">
                            {getCustomerName(subscription)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{getCustomerName(subscription)}</strong>
                            <span>#{subscription.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{getProductName(subscription)}</td>

                      <td>
                        <span className="subscription-frequency">
                          {getFrequency(subscription)}
                        </span>
                      </td>

                      <td>{getQuantity(subscription)}</td>

                      <td className="subscription-amount">
                        {formatAmount(getAmount(subscription))}
                      </td>

                      <td>
                        <span
                          className={`subscription-status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>{formatDate(getNextDeliveryDate(subscription))}</td>

                      <td>
                        <div className="subscription-actions">
                          {status === "ACTIVE" && (
                            <>
                              <button
                                className="subscription-action pause"
                                onClick={() =>
                                  handleAction(subscription, "pause")
                                }
                                disabled={isActionLoading}
                                title="Pause subscription"
                              >
                                <Pause />
                              </button>

                              <button
                                className="subscription-action cancel"
                                onClick={() =>
                                  handleAction(subscription, "cancel")
                                }
                                disabled={isActionLoading}
                                title="Cancel subscription"
                              >
                                <Ban />
                              </button>
                            </>
                          )}

                          {status === "PAUSED" && (
                            <>
                              <button
                                className="subscription-action resume"
                                onClick={() =>
                                  handleAction(subscription, "resume")
                                }
                                disabled={isActionLoading}
                                title="Resume subscription"
                              >
                                <Play />
                              </button>

                              <button
                                className="subscription-action cancel"
                                onClick={() =>
                                  handleAction(subscription, "cancel")
                                }
                                disabled={isActionLoading}
                                title="Cancel subscription"
                              >
                                <Ban />
                              </button>
                            </>
                          )}

                          {status === "CANCELLED" && (
                            <span className="subscription-no-action">—</span>
                          )}
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
    </ManagementLayout>
  );
}

export default ManagementSubscriptions;
