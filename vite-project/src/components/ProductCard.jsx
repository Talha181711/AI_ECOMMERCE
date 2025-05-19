import React, { useState, useEffect, useContext } from "react";
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
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_HOST_URL}/get_reviews.php?product_id=${id}`
        );
        const data = await response.json();
        if (data.success && data.reviews.length > 0) {
          const total = data.reviews.reduce(
            (sum, review) => sum + parseFloat(review.rating),
            0
          );
          const avg = total / data.reviews.length;
          setAverageRating(avg);
          setReviewCount(data.reviews.length);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [id]);

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

  const renderStars = () => {
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-warning">
          &#9733;
        </span>
      );
    }

    if (halfStar) {
      stars.push(
        <span key="half" className="text-warning">
          &#189;
        </span>
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-muted">
          &#9734;
        </span>
      );
    }

    return stars;
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
          <p className="card-text mb-2">Rs {parseFloat(price).toFixed(0)}</p>
          <div className="mb-2">
            {renderStars()} <small>({reviewCount})</small>
          </div>
          <div className="mt-auto">
            <button
              className="btn btn-outline-secondary quick-view w-100"
              onClick={() => setShowModal(true)}
            >
              Quick View
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
