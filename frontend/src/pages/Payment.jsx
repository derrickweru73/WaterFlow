import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  // Check authentication when the payment page opens
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          returnTo: "/checkout",
        },
      });
    }
  }, [navigate]);

  // Handle M-Pesa payment
  const handlePayment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    // User must be logged in before payment
    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          returnTo: "/checkout",
        },
      });
      return;
    }

    if (!phoneNumber.trim()) {
      setMessage("Please enter your M-Pesa phone number.");
      return;
    }

    setPaying(true);
    setMessage("");

    try {
      const response = await api.post("/payments/", {
        order_id: order.id,
        phone_number: phoneNumber.trim(),
      });

      console.log("Payment response:", response.data);

      setMessage(
        "M-Pesa prompt sent. Please check your phone and enter your PIN.",
      );

      let attempts = 0;
      const maxAttempts = 20;

      const checkPaymentStatus = async () => {
        try {
          attempts += 1;

          const orderResponse = await api.get(
            `/my-orders/${order.id}/`,
          );

          const updatedOrder = orderResponse.data;

          if (
            updatedOrder.payment_status === "COMPLETED" ||
            updatedOrder.payment_status === "Completed"
          ) {
            setMessage(
              "Payment successful! Redirecting to your order...",
            );

            setTimeout(() => {
              navigate("/orders", {
                state: {
                  orderId: order.id,
                },
              });
            }, 1000);

            return;
          }

          if (
            updatedOrder.payment_status === "FAILED" ||
            updatedOrder.payment_status === "Failed"
          ) {
            setMessage("Payment failed. Please try again.");
            setPaying(false);
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(checkPaymentStatus, 3000);
          } else {
            setMessage(
              "We could not confirm your payment yet. Please check your order status.",
            );
            setPaying(false);
          }
        } catch (error) {
          console.error("Payment status error:", error);

          if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            navigate("/login", {
              replace: true,
              state: {
                returnTo: "/checkout",
              },
            });

            return;
          }

          setMessage(
            "Unable to check payment status. Please check your order.",
          );
          setPaying(false);
        }
      };

      setTimeout(checkPaymentStatus, 3000);
    } catch (error) {
      console.error("Payment error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login", {
          replace: true,
          state: {
            returnTo: "/checkout",
          },
        });

        return;
      }

      setMessage(
        error.response?.data?.detail ||
          "Unable to start M-Pesa payment. Please try again.",
      );

      setPaying(false);
    }
  };

  // No order was supplied
  if (!order) {
    return (
      <div className="products-page">
        <div className="products-container">
          <CustomerHeader
            returnTo="/checkout"
            returnLabel="Return to Checkout"
          />

          <section className="products-intro">
            <h2>Payment</h2>
            <p>No order information was found.</p>

            <button
              type="button"
              className="product-button"
              onClick={() => navigate("/checkout")}
            >
              Return to Checkout
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <CustomerHeader
          returnTo="/checkout"
          returnLabel="Return to Checkout"
        />

        <section className="products-intro">
          <h2>Payment</h2>
          <p>Complete your order using M-Pesa.</p>
        </section>

        {message && (
          <p className="products-message">
            {message}
          </p>
        )}

        <div className="product-card">
          <h3>M-Pesa Payment</h3>

          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label htmlFor="phoneNumber">
                M-Pesa Phone Number
              </label>

              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value)
                }
                placeholder="e.g. 0712345678"
                required
                disabled={paying}
              />
            </div>

            <button
              type="submit"
              className="product-button"
              disabled={paying}
            >
              {paying
                ? "Waiting for payment..."
                : "Pay with M-Pesa"}
            </button>
          </form>
        </div>

        <div
          className="product-card"
          style={{ marginTop: "25px" }}
        >
          <h3>Order Summary</h3>

          <p className="product-description">
            <strong>Order:</strong> #{order.id}
          </p>

          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>
                {item.product_name} × {item.quantity}
              </span>

              <strong>
                KSh{" "}
                {Number(item.subtotal || 0).toLocaleString()}
              </strong>
            </div>
          ))}

          <hr />

          <h3>
            Total: KSh{" "}
            {Number(order.total || 0).toLocaleString()}
          </h3>

          <p className="product-description">
            You will receive an M-Pesa payment prompt on your
            phone after clicking the payment button.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Payment;
 