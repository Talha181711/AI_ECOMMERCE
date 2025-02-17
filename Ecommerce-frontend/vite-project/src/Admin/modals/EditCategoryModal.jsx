// src/Admin/modals/EditCategoryModal.jsx
import React, { useState } from "react";
import axios from "axios";

const EditCategoryModal = ({ category, onClose, onUpdated }) => {
  const [categoryName, setCategoryName] = useState(category.category_name);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        "http://localhost/php-backend/api/update_category.php",
        { id: category.id, category_name: categoryName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onUpdated(); // Refresh the categories list in the parent component
        onClose();
      } else {
        alert(
          "Error: " + (response.data.message || "Failed to update category")
        );
      }
    } catch (err) {
      alert("Error: Failed to update category");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Category</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              className="form-control"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Update Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;
