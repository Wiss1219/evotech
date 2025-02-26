import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const items = response.data?.items || [];
      setCartItems(items.map(item => ({
        id: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity
      })));
    } catch (err) {
      if (err.response?.status === 401) {
        // Token is invalid
        localStorage.removeItem('token');
        setCartItems([]);
      } else {
        console.error('Cart fetch error:', err);
        setError('Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Store the intended action
        localStorage.setItem('pendingCartAction', JSON.stringify({
          action: 'add',
          productId
        }));
        navigate('/login');
        return false;
      }

      console.log('Adding to cart:', { productId });

      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId, quantity: 1 },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        console.log('Successfully added to cart');
        await fetchCart();
        return true;
      }

      throw new Error('No data received from server');
    } catch (err) {
      console.error('Add to cart error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      
      setError(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  // Handle pending actions after login
  useEffect(() => {
    const handlePendingAction = async () => {
      const pendingAction = localStorage.getItem('pendingCartAction');
      if (pendingAction) {
        try {
          const { action, productId } = JSON.parse(pendingAction);
          if (action === 'add') {
            await addToCart(productId);
          }
        } catch (err) {
          console.error('Error handling pending action:', err);
        } finally {
          localStorage.removeItem('pendingCartAction');
        }
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      handlePendingAction();
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      fetchCart,
      addToCart,
      setCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
