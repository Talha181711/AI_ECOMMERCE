// EditEmployeeModal.jsx
import React, { useState } from "react";
import axios from "axios";

const EditEmployeeModal = ({ employee, onClose }) => {
  const [formData, setFormData] = useState({ ...employee });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_HOST_URL}/update_employee.php`,
        formData
      );
      onClose();
    } catch (err) {
      setError("Failed to update employee");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Employee</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control mb-2"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control mb-2"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control mb-2"
              >
                <option value="warehouse">Warehouse</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
