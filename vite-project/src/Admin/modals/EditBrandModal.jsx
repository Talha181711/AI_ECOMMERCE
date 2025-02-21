// src/Admin/modals/EditBrandModal.jsx
import React, { useState } from "react";
import axios from "axios";

const EditBrandModal = ({ brand, onClose, onUpdated }) => {
  const [brandName, setBrandName] = useState(brand.brand_name);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        "http://localhost/php-backend/api/update_brand.php",
        { id: brand.id, brand_name: brandName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onUpdated(); // Refresh the brands list in the parent
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to update brand"));
      }
    } catch (err) {
      alert("Error: Failed to update brand");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Brand</h5>
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
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Update Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBrandModal;
