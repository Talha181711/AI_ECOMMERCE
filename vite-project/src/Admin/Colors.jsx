// src/Admin/Colors.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddColorModal from "./modals/AddColorModal";
import EditColorModal from "./modals/EditColorModal";

const Colors = () => {
  const [colors, setColors] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingColor, setEditingColor] = useState(null);

  const fetchColors = async () => {
    try {
      const response = await axios.get(
        "http://localhost/php-backend/api/get_colors.php",
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setColors(response.data.colors);
      } else {
        setError(response.data.message || "Failed to fetch colors");
      }
    } catch (err) {
      setError("Failed to fetch colors");
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleDeleteColor = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost/php-backend/api/delete_color.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchColors();
      } else {
        setError(response.data.message || "Failed to delete color");
      }
    } catch (err) {
      setError("Failed to delete color");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Colors</h4>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Color
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Color Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color.id}>
              <td>{color.id}</td>
              <td>{color.color_name}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setEditingColor(color)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteColor(color.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddColorModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchColors}
        />
      )}
      {editingColor && (
        <EditColorModal
          color={editingColor}
          onClose={() => setEditingColor(null)}
          onUpdated={fetchColors}
        />
      )}
    </div>
  );
};

export default Colors;
