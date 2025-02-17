import React from "react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h3>Product Management</h3>
      <div className="d-flex gap-3 mt-3">
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/add-product")}
        >
          Add Product
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/view-products")}
        >
          View All Products
        </button>
      </div>
    </div>
  );
};

export default Products;
