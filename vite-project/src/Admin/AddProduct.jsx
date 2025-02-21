import React, { useState, useEffect } from "react";
import axios from "axios";

const AddProduct = () => {
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
    { color_id: "", sizes: {}, images: [] },
  ]);

  useEffect(() => {
    axios
      .get("http://localhost/AI_ECOMMERCE/php-backend/api/get_product_data.php")
      .then((response) => {
        const { categories, subcategories, brands, sizes, colors } =
          response.data;
        setCategories(categories);
        setSubcategories(subcategories);
        setBrands(brands);
        setSizes(sizes);
        setColors(colors);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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
      // Append product data
      Object.entries(product).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Prepare variants and images
      const allVariants = [];
      selectedColors.forEach((color, colorIndex) => {
        // Append images for this color using correct array structure
        if (color.images && color.images.length > 0) {
          color.images.forEach((file) => {
            formData.append(`images[]`, file); // Send images in an array format
            formData.append(`image_color_ids[]`, color.color_id); // Send corresponding color_id
          });
        }

        // Prepare variants for this color
        Object.entries(color.sizes).forEach(([sizeId, stock]) => {
          allVariants.push({
            color_id: color.color_id,
            size_id: sizeId,
            stock: stock,
          });
        });
      });

      // Append variants as JSON
      formData.append("variants", JSON.stringify(allVariants));

      const response = await axios.post(
        "http://localhost/AI_ECOMMERCE/php-backend/api/add_product.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Product added successfully!");
        // Reset form
        setProduct({
          /* ...initial state... */
        });
        setSelectedColors([{ color_id: "", sizes: {}, images: [] }]);
      } else {
        alert(`Error: ${response.data.message}`);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const message = error.response?.data?.message || "Unknown error occurred";
      alert(`Failed to add product: ${message}`);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Add Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Product Details (keep existing fields same) */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            placeholder="Enter product title"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            placeholder="Enter product description"
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
            placeholder="Enter product price"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category_id"
            className="form-select"
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
                    required
                  />
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
                          placeholder="Stock quantity"
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
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
