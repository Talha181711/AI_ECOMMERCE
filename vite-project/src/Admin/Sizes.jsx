// src/Admin/Sizes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddSizeModal from "./modals/AddSizeModal";
import EditSizeModal from "./modals/EditSizeModal";

const Sizes = () => {
  const [sizes, setSizes] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSize, setEditingSize] = useState(null);

  const fetchSizes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_sizes.php`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setSizes(response.data.sizes);
      } else {
        setError(response.data.message || "Failed to fetch sizes");
      }
    } catch (err) {
      setError("Failed to fetch sizes");
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleDeleteSize = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_HOST_URL}/delete_size.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchSizes();
      } else {
        setError(response.data.message || "Failed to delete size");
      }
    } catch (err) {
      setError("Failed to delete size");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Sizes</h4>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Size
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size.id}>
              <td>{size.id}</td>
              <td>{size.size}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setEditingSize(size)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteSize(size.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddSizeModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchSizes}
        />
      )}
      {editingSize && (
        <EditSizeModal
          size={editingSize}
          onClose={() => setEditingSize(null)}
          onUpdated={fetchSizes}
        />
      )}
    </div>
  );
};

export default Sizes;
