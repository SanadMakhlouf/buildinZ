import React, { createContext, useState, useEffect, useContext } from 'react';

// Create cart context
export const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage directly
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return {
          items: parsedCart.reduce((total, item) => total + item.quantity, 0),
          price: parsedCart.reduce((total, item) => total + (item.price * item.quantity), 0)
        };
      }
      return { items: 0, price: 0 };
    } catch (error) {
      console.error('Failed to calculate cart totals from localStorage:', error);
      return { items: 0, price: 0 };
    }
  });
  
  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Calculate cart totals
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCartTotal({
      items: itemCount,
      price: totalPrice
    });
  }, [cart]);
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return updatedCart;
      } else {
        // Add new product to cart
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    // Show cart after adding item
    setIsCartOpen(true);
    
    // Auto close cart after 3 seconds
    setTimeout(() => {
      setIsCartOpen(false);
    }, 3000);
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };
  
  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };
  
  return (
    <CartContext.Provider value={{
      cart,
      cartTotal,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider; 