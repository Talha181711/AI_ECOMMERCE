// src/Admin/AdminNotifications.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa"; // Updated icon import

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const fetchNotifications = async () => {
    try {
      console.log("Fetching admin notifications...");
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_admin_notifications.php`,
        {
          withCredentials: true,
        }
      );

      if (res.data.status === "success") {
        console.log("Notifications fetched:", res.data.notifications);
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(
          (n) => parseInt(n.read_status) === 0
        ).length;
        setUnreadCount(unread);
      } else {
        console.warn("Unexpected response structure:", res.data);
        // Optional: Show user-friendly error
        // toast.error("Unable to load notifications");
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);

      // Check for specific errors
      if (err.response) {
        console.error("Server responded with error:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }

      // Optional: Show user-friendly error
      // toast.error("Error fetching notifications. Please try again.");
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read...");

      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/mark_admin_notifications_read.php`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Mark as read response:", res.data);

      if (res.data.status === "success") {
        setUnreadCount(0);
        fetchNotifications();
      } else {
        console.warn(
          "Unexpected response when marking notifications:",
          res.data
        );
        // toast.error("Could not mark notifications as read");
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);

      if (err.response) {
        console.error("Server responded with error:", err.response.data);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Error setting up request:", err.message);
      }

      // toast.error("Failed to update notifications. Try again.");
    }
  };

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // refresh every 30 seconds

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="position-relative d-inline-block me-3" ref={dropdownRef}>
      <button
        className="btn btn-outline-dark position-relative"
        onClick={handleToggleDropdown}
      >
        <FaBell size={20} /> {/* Updated icon usage */}
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu show mt-2 p-3 shadow border rounded"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            minWidth: "300px",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 1000,
            backgroundColor: "#fff",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Notifications</h6>
            {notifications.length > 0 && (
              <button className="btn btn-sm btn-link" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-muted small">No notifications.</p>
          ) : (
            <ul className="list-group">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`list-group-item small ${
                    n.read_status === "0" ? "fw-bold" : ""
                  }`}
                >
                  {n.message}
                  <div className="text-muted small">{n.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
