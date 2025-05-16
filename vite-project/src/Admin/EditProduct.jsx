import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    brand_id: "",
  });

  const [selectedColors, setSelectedColors] = useState([
    { color_id: "", sizes: {}, images: [], existingImages: [] },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, productRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_HOST_URL}/get_product_data.php`),
          axios.get(
            `${import.meta.env.VITE_HOST_URL}/get_products.php?id=${id}`
          ),
        ]);

        console.log("Data Response:", dataRes.data);
        console.log("Product Response:", productRes.data);

        const { categories, subcategories, brands, sizes, colors } =
          dataRes.data;
        const productData = productRes.data.products[0]; // Access first product

        if (!productData) {
          throw new Error("Product not found");
        }

        setCategories(categories);
        setSubcategories(subcategories);
        setBrands(brands);
        setSizes(sizes);
        setColors(colors);

        setProduct({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id,
          subcategory_id: productData.subcategory_id,
          brand_id: productData.brand_id,
        });

        const filtered = subcategories.filter(
          (sub) => sub.category_id === parseInt(productData.category_id)
        );
        setFilteredSubcategories(filtered);

        const colorMap = new Map();
        const variants = productData.variants || []; // Ensure it's an array

        variants.forEach((variant) => {
          if (!colorMap.has(variant.color_id)) {
            colorMap.set(variant.color_id, {
              color_id: variant.color_id,
              sizes: {},
              existingImages: (productData.images || []) // Ensure images exist
                .filter((img) => img.color_id === variant.color_id)
                .map((img) => img.image_url),
            });
          }
          colorMap.get(variant.color_id).sizes[variant.size_id] = variant.stock;
        });

        setSelectedColors(Array.from(colorMap.values()));
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading product data");
        navigate("/view-products");
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });

    if (name === "category_id") {
      const filtered = subcategories.filter(
        (sub) => sub.category_id === parseInt(value)
      );
      setFilteredSubcategories(filtered);
    }
  };

  const handleColorChange = (index, colorId) => {
    const updatedColors = [...selectedColors];
    updatedColors[index].color_id = colorId;
    setSelectedColors(updatedColors);
  };

  const handleSizeStock = (colorIndex, sizeId, stock) => {
    const updatedColors = [...selectedColors];
    updatedColors[colorIndex].sizes[sizeId] = stock;
    setSelectedColors(updatedColors);
  };

  const handleColorImages = (colorIndex, files) => {
    const updatedColors = [...selectedColors];
    updatedColors[colorIndex].images = Array.from(files);
    setSelectedColors(updatedColors);
  };

  const addColorSection = () => {
    setSelectedColors([
      ...selectedColors,
      { color_id: "", sizes: {}, images: [] },
    ]);
  };

  const removeColorSection = (index) => {
    setSelectedColors(selectedColors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    try {
      // Debugging: Check product state before sending
      console.log("Product Data:", product);

      Object.entries(product).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("id", id);

      const allVariants = [];
      const imagesToDelete = [];

      if (!selectedColors || selectedColors.length === 0) {
        alert("No color variants selected!");
        return;
      }

      selectedColors.forEach((color, index) => {
        console.log(`Processing Color ${index}:`, color);

        // Ensure images array exists
        if (color.images?.length > 0) {
          color.images.forEach((file) => {
            formData.append(`new_images[]`, file);
            formData.append(`new_image_color_ids[]`, color.color_id);
          });

          imagesToDelete.push(...(color.existingImages || [])); // ✅ Fix: Prevent undefined
        } else {
          color.existingImages?.forEach((img) => {
            formData.append(`existing_images[]`, img);
            formData.append(`existing_image_color_ids[]`, color.color_id);
          });
        }

        Object.entries(color.sizes || {}).forEach(([sizeId, stock]) => {
          allVariants.push({
            color_id: color.color_id,
            size_id: sizeId,
            stock: stock,
          });
        });
      });

      console.log("All Variants:", allVariants);
      console.log("Images to Delete:", imagesToDelete);

      formData.append("variants", JSON.stringify(allVariants));
      formData.append("images_to_delete", JSON.stringify(imagesToDelete));

      const response = await axios.post(
        `${import.meta.env.VITE_HOST_URL}/update_product.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        alert("Product updated successfully!");
        navigate("/admin/view-products");
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        `Failed to update product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={product.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={product.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            name="price"
            className="form-control"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category_id"
            className="form-select"
            value={product.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Subcategory</label>
          <select
            name="subcategory_id"
            className="form-select"
            value={product.subcategory_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Subcategory</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.subcategory_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Brand</label>
          <select
            name="brand_id"
            className="form-select"
            value={product.brand_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>

        <h4>Color Variants</h4>
        {selectedColors.map((color, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <select
                className="form-select w-50"
                value={color.color_id}
                onChange={(e) => handleColorChange(index, e.target.value)}
                required
              >
                <option value="">Select Color</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.color_name}
                  </option>
                ))}
              </select>

              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeColorSection(index)}
                >
                  Remove
                </button>
              )}
            </div>

            {color.color_id && (
              <>
                <div className="mb-3">
                  <label>Images for this color</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleColorImages(index, e.target.files)}
                    className="form-control"
                    accept="image/*"
                  />
                  {color.existingImages?.length > 0 && (
                    <div className="mt-2">
                      <label>Existing Images:</label>
                      <div className="d-flex flex-wrap gap-2">
                        {color.existingImages.map((img, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={`http://localhost/AI_ECOMMERCE/php-backend/uploads/${img}`}
                            alt="Existing"
                            className="img-thumbnail"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <h6>Stock Management</h6>
                  <div className="row g-2">
                    {sizes.map((size) => (
                      <div key={size.id} className="col-md-4">
                        <label>{size.size}</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={color.sizes[size.id] || ""}
                          onChange={(e) =>
                            handleSizeStock(index, size.id, e.target.value)
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={addColorSection}
        >
          + Add Another Color
        </button>

        <button type="submit" className="btn btn-primary">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
