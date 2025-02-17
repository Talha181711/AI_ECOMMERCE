// src/Admin/modals/AddBrandModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddBrandModal = ({ onClose, onAdded }) => {
  const [brandName, setBrandName] = useState("");

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        "http://localhost/php-backend/api/add_brand.php",
        { brand_name: brandName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onAdded(); // Refresh the brands list in the parent
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to add brand"));
      }
    } catch (err) {
      alert("Error: Failed to add brand");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Brand</h5>
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
              placeholder="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBrandModal;
