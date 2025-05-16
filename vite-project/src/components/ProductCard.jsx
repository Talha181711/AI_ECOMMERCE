// src/components/ProductCard.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart } from "../components/cart";
import { AuthContext } from "../context/AuthContext";

export default function ProductCard({ product }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id, title, price, images } = product;
  const imageUrl =
    images && images.length > 0
      ? `${import.meta.env.VITE_UPLOADS_HOST_URL}/${images[0].image_url}`
      : "/placeholder.jpg";
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (e) => {
    if (
      e.target.closest(".btn") ||
      e.target.closest(".quick-view") ||
      e.target.tagName === "BUTTON"
    )
      return;
    navigate(`/product/${id}`);
  };

  const handleAddToCart = async () => {
    // If not logged in, redirect to login
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const data = await addToCart({
        userId: currentUser.id,
        productId: id,
        variantId: null,
        quantity: 1,
        unitPrice: parseFloat(price),
      });
      if (data.success) {
        navigate("/cart");
      } else {
        alert("Error adding to cart: " + data.message);
      }
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <>
      <div
        className="card h-100 shadow-sm position-relative transition hover-shadow"
        style={{ cursor: "pointer" }}
        onClick={handleCardClick}
      >
        <img
          src={imageUrl}
          className="card-img-top"
          alt={title}
          style={{ objectFit: "contain", height: "250px" }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{title}</h5>
          <p className="card-text mb-4">Rs {parseFloat(price).toFixed(0)}</p>
          <div className="d-flex gap-2 mt-auto">
            <button
              className="btn btn-outline-secondary quick-view"
              onClick={() => setShowModal(true)}
            >
              Quick View
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/product/${id}`)}
            >
              View Product
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <QuickViewModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
