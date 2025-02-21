// src/Admin/modals/EditSizeModal.jsx
import React, { useState } from "react";
import axios from "axios";

const EditSizeModal = ({ size, onClose, onUpdated }) => {
  const [sizeValue, setSizeValue] = useState(size.size);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        "http://localhost/AI_ECOMMERCE/php-backend/api/update_size.php",
        { id: size.id, size: sizeValue },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onUpdated();
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to update size"));
      }
    } catch (err) {
      alert("Error: Failed to update size");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Size</h5>
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
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Update Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSizeModal;
