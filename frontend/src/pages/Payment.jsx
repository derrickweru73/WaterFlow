import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

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
          </section>

          <button
            className="product-button"
            onClick={() => navigate("/checkout")}
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();

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
        response.data?.detail ||
          response.data?.message ||
          "M-Pesa payment request sent. Check your phone and enter your M-Pesa PIN."
      );
    } catch (error) {
      console.error("Payment error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/");
        return;
      }

      const data = error.response?.data;

      setMessage(
        data?.detail ||
          data?.phone_number?.[0] ||
          data?.order?.[0] ||
          "Unable to start M-Pesa payment. Please try again."
      );
    } finally {
      setPaying(false);
    }
  };

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

        <div className="checkout-layout">
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
                />
              </div>

              <button
                className="product-button"
                type="submit"
                disabled={paying}
              >
                {paying
                  ? "Sending M-Pesa Request..."
                  : "Pay with M-Pesa"}
              </button>
            </form>
          </div>

          <div className="product-card">
            <h3>Order Summary</h3>

            <p>
              <strong>Order:</strong> #{order.id}
            </p>

            {order.items?.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  gap: "15px",
                }}
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>

                <strong>
                  KSh{" "}
                  {Number(
                    item.subtotal || 0
                  ).toLocaleString()}
                </strong>
              </div>
            ))}

            <hr />

            <h3>
              Total: KSh{" "}
              {Number(
                order.total_amount ||
                  order.total ||
                  0
              ).toLocaleString()}
            </h3>

            <p className="product-description">
              You will receive an M-Pesa payment prompt on
              your phone after clicking the payment button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;

