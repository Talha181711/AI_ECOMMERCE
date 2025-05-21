import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../ProductCard";
import { AuthContext } from "../../context/AuthContext";

const RecentlyViewed = () => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchRecently = async () => {
      let url = `${import.meta.env.VITE_HOST_URL}/recently_viewed.php`;
      let body = null;

      if (!currentUser) {
        const guestViews = JSON.parse(
          localStorage.getItem("recent_views") || "[]"
        );
        url += "?guest=true";
        body = JSON.stringify({ product_ids: guestViews.map((v) => v.id) });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        ...(body && { body }),
      });

      const data = await response.json();
      if (data.success) setProducts(data.products);
    };

    fetchRecently();
  }, [currentUser]);

  return (
    <div>
      <h4>Recently Viewed</h4>
      <div className="row">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
