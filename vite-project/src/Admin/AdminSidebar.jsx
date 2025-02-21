// src/Admin/AdminSidebar.jsx
import React from "react";

const AdminSidebar = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="list-group">
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "categories" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("categories")}
      >
        Manage Categories
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "subcategories" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("subcategories")}
      >
        Manage Subcategories
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "brands" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("brands")}
      >
        Manage Brands
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "products" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("products")}
      >
        Manage Products
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "orders" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("orders")}
      >
        Manage Orders
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "colors" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("colors")}
      >
        Manage Colors
      </button>
      <button
        type="button"
        className={`list-group-item list-group-item-action ${
          selectedTab === "sizes" ? "active" : ""
        }`}
        onClick={() => setSelectedTab("sizes")}
      >
        Manage Sizes
      </button>
    </div>
  );
};

export default AdminSidebar;
