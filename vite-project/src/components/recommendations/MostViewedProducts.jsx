import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../ProductCard";
import { AuthContext } from "../../context/AuthContext";

const MostViewedProducts = () => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchMostViewed = async () => {
      const endpoint = currentUser
        ? `${import.meta.env.VITE_HOST_URL}/most_viewed.php`
        : `${import.meta.env.VITE_HOST_URL}/most_viewed.php?guest=true`;
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.success) setProducts(data.products);
    };

    fetchMostViewed();
  }, [currentUser]);

  return (
    <div>
      <h4>Most Viewed</h4>
      <div className="row">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default MostViewedProducts;
