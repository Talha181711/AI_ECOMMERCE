import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import {
  getCartItems,
  updateCartItem,
  removeCartItem,
} from "../components/cart";
import { Link } from "react-router-dom";

export default function Cart() {
  const { currentUser } = useContext(AuthContext);
  const { updateCartCount } = useCart();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    getCartItems(currentUser.id).then((data) => {
      if (data.success) setItems(data.items);
    });
  }, [currentUser?.id]);

  const onQtyChange = (id, qty) => {
    if (qty < 1) return;
    updateCartItem({
      cartItemId: id,
      userId: currentUser.id,
      quantity: qty,
    }).then((data) => {
      if (data.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, quantity: qty } : it))
        );
        updateCartCount();
      }
    });
  };

  const onRemove = (id) => {
    removeCartItem({ cartItemId: id, userId: currentUser.id }).then((data) => {
      if (data.success) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        toast.success("Item Removed from cart!");
        updateCartCount();
      }
    });
  };

  const subtotal = items.reduce(
    (acc, it) => acc + it.unit_price * it.quantity,
    0
  );

  if (!currentUser) {
    return <div className="container my-4">Loading your cart...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Your Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="row">
          {/* Left Side: Cart Items */}
          <div className="col-lg-8">
            <ul className="list-group">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="list-group-item d-flex flex-column flex-md-row align-items-md-center"
                >
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_HOST_URL}/${
                      it.image_url
                    }`}
                    alt=""
                    style={{ width: 60 }}
                    className="me-3 mb-2 mb-md-0"
                  />
                  <div className="flex-grow-1">
                    <h5>{it.product_title}</h5>
                    <p className="mb-1">Color: {it.color_name}</p>
                    <p className="mb-1">Size: {it.size_name}</p>
                    <div className="d-flex align-items-center mb-2">
                      <input
                        type="number"
                        value={it.quantity}
                        min={1}
                        className="form-control form-control-sm me-2"
                        style={{ width: "60px" }}
                        onChange={(e) => onQtyChange(it.id, +e.target.value)}
                      />
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onRemove(it.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mb-0">
                      Item Price: Rs {parseFloat(it.unit_price).toFixed(2)} |
                      Total Price: Rs {(it.unit_price * it.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Summary */}
          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal</span>
                  <strong>Rs {subtotal.toFixed(2)}</strong>
                </div>
                <Link to="/checkout" className="text-decoration-none">
                  <button className="btn btn-dark w-100 mb-3">Checkout</button>
                </Link>
                <div className="text-center">
                  <Link to="/shop" className="text-decoration-none">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
