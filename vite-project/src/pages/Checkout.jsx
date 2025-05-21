import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCartItems } from "../components/cart";
import { toast } from "react-toastify";
import axios from "axios";

export default function Checkout() {
  const { currentUser } = useContext(AuthContext);
  const { updateCartCount } = useCart();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    order_notes: "",
  });

  useEffect(() => {
    if (!currentUser?.id) return;

    // Auto-fill name and email
    setForm((prev) => ({
      ...prev,
      customer_name: currentUser.username || "",
      customer_email: currentUser.email || "",
    }));

    getCartItems(currentUser.id).then((data) => {
      if (data.success) setItems(data.items);
    });
  }, [currentUser?.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Validate required fields manually
    const { customer_name, customer_email, customer_phone, shipping_address } =
      form;
    if (
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !shipping_address
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/place_order.php`,
        {
          user_id: currentUser.id,
          ...form,
          items,
        }
      );

      if (res.data.success) {
        toast.success("Order placed successfully!");
        updateCartCount();
        // Optionally clear form or redirect
      } else {
        toast.error(res.data.message || "Order placement failed.");
      }
    } catch (err) {
      toast.error("An error occurred while placing the order.");
    }
  };

  const subtotal = items.reduce(
    (acc, it) => acc + it.unit_price * it.quantity,
    0
  );

  return (
    <div className="container my-4">
      <h2 className="mb-4">Checkout</h2>
      <div className="row">
        {/* Left Column: Shipping Form */}
        <div className="col-md-7">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                name="customer_email"
                value={form.customer_email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                name="customer_phone"
                value={form.customer_phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Shipping Address *</label>
              <textarea
                className="form-control"
                name="shipping_address"
                value={form.shipping_address}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Order Notes (Optional)</label>
              <textarea
                className="form-control"
                name="order_notes"
                value={form.order_notes}
                onChange={handleChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Place Order
            </button>
          </form>
        </div>

        {/* Right Column: Cart Summary */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              {items.map((item) => (
                <div key={item.id} className="d-flex mb-3">
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_HOST_URL}/${
                      item.image_url
                    }`}
                    alt={item.product_title}
                    style={{ width: 60 }}
                    className="me-3"
                  />
                  <div>
                    <h6>{item.product_title}</h6>
                    <p className="mb-1">
                      Color: {item.color_name} | Size: {item.size_name}
                    </p>
                    <p className="mb-0">
                      Qty: {item.quantity} | Price: Rs{" "}
                      {(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Subtotal:</strong>
                <span>Rs {subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
