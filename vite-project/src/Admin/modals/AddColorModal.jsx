// src/Admin/modals/AddColorModal.jsx
import React, { useState } from "react";
import axios from "axios";

const AddColorModal = ({ onClose, onAdded }) => {
  const [colorName, setColorName] = useState("");

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/add_color.php`,
        { color_name: colorName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onAdded();
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to add color"));
      }
    } catch (err) {
      alert("Error: Failed to add color");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Color</h5>
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
              placeholder="Color Name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddColorModal;
