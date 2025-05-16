// src/api/cart.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_HOST_URL,
  withCredentials: true, // if you need cookies/auth
});

// 1. Add to cart
export async function addToCart({
  userId,
  productId,
  variantId,
  quantity,
  unitPrice,
}) {
  try {
    const res = await api.post("/add_to_cart.php", {
      user_id: userId,
      product_id: productId,
      variant_id: variantId,
      quantity,
      unit_price: unitPrice,
    });
    console.log("Add to Cart Response:", res);
    console.log("Add to Cart Data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
}

// 2. Get cart items
export async function getCartItems(userId) {
  try {
    const res = await api.get("/get_cart_items.php", {
      params: { user_id: userId },
    });
    console.log("Get Cart Items Response:", res);
    console.log("Get Cart Items Data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error getting cart items:", error);
  }
}

// 3. Update cart item quantity
export async function updateCartItem({ cartItemId, userId, quantity }) {
  try {
    const res = await api.post("/update_cart_item.php", {
      cart_item_id: cartItemId,
      user_id: userId,
      quantity,
    });
    console.log("Update Cart Item Response:", res);
    console.log("Update Cart Item Data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
  }
}

// 4. Remove cart item
export async function removeCartItem({ cartItemId, userId }) {
  try {
    const res = await api.post("/remove_cart_item.php", {
      cart_item_id: cartItemId,
      user_id: userId,
    });
    console.log("Remove Cart Item Response:", res);
    console.log("Remove Cart Item Data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
  }
}
