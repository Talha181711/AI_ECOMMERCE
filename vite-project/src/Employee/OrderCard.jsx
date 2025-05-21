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
    <div className="card mb-4 shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Order #{order.id}</h5>
        <span className="badge bg-secondary">{order.status_name}</span>
      </div>

      <div className="card-body">
        <p>
          <strong>Customer:</strong> {order.customer_name}
        </p>
        <p>
          <strong>Email:</strong> {order.customer_email}
        </p>
        <p>
          <strong>Phone:</strong> {order.customer_phone}
        </p>
        <p>
          <strong>Shipping Address:</strong> {order.shipping_address}
        </p>
        {order.order_notes && (
          <p>
            <strong>Order Notes:</strong> {order.order_notes}
          </p>
        )}
        <p>
          <strong>Order Date:</strong> {order.created_at}
        </p>
        <p>
          <strong>Total:</strong> Rs. {order.total_amount}
        </p>

        <hr />
        <h6>Items:</h6>
        {order.items && order.items.length > 0 ? (
          <ul className="list-group">
            {order.items.map((item) => (
              <li key={item.id} className="list-group-item">
                <div className="d-flex align-items-center">
                  <img
                    src={`${import.meta.env.VITE_UPLOADS_HOST_URL}/${
                      item.product_image
                    }`}
                    alt={item.product_title}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      marginRight: "15px",
                    }}
                  />
                  <div>
                    <h6>{item.product_title}</h6>
                    <p className="mb-1">
                      <strong>Color:</strong> {item.color_name} &nbsp;|&nbsp;
                      <strong>Size:</strong> {item.size_name}
                    </p>
                    <p className="mb-1">
                      <strong>Qty:</strong> {item.quantity} &nbsp;|&nbsp;
                      <strong>Price:</strong> Rs. {item.unit_price}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items found in this order.</p>
        )}
      </div>

      {statusOptions[role] && (
        <div className="card-footer">
          {statusOptions[role].map((option) => (
            <button
              key={option.id}
              className="btn btn-outline-primary btn-sm me-2"
              onClick={() => updateStatus(option.id)}
            >
              Mark as {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
