// src/components/QuickViewModal.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { addToCart } from "../components/cart";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function QuickViewModal({ product, onClose }) {
  const { currentUser } = useContext(AuthContext);
  const { updateCartCount } = useCart();
  const navigate = useNavigate();

  const { id, title, price, images = [], description, variants = [] } = product;

  // 1) Build unique color options
  const uniqueColorIds = Array.from(new Set(variants.map((v) => v.color_id)));
  const colorOptions = uniqueColorIds.map((colorId, idx) => {
    const img = images.find((i) => i.color_id === colorId);
    return {
      key: `c-${colorId}-${idx}`,
      colorId,
      imageUrl: img
        ? `${import.meta.env.VITE_UPLOADS_HOST_URL}/${img.image_url}`
        : "/placeholder.jpg",
      totalStock: variants
        .filter((v) => v.color_id === colorId)
        .reduce((sum, v) => sum + v.stock, 0),
    };
  });

  const [selectedColor, setSelectedColor] = useState(colorOptions[0]?.colorId);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // 2) When color changes, rebuild sizeOptions
  useEffect(() => {
    const opts = variants
      .filter((v) => v.color_id === selectedColor)
      .map((v) => ({
        key: `v-${v.id}`,
        variantId: v.id,
        sizeName: v.size,
        stock: v.stock,
      }));
    setSizeOptions(opts);

    const firstAvailable = opts.find((o) => o.stock > 0) || opts[0];
    setSelectedSize(firstAvailable?.variantId);
    setQuantity(1);
  }, [selectedColor, variants]);

  // current stock for chosen variant
  const currentVariant = variants.find(
    (v) => v.color_id === selectedColor && v.id === selectedSize
  );
  const maxStock = currentVariant?.stock || 0;

  // main image for the selected color
  const mainImg = images.find((i) => i.color_id === selectedColor);
  const mainImageUrl = mainImg
    ? `${import.meta.env.VITE_UPLOADS_HOST_URL}/${mainImg.image_url}`
    : "/placeholder.jpg";

  // 3) Add to cart handler
  const handleAddToCart = async () => {
    if (!currentUser) {
      // Not logged in
      navigate("/login");
      return;
    }
    try {
      const data = await addToCart({
        userId: currentUser.id,
        productId: id,
        variantId: selectedSize,
        quantity,
        unitPrice: parseFloat(price),
      });
      if (data.success) {
        toast.success("Item added to cart!");
        updateCartCount(); // call global context/cart state updater
        onClose();
        navigate("/cart");
      } else {
        toast.error("Error adding to cart: " + data.message);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart.");
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body d-flex flex-column flex-md-row gap-4">
            {/* LEFT: Image & color circles */}
            <div className="text-center">
              <img
                src={mainImageUrl}
                alt={title}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  objectFit: "contain",
                }}
              />
              <div className="d-flex justify-content-center flex-wrap mt-3 gap-2">
                {colorOptions.map(({ key, colorId, imageUrl, totalStock }) => {
                  const disabled = totalStock < 1;
                  const isSelected = colorId === selectedColor;
                  return (
                    <div
                      key={key}
                      onClick={() => !disabled && setSelectedColor(colorId)}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: isSelected
                          ? "2px solid #000"
                          : "1px solid #ccc",
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

            {/* RIGHT: Details & actions */}
            <div className="flex-grow-1">
              <p>
                <strong>Price:</strong> Rs {parseFloat(price).toFixed(0)}
              </p>
              <p>{description}</p>

              {/* Sizes */}
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
                          border: isSelected
                            ? "1px solid #000"
                            : "1px solid #ccc",
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

              {/* Quantity */}
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
                    setQuantity(
                      Math.min(maxStock, Math.max(1, +e.target.value))
                    )
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

              {/* Add to Cart */}
              <div className="mb-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>

              {/* Full details link */}
              <Link
                to={`/product/${id}`}
                className="d-block text-center text-decoration-none"
                onClick={onClose}
              >
                View full details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
