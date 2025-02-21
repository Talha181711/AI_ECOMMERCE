// src/Admin/Orders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderDetailsModal from "./modals/OrderDetailsModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost/php-backend/api/get_orders.php",
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setOrders(response.data.orders);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost/php-backend/api/delete_order.php?id=${id}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        fetchOrders();
      } else {
        setError(response.data.message || "Failed to delete order");
      }
    } catch (err) {
      setError("Failed to delete order");
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await axios.get(
        `http://localhost/php-backend/api/get_order_details.php?id=${orderId}`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setSelectedOrderDetails(response.data.order_items);
        setShowDetailsModal(true);
      } else {
        setError(response.data.message || "Failed to fetch order details");
      }
    } catch (err) {
      setError("Failed to fetch order details");
    }
  };

  return (
    <div>
      <h4>Manage Orders</h4>
      {error && <p className="text-danger">{error}</p>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order Date</th>
            <th>User ID</th>
            <th>Shipping Address</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.order_date}</td>
              <td>{order.user_id}</td>
              <td>{order.shipping_address}</td>
              <td>{order.order_status}</td>
              <td>{order.total_amount}</td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => handleViewDetails(order.id)}
                >
                  View Details
                </button>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => console.log(`Edit order ${order.id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDetailsModal && (
        <OrderDetailsModal
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrderDetails(null);
          }}
          orderDetails={selectedOrderDetails}
        />
      )}
    </div>
  );
};

export default Orders;
