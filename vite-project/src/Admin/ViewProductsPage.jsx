import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewProductsPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost/AI_ECOMMERCE/php-backend/api/get_products.php"
        );
        if (response.data.status === "success") {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container">
      <h3>All Products</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
            <th>Brand</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.id}</td>
              <td>{prod.title}</td>
              <td>{prod.price}</td>
              <td>{prod.category_name}</td>
              <td>{prod.brand_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewProductsPage;
