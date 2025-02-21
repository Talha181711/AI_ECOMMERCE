// src/Admin/Categories.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddCategoryModal from "./modals/AddCategoryModal";
import EditCategoryModal from "./modals/EditCategoryModal";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost/AI_ECOMMERCE/php-backend/api/get_categories.php",
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
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost/AI_ECOMMERCE/php-backend/api/delete_category.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchCategories();
      } else {
        setError(response.data.message || "Failed to delete category");
      }
    } catch (err) {
      setError("Failed to delete category");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Categories</h4>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Category
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.category_name}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setEditingCategory(cat)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchCategories}
        />
      )}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={fetchCategories}
        />
      )}
    </div>
  );
};

export default Categories;
