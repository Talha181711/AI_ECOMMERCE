// src/Admin/ProductVariants.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductVariants = ({ productId, colors, sizes }) => {
  const [variants, setVariants] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [stock, setStock] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch variants for the given product
    axios
      .get(
        `http://localhost/AI_ECOMMERCE/php-backend/api/get_product_variants.php?product_id=${productId}`,
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.status === "success") {
          setVariants(response.data.variants);
        } else {
          setError(response.data.message || "Failed to fetch variants");
        }
      })
      .catch((err) => setError("Failed to fetch variants"));
  }, [productId]);

  // When the user selects a color and size, find the matching variant.
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = variants.find(
        (v) =>
          String(v.color_id) === selectedColor &&
          String(v.size_id) === selectedSize
      );
      setStock(variant ? variant.stock : 0);
    } else {
      setStock(null);
    }
  }, [selectedColor, selectedSize, variants]);

  return (
    <div>
      {error && <p className="text-danger">{error}</p>}
      <h5>Available Options:</h5>
      <div className="mb-2">
        <label>Color:</label>
        <div>
          {colors.map((color) => (
            <button
              key={color.id}
              className={`btn btn-sm me-2 ${
                selectedColor === String(color.id)
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setSelectedColor(String(color.id))}
            >
              {color.color_name}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label>Size:</label>
        <select
          className="form-control w-25"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option value="">Select Size</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.size}
            </option>
          ))}
        </select>
      </div>
      {stock !== null && (
        <div>
          <strong>Stock:</strong> {stock > 0 ? stock : "Out of Stock"}
        </div>
      )}
    </div>
  );
};

export default ProductVariants;
