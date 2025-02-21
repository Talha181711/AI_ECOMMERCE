import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const [productData, setProductData] = useState({ ...product });
  const [variants, setVariants] = useState(product.variants || []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...variants];
    newVariants[index][name] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", stock: "" }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost/AI_ECOMMERCE/php-backend/api/edit_product.php",
        productData
      );
      const updatedProductId = response.data.product_id;

      for (const variant of variants) {
        await axios.post(
          "http://localhost/AI_ECOMMERCE/php-backend/api/edit_variant.php",
          {
            product_id: updatedProductId,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          }
        );
      }

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error editing product:", err);
    }
  };

  return (
    <div className="modal" style={{ display: "block" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Product</h5>
            <button className="close" onClick={onClose}>
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={productData.title}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={productData.description}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={productData.price}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  className="form-control"
                  name="category_id"
                  value={productData.category_id}
                  onChange={handleProductChange}
                  required
                />
              </div>

              {/* Add/Edit Variants Section */}
              <div className="form-group">
                <label>Variants</label>
                {variants.map((variant, index) => (
                  <div key={index} className="d-flex mb-3">
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Size"
                      name="size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Color"
                      name="color"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                    <input
                      type="number"
                      className="form-control me-2"
                      placeholder="Stock"
                      name="stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-danger ms-2"
                      onClick={() => removeVariant(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={addVariant}
                >
                  Add Variant
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
