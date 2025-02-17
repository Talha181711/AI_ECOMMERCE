// src/Admin/Subcategories.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddSubcategoryModal from "./modals/AddSubcategoryModal";
import EditSubcategoryModal from "./modals/EditSubcategoryModal";

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const fetchSubcategories = async () => {
    try {
      // This endpoint returns all subcategories along with their parent category name.
      const response = await axios.get(
        "http://localhost/php-backend/api/get_subcategories.php",
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setSubcategories(response.data.subcategories);
      } else {
        setError(response.data.message || "Failed to fetch subcategories");
      }
    } catch (err) {
      setError("Failed to fetch subcategories");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost/php-backend/api/get_categories.php",
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setCategories(response.data.categories);
      } else {
        setError(response.data.message || "Failed to fetch categories");
      }
    } catch (err) {
      setError("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const handleDeleteSubcategory = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost/php-backend/api/delete_subcategory.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchSubcategories();
      } else {
        setError(response.data.message || "Failed to delete subcategory");
      }
    } catch (err) {
      setError("Failed to delete subcategory");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Subcategories</h4>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Subcategory
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Parent Category</th>
            <th>Subcategory Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subcategories.map((subcat) => (
            <tr key={subcat.id}>
              <td>{subcat.id}</td>
              <td>{subcat.category_name}</td>
              <td>{subcat.subcategory_name}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setEditingSubcategory(subcat)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteSubcategory(subcat.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddSubcategoryModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchSubcategories}
          categories={categories}
        />
      )}
      {editingSubcategory && (
        <EditSubcategoryModal
          subcategory={editingSubcategory}
          onClose={() => setEditingSubcategory(null)}
          onUpdated={fetchSubcategories}
        />
      )}
    </div>
  );
};

export default Subcategories;
