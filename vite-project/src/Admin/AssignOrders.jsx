import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignOrders = () => {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 5;

  useEffect(() => {
    fetchAssignData();
  }, []);

  const fetchAssignData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_delivery_employee_assignments.php`
      );
      console.log(res.data);
      setOrders(res.data.unassigned_orders || []);
      setAssignments(res.data.assignments || []);
      setEmployees(res.data.assignments || []); // employees are same as assignments
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const assignOrder = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/assign_order_to_employee.php`,
        {
          order_id: selectedOrder,
          employee_id: selectedEmployee,
        }
      );
      console.log(res.data);
      setMessage(res.data.message);
      setSelectedOrder("");
      setSelectedEmployee("");
      fetchAssignData(); // Refresh data
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const filteredAssignments = assignments.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * assignmentsPerPage;
  const indexOfFirst = indexOfLast - assignmentsPerPage;
  const currentAssignments = filteredAssignments.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);

  return (
    <div className="container mt-4">
      <h4>Assign Orders to Delivery Employees</h4>

      {message && <div className="alert alert-info mt-3">{message}</div>}

      <div className="mb-3">
        <label>Order:</label>
        <select
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
          className="form-control"
        >
          <option value="">Select Unassigned Order</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              #{order.id} - {order.order_status}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label>Employee:</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="form-control"
        >
          <option value="">Select Delivery Employee</option>
          {employees.map((emp) => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-primary mb-4"
        onClick={assignOrder}
        disabled={!selectedOrder || !selectedEmployee}
      >
        Assign Order
      </button>

      <hr />

      <h5>Delivery Employee Assignments</h5>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          className="form-control"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Assigned Orders</th>
          </tr>
        </thead>
        <tbody>
          {currentAssignments.length > 0 ? (
            currentAssignments.map((emp) => (
              <tr key={emp.employee_id}>
                <td>{emp.name}</td>
                <td>{emp.assigned_orders}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No matching employees found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${page === currentPage ? "active" : ""}`}
              >
                <button
                  onClick={() => setCurrentPage(page)}
                  className="page-link"
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default AssignOrders;
