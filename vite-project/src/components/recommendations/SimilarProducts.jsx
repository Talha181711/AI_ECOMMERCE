import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../ProductCard";
import { AuthContext } from "../../context/AuthContext";

const SimilarProducts = ({ productId }) => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      const endpoint = currentUser
        ? `${
            import.meta.env.VITE_HOST_URL
          }/similar_products.php?product_id=${productId}`
        : `${
            import.meta.env.VITE_HOST_URL
          }/similar_products.php?guest=true&product_id=${productId}`;

      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.success) setProducts(data.products);
    };

    if (productId) fetchSimilar();
  }, [productId, currentUser]);

  return (
    <div>
      <h4>Similar Products</h4>
      <div className="row">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
