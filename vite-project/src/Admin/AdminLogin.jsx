// src/Admin/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await axios.post(
        "http://localhost/php-backend/api/admin-login.php",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const data = response.data;
      if (data.status === "success") {
        setSuccessMessage("Admin login successful!");
        // Navigate to the AdminDashboard page after a short delay (e.g., 1 second)
        setTimeout(() => {
          navigate("/adminDashboard"); // Corrected route (no wildcard)
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login as Admin</button>
      </form>
    </div>
  );
};

export default AdminLogin;
