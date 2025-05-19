import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle } from "react-icons/fa";

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_URL}/get_user_profile.php`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (response.data.status === "success") {
          setProfileData(response.data);
          setFormData({
            username: response.data.user.username,
            email: response.data.user.email,
          });
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch profile data");
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_URL}/get_user_orders.php`,
          {
            withCredentials: true,
          }
        );
        console.log(response.data);
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          console.warn("Orders not found");
        }
      } catch (err) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    setShowModal(false);
    setTimeout(async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_HOST_URL}/logout.php`,
          {},
          { withCredentials: true }
        );
        if (response.data.status === "success") {
          setLogoutSuccess(true);
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch (err) {
        console.error("Logout error!");
      }
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/update_user_profile.php`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.data.status === "success") {
        setProfileData((prevData) => ({
          ...prevData,
          user: {
            ...prevData.user,
            username: formData.username,
            email: formData.email,
          },
        }));
        setIsEditing(false);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to update profile data");
    }
  };

  if (loading)
    return <div className="text-center mt-5">Loading profile...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profileData) return null;

  return (
    <div className="container mt-4">
      {logoutSuccess && (
        <div className="alert alert-success text-center">
          <FaCheckCircle className="text-success me-2" /> Logged out
          successfully!
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Profile</h2>
        <button className="btn btn-danger" onClick={() => setShowModal(true)}>
          Logout
        </button>
      </div>

      <div className="mb-4">
        <h4>Personal Information</h4>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleInputChange}
            />
          ) : (
            <p>{profileData.user.username}</p>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
            />
          ) : (
            <p>{profileData.user.email}</p>
          )}
        </div>
        {isEditing ? (
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div>
        <h4>Order History</h4>
        {orders.length > 0 ? (
          <div className="d-flex flex-column gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-light rounded shadow-sm position-relative"
              >
                <div className="position-absolute top-0 end-0 mb-5 text-muted small">
                  Order Date: {new Date(order.created_at).toLocaleDateString()}
                </div>

                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start mb-3 border-bottom pb-3"
                  >
                    <img
                      src={`${import.meta.env.VITE_UPLOADS_HOST_URL}/${
                        item.product_image
                      }`}
                      alt={item.product_title}
                      className="me-3 rounded"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.product_title}</h6>
                      <p className="mb-1 order-history-detail">
                        Color: <strong>{item.color_name}</strong>
                      </p>
                      <p className="mb-1 order-history-detail">
                        Size: <strong>{item.size_name}</strong>
                      </p>
                      <p className="mb-1 order-history-detail">
                        Unit Price: <strong>${item.unit_price}</strong>
                      </p>
                      <p className="mb-1 order-history-detail">
                        Quantity: <strong>{item.quantity}</strong>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="fw-bold mb-0">
                        Subtotal: $
                        {(item.unit_price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="text-end mt-3">
                  <span className="badge bg-secondary me-2">
                    Status: {order.order_status}
                  </span>
                  <span className="fw-bold">
                    Total: ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h4>Are you sure you want to log out?</h4>
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
