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

  const addToCart = (product, quantity = 1, unit = 'kg') => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i =>
          i._id === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity, unit }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => i._id === productId ? { ...i, quantity: parseFloat(quantity.toFixed(3)) } : i)
    );
  };

  const updateItemUnit = (productId, unit) => {
    setItems(prev =>
      prev.map(i => i._id === productId ? { ...i, unit } : i)
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

  const getItemUnit = (productId) => {
    const item = items.find(i => i._id === productId);
    return item ? (item.unit || 'kg') : 'kg';
  };

  const totalItems = items.length;

  const totalAmount = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, updateQuantity, updateItemUnit, removeFromCart,
      clearCart, getItemQuantity, getItemUnit, totalItems, totalAmount
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
