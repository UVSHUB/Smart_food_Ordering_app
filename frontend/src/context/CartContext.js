import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add item or increment qty
  const addToCart = (food) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === food._id);
      if (existing) {
        return prev.map((i) =>
          i._id === food._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...food, qty: 1 }];
    });
  };

  // Decrement qty or remove if qty reaches 0
  const removeFromCart = (foodId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === foodId);
      if (existing && existing.qty > 1) {
        return prev.map((i) => (i._id === foodId ? { ...i, qty: i.qty - 1 } : i));
      }
      return prev.filter((i) => i._id !== foodId);
    });
  };

  // Remove item entirely regardless of qty
  const deleteFromCart = (foodId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== foodId));
  };

  // Clear all items (called after successful payment)
  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
