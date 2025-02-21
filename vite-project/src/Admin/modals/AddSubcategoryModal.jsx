// src/Admin/modals/AddSubcategoryModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddSubcategoryModal = ({ onClose, onAdded, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");

  const handleAdd = async () => {
    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }
    if (!subcategoryName) {
      alert("Please enter a subcategory name.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost/AI_ECOMMERCE/php-backend/api/add_subcategory.php",
        { category_id: selectedCategory, subcategory_name: subcategoryName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onAdded();
        onClose();
      } else {
        alert(
          "Error: " + (response.data.message || "Failed to add subcategory")
        );
      }
    } catch (err) {
      alert("Error: Failed to add subcategory");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Subcategory</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <select
              className="form-control mb-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Parent Category</option>
              {categories &&
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
            </select>
            <input
              type="text"
              className="form-control"
              placeholder="Subcategory Name"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Subcategory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubcategoryModal;
