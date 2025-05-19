import React from "react";
import axios from "axios";

const OrderCard = ({ order, role, fetchOrders }) => {
  const statusOptions = {
    warehouse: [
      { id: 2, name: "Packed" },
      { id: 3, name: "Shipped" },
    ],
    delivery: [{ id: 4, name: "Delivered" }],
  };

  const updateStatus = async (status_id) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/update_order_status_employee.php`,
        {
          order_id: order.id,
          status_id,
        },
        { withCredentials: true }
      );
      console.log("Sending status update:", {
        order_id: order.id,
        status_id,
        role,
      });

      console.log("Update response:", res.data);

      if (res.data.status === "success") {
        fetchOrders(); // Refresh
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5>Order #{order.id}</h5>
        <p>
          Status: <strong>{order.status_name}</strong>
        </p>
        {statusOptions[role].map((option) => (
          <button
            key={option.id}
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => updateStatus(option.id)}
          >
            Mark as {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
