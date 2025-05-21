import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrderCard from "./OrderCard";
import { FaBell } from "react-icons/fa";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_employee_profile.php`,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setEmployee(res.data.employee);
        fetchOrders(res.data.employee.role_name);
        fetchNotificationCount();
      } else {
        navigate("/employee/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/employee/login");
    }
  };

  const fetchOrders = async (role) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_orders_by_role.php?role=${role}`,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_notification_count.php`,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setNotificationCount(res.data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_notifications.php`,
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
        setNotificationCount(0);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleLogout = async () => {
    await axios.post(
      `${import.meta.env.VITE_HOST_URL}/employee_logout.php`,
      {},
      { withCredentials: true }
    );
    navigate("/employee/login");
  };

  const toggleDropdown = async () => {
    const newOpen = !dropdownOpen;
    setDropdownOpen(newOpen);
    if (newOpen) {
      await fetchNotifications();
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterOrders(term, statusFilter);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    filterOrders(searchTerm, status);
  };

  const filterOrders = (search, status) => {
    let updated = [...orders];

    if (search.trim() !== "") {
      updated = updated.filter((order) =>
        order.id.toString().includes(search.trim())
      );
    }

    if (employee?.role_name === "warehouse" && status !== "") {
      updated = updated.filter((order) => order.status === status);
    }

    setFilteredOrders(updated);
  };

  useEffect(() => {
    fetchProfile();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="container mt-4">
      {employee && (
        <>
          {/* Top bar */}
          <div className="d-flex justify-content-between align-items-center">
            <h3>
              Welcome, {employee.name} ({employee.role_name})
            </h3>

            <div className="d-flex align-items-center gap-3">
              {/* Notification Bell */}
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn btn-outline-secondary position-relative"
                  onClick={toggleDropdown}
                >
                  <FaBell />
                  {notificationCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {notificationCount}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    className="dropdown-menu show p-2"
                    style={{
                      right: 0,
                      left: "auto",
                      minWidth: "300px",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    <h6 className="dropdown-header d-flex justify-content-between align-items-center">
                      Notifications
                      {notifications.length > 0 && (
                        <button
                          className="btn btn-sm btn-link text-primary"
                          onClick={async () => {
                            await markAllAsRead();
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </h6>

                    {notifications.length === 0 ? (
                      <span className="dropdown-item text-muted">
                        No notifications
                      </span>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="dropdown-item small">
                          <div>{notif.message}</div>
                          <div className="text-muted small">
                            {notif.created_at}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <hr />

          {/* Search and Filter Controls */}
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {employee.role_name === "warehouse" && (
              <div className="col-md-6">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <option value="">Filter by Status</option>
                  <option value="pending">Pending</option>
                  <option value="packed">Packed</option>
                </select>
              </div>
            )}
          </div>

          {/* Order Cards */}
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                role={employee.role_name}
                fetchOrders={() => fetchOrders(employee.role_name)}
              />
            ))
          ) : (
            <p>No matching orders found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
