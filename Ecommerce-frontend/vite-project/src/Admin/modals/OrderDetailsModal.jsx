// src/Admin/modals/OrderDetailsModal.jsx
import React from "react";

const OrderDetailsModal = ({ onClose, orderDetails }) => {
  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Order Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {orderDetails && orderDetails.length > 0 ? (
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Product ID</th>
                    <th>Title</th>
                    <th>Image</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.product_id}</td>
                      <td>{item.product_title}</td>
                      <td>
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_title}
                            width="50"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.unit_price}</td>
                      <td>{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No order details available.</p>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
