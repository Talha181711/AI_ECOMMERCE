import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignOrders = () => {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_HOST_URL}/get_admin_orders.php`
    );
    console.log(res.data);
    setOrders(res.data.orders || []);
  };

  const fetchEmployees = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_HOST_URL}/get_employee.php`
    );
    console.log(res.data);
    setEmployees(res.data.employees || []);
  };

  const assignOrder = async () => {
    const res = await axios.post(
      `${import.meta.env.VITE_HOST_URL}/assign_order_to_employee.php`,
      {
        order_id: selectedOrder,
        employee_id: selectedEmployee,
      }
    );
    console.log(res.data);

    setMessage(res.data.message);
    fetchOrders(); // Refresh
  };

  return (
    <div>
      <h4>Assign Orders to Employees</h4>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="mb-3">
        <label>Order:</label>
        <select
          onChange={(e) => setSelectedOrder(e.target.value)}
          className="form-control"
        >
          <option value="">Select Order</option>
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
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="form-control"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.role_name})
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-primary"
        onClick={assignOrder}
        disabled={!selectedOrder || !selectedEmployee}
      >
        Assign Order
      </button>
    </div>
  );
};

export default AssignOrders;
