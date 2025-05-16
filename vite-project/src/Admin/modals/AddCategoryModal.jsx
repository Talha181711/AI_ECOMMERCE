// src/Admin/modals/AddCategoryModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddCategoryModal = ({ onClose, onAdded }) => {
  const [categoryName, setCategoryName] = useState("");

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/add_category.php`,
        { category_name: categoryName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onAdded();
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to add category"));
      }
    } catch (err) {
      alert("Error: Failed to add category");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Category</h5>
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
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
