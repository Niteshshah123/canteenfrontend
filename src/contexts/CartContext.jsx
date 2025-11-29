import { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/auth';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [user]);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.productId?.discountPrice || item.productId?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    setCartTotal(total);
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart(product._id, quantity);
      setCartItems(response.data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to cart',
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(productId, quantity);
      setCartItems(response.data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update cart',
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.removeFromCart(productId);
      setCartItems(response.data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from cart',
      };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to clear cart',
      };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

