// src/Admin/modals/EditSubcategoryModal.jsx
import React, { useState } from "react";
import axios from "axios";

const EditSubcategoryModal = ({ subcategory, onClose, onUpdated }) => {
  const [subcategoryName, setSubcategoryName] = useState(
    subcategory.subcategory_name
  );

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_HOST_URL}/update_subcategory.php`,
        { id: subcategory.id, subcategory_name: subcategoryName },
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        onUpdated(); // Refresh subcategory list in parent
        onClose();
      } else {
        alert(
          "Error: " + (response.data.message || "Failed to update subcategory")
        );
      }
    } catch (err) {
      alert("Error: Failed to update subcategory");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Subcategory</h5>
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
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdate}>
              Update Subcategory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSubcategoryModal;
