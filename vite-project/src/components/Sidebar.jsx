import React, { useState, useEffect } from "react";

export default function Sidebar({ onSelectFilter }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Reset mobileExpanded when switching between mobile and desktop
      if (!mobile) {
        setMobileExpanded(true); // show sidebar on desktop
      } else {
        setMobileExpanded(false); // hide filters initially on mobile
      }
    };

    handleResize(); // Call on mount to set initial state

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories + subcategories
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

  // Fetch brands
  useEffect(() => {
    fetch(`${import.meta.env.VITE_HOST_URL}/get_brands.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setBrands(data.brands);
        } else {
          console.error("get_brands error:", data.message);
        }
      })
      .catch((err) => console.error("Fetch brands failed:", err));
  }, []);

  const toggleCategory = (catId) => {
    setActiveCategoryId((prevId) => (prevId === catId ? null : catId));
    setBrandsExpanded(false);
  };

  const toggleBrands = () => {
    setBrandsExpanded((prev) => !prev);
    setActiveCategoryId(null);
  };

  const handleSubcategoryClick = (catId, subId) => {
    onSelectFilter({
      categoryId: catId,
      subcategoryId: subId,
      brandId: null,
    });
    if (isMobile) {
      setMobileExpanded(false);
      setActiveCategoryId(null);
      setBrandsExpanded(false);
    }
  };

  const handleBrandClick = (brandId) => {
    onSelectFilter({
      categoryId: null,
      subcategoryId: null,
      brandId: brandId,
    });
    if (isMobile) {
      setMobileExpanded(false);
      setActiveCategoryId(null);
      setBrandsExpanded(false);
    }
  };

  return (
    <aside className="col-lg-3 mb-4">
      <div className="list-group">
        {/* All Products */}
        <button
          className="list-group-item list-group-item-action d-flex justify-content-between"
          onClick={() => {
            if (isMobile) {
              setMobileExpanded((prev) => !prev);
            } else {
              onSelectFilter({
                categoryId: null,
                subcategoryId: null,
                brandId: null,
              });
            }
          }}
        >
          All Products
          {isMobile && <span>{mobileExpanded ? "▲" : "▼"}</span>}
        </button>

        {/* Show categories and brands if on desktop or expanded on mobile */}
        {(mobileExpanded || !isMobile) && (
          <>
            {categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <button
                  className="list-group-item list-group-item-action fw-bold d-flex justify-content-between"
                  onClick={() => {
                    if (isMobile) {
                      toggleCategory(cat.id);
                    } else {
                      onSelectFilter({
                        categoryId: cat.id,
                        subcategoryId: null,
                        brandId: null,
                      });
                    }
                  }}
                >
                  {cat.name}
                  {isMobile && (
                    <span>{activeCategoryId === cat.id ? "−" : "+"}</span>
                  )}
                </button>
                {(activeCategoryId === cat.id || !isMobile) &&
                  cat.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      className="list-group-item list-group-item-action ps-4 fst-italic"
                      onClick={() => handleSubcategoryClick(cat.id, sub.id)}
                    >
                      {sub.name}
                    </button>
                  ))}
              </React.Fragment>
            ))}

            {/* Brands */}
            <div className="mt-2">
              <button
                className="list-group-item list-group-item-action fw-bold d-flex justify-content-between"
                onClick={() => {
                  if (isMobile) {
                    toggleBrands();
                  }
                }}
              >
                Brands
                {isMobile && <span>{brandsExpanded ? "−" : "+"}</span>}
              </button>
              {(brandsExpanded || !isMobile) &&
                brands.map((brand) => (
                  <button
                    key={brand.id}
                    className="list-group-item list-group-item-action ps-4"
                    onClick={() => handleBrandClick(brand.id)}
                  >
                    {brand.brand_name}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
