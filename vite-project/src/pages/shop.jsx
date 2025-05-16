// src/pages/Shop.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Pagination from "../components/Pagination.jsx";

export default function Shop() {
  const [filter, setFilter] = useState({
    categoryId: null,
    subcategoryId: null,
  });
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_HOST_URL}/get_products.php`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProducts(data.products);
        else console.error("get_products error:", data.message);
      })
      .catch((err) => console.error("Fetch products failed:", err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filtered = products.filter((p) => {
    if (filter.subcategoryId) return p.subcategory_id === filter.subcategoryId;
    if (filter.categoryId) return p.category_id === filter.categoryId;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // console.log("Filtered Products:", filtered);

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar onSelectFilter={setFilter} />

        <main className="col-md-9">
          <h2 className="my-4">Shop</h2>
          <div className="row">
            {paginated.map((prod) => {
              // console.log(prod); // 👈 Logs each product object
              return (
                <div key={prod.id} className="col-6 col-lg-4 mb-4">
                  <ProductCard product={prod} />
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
}
