import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const UserProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [selectedTab, setSelectedTab] = useState("personal");

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
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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

      <div className="row">
        <div className="col-md-3">
          <ul className="list-group">
            {["personal", "addresses", "orders", "wishlist", "cart"].map(
              (tab) => (
                <li
                  key={tab}
                  className={`list-group-item ${
                    selectedTab === tab ? "active" : ""
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="col-md-9">
          {selectedTab === "personal" && (
            <div>
              <h3>Personal Information</h3>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Operations</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{profileData.user.username}</td>
                    <td>{profileData.user.email}</td>
                    <td>{profileData.user.created_at}</td>
                    <td>
                      <FaEdit className="text-dark me-2" />
                      <FaTrash className="text-danger" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {["addresses", "orders", "wishlist", "cart"].map(
            (tab) =>
              selectedTab === tab && (
                <div key={tab}>
                  <h3>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        {tab === "addresses" &&
                          ["Street", "City", "State", "Zip", "Operations"].map(
                            (col) => <th key={col}>{col}</th>
                          )}
                        {tab === "orders" &&
                          [
                            "Order ID",
                            "Status",
                            "Total Amount",
                            "Order Date",
                            "Operations",
                          ].map((col) => <th key={col}>{col}</th>)}
                        {["wishlist", "cart"].includes(tab) &&
                          ["Product Name", "Price", "Operations"].map((col) => (
                            <th key={col}>{col}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {profileData[tab] && profileData[tab].length > 0 ? (
                        profileData[tab].map((item, index) => (
                          <tr key={index}>
                            {tab === "addresses" && (
                              <>
                                <td>{item.street}</td>
                                <td>{item.city}</td>
                                <td>{item.state}</td>
                                <td>{item.zip}</td>
                              </>
                            )}
                            {tab === "orders" && (
                              <>
                                <td>{item.id}</td>
                                <td>{item.status}</td>
                                <td>${item.total_amount}</td>
                                <td>{item.created_at}</td>
                              </>
                            )}
                            {["wishlist", "cart"].includes(tab) && (
                              <>
                                <td>{item.product_name}</td>
                                <td>${item.price}</td>
                              </>
                            )}
                            <td>
                              <FaEdit className="text-dark me-2" />
                              <FaTrash className="text-danger" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )
          )}
        </div>
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
