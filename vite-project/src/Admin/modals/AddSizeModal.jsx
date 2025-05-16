// src/Admin/modals/AddSizeModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddSizeModal = ({ onClose, onAdded }) => {
  const [sizeValue, setSizeValue] = useState("");

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/add_size.php`,
        { size: sizeValue },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onAdded();
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to add size"));
      }
    } catch (err) {
      alert("Error: Failed to add size");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Size</h5>
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
              placeholder="Size"
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSizeModal;
