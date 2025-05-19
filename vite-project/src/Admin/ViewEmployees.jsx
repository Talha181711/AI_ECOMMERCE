// ViewEmployees.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EditEmployeeModal from "./EditEmployeeModal";

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_employee.php`
      );
      setEmployees(res.data.employees || []);
    };
    fetchEmployees();
  }, [reload]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await axios.post(`${import.meta.env.VITE_HOST_URL}/delete_employee.php`, {
        id,
      });
      setReload(!reload);
    }
  };

  return (
    <div className="mt-4">
      <h5>All Employees</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(emp.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => {
            setSelectedEmployee(null);
            setReload(!reload);
          }}
        />
      )}
    </div>
  );
};

export default ViewEmployees;
