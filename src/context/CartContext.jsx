import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i =>
          i._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => i._id === productId ? { ...i, quantity } : i)
    );
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i._id !== productId));
  };

  const clearCart = () => setItems([]);

  const getItemQuantity = (productId) => {
    const item = items.find(i => i._id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const totalAmount = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, updateQuantity, removeFromCart,
      clearCart, getItemQuantity, totalItems, totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
