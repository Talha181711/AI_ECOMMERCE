// src/Admin/Brands.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddBrandModal from "./modals/AddBrandModal";
import EditBrandModal from "./modals/EditBrandModal";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(
        "http://localhost/php-backend/api/get_brands.php",
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setBrands(response.data.brands);
      } else {
        setError(response.data.message || "Failed to fetch brands");
      }
    } catch (err) {
      setError("Failed to fetch brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDeleteBrand = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost/php-backend/api/delete_brand.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchBrands();
      } else {
        setError(response.data.message || "Failed to delete brand");
      }
    } catch (err) {
      setError("Failed to delete brand");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Brands</h4>
        <button
          className="btn btn-sm btn-success"
          onClick={() => setShowAddModal(true)}
        >
          Add New Brand
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Brand Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.id}</td>
              <td>{brand.brand_name}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setEditingBrand(brand)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteBrand(brand.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddModal && (
        <AddBrandModal
          onClose={() => setShowAddModal(false)}
          onAdded={fetchBrands}
        />
      )}
      {editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          onClose={() => setEditingBrand(null)}
          onUpdated={fetchBrands}
        />
      )}
    </div>
  );
};

export default Brands;
