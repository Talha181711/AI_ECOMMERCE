import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost/AI_ECOMMERCE/php-backend/api/get_products.php"
      );
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(
          `http://localhost/AI_ECOMMERCE/php-backend/api/delete_product.php?id=${productId}`
        );
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Products</h2>
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={`http://localhost/AI_ECOMMERCE/php-backend/uploads/${product.images[0]?.image_url}`}
                className="card-img-top"
                alt={product.title}
                style={{ height: "auto", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <p className="h5">₹{product.price}</p>
                <div className="mb-2">
                  <strong>Category:</strong> {product.category_name}
                  <br />
                  <strong>Subcategory:</strong> {product.subcategory_name}
                  <br />
                  <strong>Brand:</strong> {product.brand_name}
                </div>
                <div className="variants-section">
                  <strong>Variants:</strong>
                  {product.variants.map((variant, index) => (
                    <div key={index} className="variant-item">
                      Color: {variant.color_name}, Size: {variant.size}, Stock:{" "}
                      {variant.stock}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-footer bg-white">
                <Link
                  to={`/edit-product/${product.id}`}
                  className="btn btn-primary btn-sm me-2"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewProducts;
