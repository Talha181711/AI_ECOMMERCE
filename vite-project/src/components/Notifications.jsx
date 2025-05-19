import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_notifications.php`,
        { withCredentials: true }
      );

      console.log("📦 Raw response:", res.data);

      if (res.data.status === "success") {
        const notifs = res.data.notifications || [];
        console.log("🔔 Notifications:", notifs);

        const unread = notifs.filter(
          (n) => n.is_read === "0" || n.is_read === 0
        ).length;

        console.log("🔴 Unread count:", unread);

        setNotifications(notifs);
        setUnreadCount(unread);
      } else {
        console.error("⚠️ Error loading notifications:", res.data.message);
      }
    } catch (error) {
      console.error("❌ Axios error during fetch:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/mark_notifications_read.php`,
        {},
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        await fetchNotifications(); // Refresh after marking as read
      }
    } catch (error) {
      console.error("❌ Failed to mark notifications as read", error);
    }
  };

  const toggleDropdown = async () => {
    const willOpen = !showDropdown;
    setShowDropdown(willOpen);

    // Fetch notifications fresh every time dropdown is opened
    if (willOpen) {
      await fetchNotifications();
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // auto-refresh

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="position-relative d-inline-block" ref={dropdownRef}>
      <button
        className="btn btn-outline-secondary position-relative"
        onClick={toggleDropdown}
      >
        <FaBell size={20} />
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
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link text-primary"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-muted small">No notifications.</p>
          ) : (
            <ul className="list-group">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`list-group-item small ${
                    parseInt(notif.is_read) === 0 ? "fw-bold" : ""
                  }`}
                >
                  {notif.message}
                  <div className="text-muted small">{notif.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
