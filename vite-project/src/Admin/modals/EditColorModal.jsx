import React, { useState, useEffect } from "react";
import axios from "axios";

const EditColorModal = ({ color, onClose, onUpdated }) => {
  const [colorName, setColorName] = useState(color.color_name);

  useEffect(() => {
    setColorName(color.color_name); // Ensure the color name is updated when color prop changes
  }, [color]);

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        "http://localhost/AI_ECOMMERCE/php-backend/api/update_color.php",
        { id: color.id, color_name: colorName },
        { withCredentials: true }
      );
      console.log("Response:", response); // Log the response to check its contents
      if (response.data.status === "success") {
        onUpdated();
        onClose();
      } else {
        alert("Error: " + (response.data.message || "Failed to update color"));
      }
    } catch (err) {
      console.error("Error details:", err); // Log the error details to the console
      alert("Error: Failed to update color. See console for details.");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Color</h5>
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
              value={colorName}
              onChange={(e) => setColorName(e.target.value)} // Ensure this is updating the state
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Update Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditColorModal;
