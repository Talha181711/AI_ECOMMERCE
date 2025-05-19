// src/pages/ProductDetail.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../components/cart";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import StarRatings from "react-star-ratings";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext); // ← get the user
  const { updateCartCount } = useContext(CartContext); // ✅ get global cart updater

  // ── 1) ALL hooks up front ──
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [featuredImage, setFeaturedImage] = useState(null);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(2);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Fetch Product reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_reviews.php`,
        { params: { product_id: id } }
      );
      const data = response.data;
      if (data.success) {
        setReviews(data.reviews);
        if (currentUser) {
          const existing = data.reviews.find(
            (r) => r.user_id === currentUser.id
          );
          setUserHasReviewed(!!existing);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id, currentUser]);

  // ── 2) Fetch product JSON ──
  useEffect(() => {
    const url = `${import.meta.env.VITE_HOST_URL}/get_products.php?id=${id}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else if (data.success && Array.isArray(data.products)) {
          const found = data.products.find((p) => String(p.id) === String(id));
          if (found) setProduct(found);
          else throw new Error("Product not found");
        } else {
          throw new Error(data.message || "Unexpected response");
        }
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setError(err);
      });
  }, [id]);

  // ── 3) Derived data ──
  const variants = product?.variants || [];
  const images = product?.images || [];

  // ── 4) Build unique color options ──
  const uniqueColorIds = Array.from(new Set(variants.map((v) => v.color_id)));
  const colorOptions = uniqueColorIds.map((colorId, idx) => {
    const img = images.find((i) => i.color_id === colorId);
    const url = img
      ? `${import.meta.env.VITE_UPLOADS_HOST_URL}/${img.image_url}`
      : "/placeholder.jpg";
    return {
      key: `c-${colorId}-${idx}`,
      colorId,
      imageUrl: url,
      totalStock: variants
        .filter((v) => v.color_id === colorId)
        .reduce((sum, v) => sum + v.stock, 0),
    };
  });

  // ── 5) Initialize selectedColor **only once** when product loads ──
  useEffect(() => {
    if (product && selectedColor === null && uniqueColorIds.length > 0) {
      const firstColor = uniqueColorIds[0];
      setSelectedColor(firstColor);
    }
  }, [product, uniqueColorIds, selectedColor]);

  // ── 6) When selectedColor changes, rebuild sizes and featuredImage ──
  useEffect(() => {
    if (selectedColor == null) return;

    // sizes
    const opts = variants
      .filter((v) => v.color_id === selectedColor)
      .map((v) => ({
        key: `v-${v.id}`,
        variantId: v.id,
        sizeName: v.size,
        stock: v.stock,
      }));
    setSizeOptions(opts);

    // pick first available size
    const firstAvail = opts.find((o) => o.stock > 0) || opts[0];
    setSelectedSize(firstAvail?.variantId ?? null);
    setQuantity(1);

    // featured image
    const imgObj = images.find((i) => i.color_id === selectedColor);
    const url = imgObj
      ? `${import.meta.env.VITE_UPLOADS_HOST_URL}/${imgObj.image_url}`
      : "/placeholder.jpg";
    setFeaturedImage(url);
  }, [selectedColor, variants, images]);

  // ── 7) Loading / Error ──
  if (error) {
    return (
      <div className="container my-4 text-center">
        <p className="text-danger">Error: {error.message}</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container my-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  // ── 8) Current stock ──
  const currentVariant = variants.find(
    (v) => v.color_id === selectedColor && v.id === selectedSize
  );
  const maxStock = currentVariant?.stock || 0;

  // ── add to cart ──
  const handleAddToCart = async () => {
    if (!currentUser) {
      // not logged in → send them to login
      navigate("/login");
      return;
    }
    try {
      const data = await addToCart({
        userId: currentUser.id,
        productId: product.id,
        variantId: selectedSize,
        quantity,
        unitPrice: parseFloat(product.price),
      });
      if (data.success) {
        toast.success("Item added to cart!");
        updateCartCount(); // call global context/cart state updater
        // onClose();
        navigate("/cart");
      } else {
        toast.error("Error adding to cart: " + data.message);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart.");
    }
  };

  const handleEditReview = (review) => {
    setNewComment(review.comment);
    setNewRating(review.rating);
    setEditingReviewId(review.id);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_URL}/delete_review.php`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_id: reviewId,
            user_id: currentUser.id,
          }),
          credentials: "include",
        }
      );

      const rawText = await response.text(); // read once
      console.log("Raw response:", rawText);

      let data;
      try {
        data = JSON.parse(rawText); // safely parse
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        alert("Unexpected server response");
        return;
      }

      if (data.success) {
        toast.success("Review deleted successfully!");
        fetchReviews();
      } else {
        alert("Error deleting review: " + data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete review");
    }
  };

  // handle review submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!newRating || !newComment.trim()) {
      toast.warning("Please provide a rating and comment.");
      return;
    }

    const payload = {
      user_id: currentUser.id,
      product_id: product.id,
      rating: newRating,
      comment: newComment,
      ...(editingReviewId && { review_id: editingReviewId }),
    };

    try {
      const url = editingReviewId
        ? `${import.meta.env.VITE_HOST_URL}/update_review.php`
        : `${import.meta.env.VITE_HOST_URL}/submit_review.php`;

      const response = await fetch(url, {
        method: editingReviewId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      // Read raw response text for debugging purposes
      const rawText = await response.text();
      console.log("Raw response:", rawText);

      let data;
      try {
        data = JSON.parse(rawText); // Safely parse the response text into JSON
        console.log("Parsed data:", data);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        toast.error("Unexpected response format");
        return;
      }

      if (data.success) {
        setNewComment(""); // Clear the comment input
        setNewRating(0); // Reset the rating
        setEditingReviewId(null); // Clear the editing review ID
        fetchReviews(); // Fetch the updated list of reviews
        if (!editingReviewId) setUserHasReviewed(true); // If it's a new review, mark as reviewed

        toast.success(
          editingReviewId ? "Review updated!" : "Review submitted!"
        );
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error("Failed to submit review");
    }
  };

  const renderStars = (count) => "★".repeat(count) + "☆".repeat(5 - count);

  if (error) return <p className="text-danger">Error: {error.message}</p>;
  if (!product) return <p>Loading...</p>;

  // ── 9) Render ──
  return (
    <div className="container my-4">
      <Link
        to="/shop"
        className="btn btn-outline-secondary mb-3 d-inline-flex align-items-center"
      >
        <FaArrowLeft className="me-2" />
        Back to Shop
      </Link>
      <h2 className="mb-4">{product.title}</h2>
      <div className="d-flex flex-column flex-md-row gap-4">
        {/* LEFT: Featured Image + Color Circles */}
        <div className="text-center">
          <img
            src={featuredImage}
            alt={product.title}
            style={{ width: "100%", maxWidth: "400px", objectFit: "contain" }}
          />
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
            {colorOptions.map(({ key, colorId, imageUrl, totalStock }) => {
              const disabled = totalStock < 1;
              const isSelected = colorId === selectedColor;
              return (
                <div
                  key={key}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedColor(colorId);
                  }}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: isSelected ? "2px solid #000" : "1px solid #ccc",
                    opacity: disabled ? 0.4 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Color ${colorId}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Details, Sizes, Quantity, Add to Cart */}
        <div className="flex-grow-1">
          <p>
            <strong>Price:</strong> Rs {parseFloat(product.price).toFixed(0)}
          </p>
          <p>{product.description}</p>

          <div className="mb-3">
            <strong>Sizes:</strong>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {sizeOptions.map(({ key, sizeName, stock, variantId }) => {
                const disabled = stock < 1;
                const isSelected = variantId === selectedSize;
                return (
                  <div
                    key={key}
                    onClick={() => !disabled && setSelectedSize(variantId)}
                    style={{
                      padding: "4px 8px",
                      border: isSelected ? "1px solid #000" : "1px solid #ccc",
                      borderRadius: "4px",
                      textDecoration: disabled ? "line-through" : "none",
                      opacity: disabled ? 0.4 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {sizeName}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="d-flex align-items-center mb-3">
            <strong className="me-2">Quantity:</strong>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <input
              type="number"
              className="form-control form-control-sm mx-2"
              style={{ width: "60px", textAlign: "center" }}
              value={quantity}
              min={1}
              max={maxStock}
              onChange={(e) =>
                setQuantity(Math.min(maxStock, Math.max(1, +e.target.value)))
              }
            />
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
              disabled={quantity >= maxStock}
            >
              +
            </button>
          </div>

          <div className="mb-4">
            <button className="btn btn-primary w-100" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-5">
        <h4>Customer Reviews</h4>
        {reviews.slice(0, visibleReviews).map((r) => (
          <div key={r.id} className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="card-title mb-0">{r.user_name}</h5>
                  <small className="text-muted">
                    {new Date(r.created_at).toLocaleDateString()}
                  </small>
                </div>
                {currentUser?.id === r.user_id && (
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEditReview(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteReview(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <StarRatings
                rating={r.rating}
                starDimension="20px"
                starSpacing="2px"
                starRatedColor="gold"
                numberOfStars={5}
                name="rating"
              />
              <p className="card-text mt-2">{r.comment}</p>
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {visibleReviews < reviews.length && (
          <div className="d-grid">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setVisibleReviews((v) => v + 2)}
            >
              Load More Reviews
            </button>
          </div>
        )}

        {/* Review Form */}
        {(currentUser && !userHasReviewed) || editingReviewId ? (
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">
                {editingReviewId ? "Edit Review" : "Write a Review"}
              </h5>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <StarRatings
                    rating={newRating}
                    starRatedColor="gold"
                    starHoverColor="gold"
                    changeRating={setNewRating}
                    numberOfStars={5}
                    starDimension="28px"
                    starSpacing="2px"
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  {editingReviewId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingReviewId(null);
                        setNewComment("");
                        setNewRating(0);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingReviewId ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
