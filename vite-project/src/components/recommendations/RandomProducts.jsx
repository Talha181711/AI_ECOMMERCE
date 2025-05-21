import React, { useEffect, useState } from "react";
import ProductCard from "../ProductCard";

const RandomProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchRandom = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_HOST_URL}/random_products.php`
      );
      const data = await res.json();
      if (data.success) setProducts(data.products);
    };

    fetchRandom();
  }, []);

  return (
    <div>
      <h4>Recommended for You</h4>
      <div className="row">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RandomProducts;
