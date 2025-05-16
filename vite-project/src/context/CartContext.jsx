import { createContext, useState, useContext, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_HOST_URL}/get_cart_count.php`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  useEffect(() => {
    updateCartCount(); // load on app start
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
