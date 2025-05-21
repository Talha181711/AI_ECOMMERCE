import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard";

const PopularProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchPopular = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_HOST_URL}/popular_products.php`
      );
      const data = await res.json();
      if (data.success) setProducts(data.products);
    };

    fetchPopular();
  }, []);

  return (
    <div>
      <h4>Popular Products</h4>
      <div className="row">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;
