import React, { useState, useEffect } from "react";
import axios from "axios";

const AddEmployee = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_HOST_URL}/get_employee_roles.php`
        );
        console.log(res.data);
        if (res.data.status === "success") {
          setRoles(res.data.roles);
          if (res.data.roles.length > 0) {
            setFormData((prev) => ({ ...prev, role_id: res.data.roles[0].id }));
          }
        }
      } catch (err) {
        setError("Failed to load roles");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("Submitting:", formData);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/add_employee.php`,
        JSON.stringify(formData), // make sure it's JSON string
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response);

      if (response.data.status === "success") {
        setSuccess("Employee added successfully");
        if (typeof onEmployeeAdded === "function") {
          onEmployeeAdded();
        }

        setFormData({
          name: "",
          email: "",
          password: "",
          role_id: "", // Reset
        });
        return;
      } else {
        setError(response.data.message || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error caught:", err); // This will show exact cause
      setError("Failed to add employee");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h5>Add New Employee</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Name"
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Password"
        required
      />
      <select
        name="role_id"
        value={formData.role_id}
        onChange={handleChange}
        className="form-control mb-3"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.role_name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">
        Add Employee
      </button>
    </form>
  );
};

export default AddEmployee;
