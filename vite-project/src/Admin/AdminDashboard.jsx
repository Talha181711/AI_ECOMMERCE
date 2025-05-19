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
import AddEmployee from "./AddEmployee";
import ViewEmployees from "./ViewEmployees";
import AssignOrders from "./AssignOrders";
import AdminNotifications from "./AdminNotifications";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("categories");
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  // 🛎️ Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  // 🔔 Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_admin_notifications.php`,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(
          (n) => n.read_status === 0
        );
        setUnreadCount(unread.length);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_HOST_URL}/mark_admin_notifications_read.php`,
        {},
        { withCredentials: true }
      );
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // 🧑‍💼 Fetch admin details
  const fetchAdmin = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_admin_profile.php`,
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

  useEffect(() => {
    fetchNotifications();
    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_HOST_URL}/admin_logout.php`,
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
        return <Colors />;
      case "sizes":
        return <Sizes />;
      case "add-employee":
        return <AddEmployee />;
      case "view-employees":
        return <ViewEmployees />;
      case "assign-orders":
        return <AssignOrders />;
      default:
        return <Categories />;
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row bg-light p-3 mb-3 align-items-center">
        <div className="col-md-8">
          {admin && (
            <div>
              <h4>Welcome, {admin.username}</h4>
              <p>{admin.email}</p>
            </div>
          )}
        </div>
        <div className="col-md-4 text-end d-flex justify-content-end align-items-center gap-3">
          <AdminNotifications
            notifications={notifications}
            unreadCount={unreadCount}
            showDropdown={showDropdown}
            toggleDropdown={toggleDropdown}
          />
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="row">
        <div className="col-lg-2 mb-md-5">
          <AdminSidebar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </div>
        <div className="col-lg-10">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
