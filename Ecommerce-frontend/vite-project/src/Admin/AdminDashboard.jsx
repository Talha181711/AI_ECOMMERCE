// src/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Categories from "./Categories";
import Subcategories from "./Subcategories";
import Brands from "./Brands";
import Products from "./Products";
import Orders from "./Orders";
import Colors from "./Colors";
import Sizes from "./Sizes";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("categories");
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const navigate = useNavigate();

  // Fetch admin details
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(
          "http://localhost/php-backend/api/get_admin_profile.php",
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (response.data.status === "success" && response.data.admin) {
          setAdmin(response.data.admin);
        } else {
          setError(response.data.message || "Failed to fetch admin details");
        }
      } catch (err) {
        setError("Failed to fetch admin details");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost/php-backend/api/admin_logout.php",
        {},
        { withCredentials: true }
      );
      setLogoutSuccess(true);
      setTimeout(() => {
        navigate("/admin/login");
      }, 1500);
    } catch (err) {
      setError("Logout failed");
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "categories":
        return <Categories />;
      case "subcategories":
        return <Subcategories />;
      case "brands":
        return <Brands />;
      case "products":
        return <Products />;
      case "orders":
        return <Orders />;
      case "colors":
        return <Colors />; // New case for managing colors
      case "sizes":
        return <Sizes />; // New case for managing sizes
      default:
        return <Categories />;
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid">
      {/* Header with admin details and logout */}
      <div className="row bg-light p-3 mb-3 align-items-center">
        <div className="col-md-8">
          {admin && (
            <div>
              <h4>Welcome, {admin.username}</h4>
              <p>{admin.email}</p>
            </div>
          )}
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2">
          <AdminSidebar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </div>
        {/* Content Area */}
        <div className="col-md-10">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
