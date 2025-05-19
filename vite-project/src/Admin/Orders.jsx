import React, { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [lastDaysFilter, setLastDaysFilter] = useState("all");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [error, setError] = useState("");

  const fetchOrderStatuses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_order_statuses.php`,
        { withCredentials: true }
      );
      // console.log(response.data);
      if (response.data.status === "success") {
        setOrderStatuses([
          { id: "all", status_name: "All Statuses" },
          ...response.data.order_statuses,
        ]);
      } else {
        setError("Failed to load order statuses.");
      }
    } catch (err) {
      setError("Error fetching order statuses.");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_HOST_URL}/get_admin_orders.php`,
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data.status === "success") {
        setOrders(response.data.orders);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to fetch orders");
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.order_status_id.toString() === selectedStatus
      );
    }

    // Filter by date
    if (lastDaysFilter !== "all") {
      const days = parseInt(lastDaysFilter);
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const diffTime = now - orderDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= days;
      });
    }

    // Filter by Order ID search
    if (searchOrderId.trim() !== "") {
      filtered = filtered.filter((order) =>
        order.id.toString().includes(searchOrderId.trim())
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStatuses();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, lastDaysFilter, searchOrderId]);

  const handleDeleteOrder = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_HOST_URL}/delete_order.php?id=${id}`,
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

  return (
    <div className="orders-container">
      <h4>Manage Orders</h4>
      {error && <p className="text-danger">{error}</p>}

      {/* Filters */}
      <div className="d-flex mb-3 gap-3 flex-wrap">
        {/* Order Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="form-select"
        >
          {orderStatuses.map((statusObj) => (
            <option key={statusObj.id} value={statusObj.id}>
              {statusObj.status_name}
            </option>
          ))}
        </select>

        {/* Last X Days Filter */}
        <select
          value={lastDaysFilter}
          onChange={(e) => setLastDaysFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Dates</option>
          <option value="3">Last 3 Days</option>
          <option value="5">Last 5 Days</option>
          <option value="7">Last 7 Days</option>
          <option value="10">Last 10 Days</option>
        </select>

        {/* Order ID Search */}
        <input
          type="text"
          placeholder="Search by Order ID"
          className="form-control"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-left">
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Shipping Address:</strong> {order.shipping_address}
            </p>
            <p>
              <strong>Total:</strong> $
              {parseFloat(order.total_amount).toFixed(2)}
            </p>

            {order.items.map((item, index) => (
              <div key={index} className="d-flex mb-3 border-bottom pb-3">
                <img
                  src={`${import.meta.env.VITE_UPLOADS_HOST_URL}/${
                    item.product_image
                  }`}
                  alt={item.product_title}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="ms-3">
                  <h6>{item.product_title}</h6>
                  <p>
                    {item.color_name} / {item.size_name} × {item.quantity}
                  </p>
                  <p>Unit Price: ${item.unit_price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-right">
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Status:</strong> {order.order_status}
              {console.log(order.status_name)}
            </p>
            <div className="order-actions">
              <button
                className="btn btn-primary me-2"
                onClick={() => alert("Edit order")}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteOrder(order.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
