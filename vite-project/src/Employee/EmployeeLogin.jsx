import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/employee_login.php`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // ✅ VERY IMPORTANT for PHP sessions
        }
      );

      console.log(res.data);
      if (res.data.status === "success") {
        navigate("/employee/dashboard");
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Login failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Employee Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <input
        type="email"
        className="form-control mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="form-control mb-3"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default EmployeeLogin;
