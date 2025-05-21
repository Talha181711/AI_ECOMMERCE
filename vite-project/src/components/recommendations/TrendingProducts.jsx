import React, { useEffect, useState, useContext } from "react";
import ProductCard from "../../components/ProductCard";
import { AuthContext } from "../../context/AuthContext";

export default function TrendingProducts() {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const productsPerView = 4;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        let url = `${import.meta.env.VITE_HOST_URL}/trending_products.php`;
        if (currentUser && currentUser.id) {
          url += `?user_id=${currentUser.id}`;
        } else {
          const guestViews = JSON.parse(
            localStorage.getItem("viewed_products") || "[]"
          );
          url += `?guest_views=${guestViews.join(",")}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          console.error("Failed to fetch trending products:", data.message);
        }
      } catch (err) {
        console.error("Trending fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [currentUser]);

  const next = () => {
    setVisibleIndex((prev) =>
      Math.min(prev + 1, products.length - productsPerView)
    );
  };

  const prev = () => {
    setVisibleIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* <h4 className="mb-0">🔥 Trending Products</h4> */}
        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={prev}
            disabled={visibleIndex === 0}
          >
            &laquo; Prev
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={next}
            disabled={visibleIndex >= products.length - productsPerView}
          >
            Next &raquo;
          </button>
        </div>
      </div>

      {loading ? (
        <div className="row">
          {[...Array(productsPerView)].map((_, idx) => (
            <div key={idx} className="col-6 col-md-3 mb-4">
              <div
                className="card placeholder-glow"
                style={{ height: "400px" }}
              >
                <div className="card-body">
                  <span
                    className="placeholder col-12"
                    style={{ height: "250px", display: "block" }}
                  ></span>
                  <span className="placeholder col-6 my-3"></span>
                  <span className="placeholder col-8"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {products
            .slice(visibleIndex, visibleIndex + productsPerView)
            .map((product) => (
              <div key={product.id} className="col-6 col-md-3 mb-4">
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
