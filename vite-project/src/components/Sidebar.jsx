// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";

export default function Sidebar({ onSelectFilter }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_HOST_URL}/get_categories.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== "success") {
          console.error("get_categories error:", data.message);
          return;
        }
        const cats = data.categories;
        Promise.all(
          cats.map((cat) =>
            fetch(
              `${
                import.meta.env.VITE_HOST_URL
              }/get_subcategories.php?category_id=${cat.id}`
            )
              .then((r) => r.json())
              .then((sd) => (sd.status === "success" ? sd.subcategories : []))
          )
        ).then((allSubs) => {
          const catsWithSubs = cats.map((cat, idx) => ({
            id: cat.id,
            name: cat.category_name,
            subcategories: allSubs[idx].map((s) => ({
              id: s.id,
              name: s.subcategory_name,
            })),
          }));
          setCategories(catsWithSubs);
        });
      })
      .catch((err) => console.error("Fetch categories failed:", err));
  }, []);

  return (
    <aside className="col-md-3 mb-4">
      <div className="list-group">
        <button
          className="list-group-item list-group-item-action"
          onClick={() =>
            onSelectFilter({ categoryId: null, subcategoryId: null })
          }
        >
          All Products
        </button>
        {categories.map((cat) => (
          <React.Fragment key={cat.id}>
            <button
              className="list-group-item list-group-item-action fw-bold"
              onClick={() =>
                onSelectFilter({ categoryId: cat.id, subcategoryId: null })
              }
            >
              {cat.name}
            </button>
            {cat.subcategories.map((sub) => (
              <button
                key={sub.id}
                className="list-group-item list-group-item-action ps-4 italic"
                onClick={() =>
                  onSelectFilter({ categoryId: cat.id, subcategoryId: sub.id })
                }
              >
                {sub.name}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
}
