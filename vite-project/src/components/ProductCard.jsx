import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
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

  const trackProductView = async (source) => {
    console.log(`🔍 Tracking view from: ${source}`);
    console.log("📦 Product ID:", id);

    if (currentUser && currentUser.id) {
      console.log("👤 Logged-in user ID:", currentUser.id);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_HOST_URL}/track_view.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: currentUser.id,
              product_id: id,
            }),
          }
        );

        const result = await res.json();
        console.log("✅ Backend tracking response:", result);
      } catch (err) {
        console.error("❌ Backend tracking failed:", err);
      }
    } else {
      console.log("👤 Guest user - using localStorage");

      try {
        const MAX_VIEWS = 20;
        let viewed = JSON.parse(
          localStorage.getItem("viewed_products") || "[]"
        );

        // Remove if already exists
        viewed = viewed.filter((pid) => pid !== id);

        // Add to front
        viewed.unshift(id);

        // Enforce size limit
        if (viewed.length > MAX_VIEWS) {
          viewed = viewed.slice(0, MAX_VIEWS);
        }

        localStorage.setItem("viewed_products", JSON.stringify(viewed));

        console.log("📝 Updated LocalStorage viewed_products:", viewed);
      } catch (err) {
        console.error("❌ LocalStorage tracking failed:", err);
      }
    }
  };

  const handleCardClick = async (e) => {
    if (
      e.target.closest(".btn") ||
      e.target.closest(".quick-view") ||
      e.target.tagName === "BUTTON"
    ) {
      return;
    }

    await trackProductView("card click");
    navigate(`/product/${id}`);
  };

  const handleQuickView = async () => {
    await trackProductView("quick view");
    setShowModal(true);
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
  console.log("image url", imageUrl);

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
              onClick={handleQuickView}
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
