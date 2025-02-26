import { useState, useEffect } from 'react';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]); // Initial empty array
  const [loading, setLoading] = useState(false); // Start with loading false
  const [error, setError] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const navigate = useNavigate();

  // Initialize totals with 0
  const total = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = 0;
  const grandTotal = total + shipping;

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const { items, total } = response.data;
        
        const validItems = items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: Number(item.price),
          image: item.image || 'https://placehold.co/400x400/1a1a1a/ffffff',
          quantity: Number(item.quantity)
        })).filter(item => item.name !== 'Product Not Found');

        setCartItems(validItems);
        console.log('Cart updated with items:', validItems.length);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  useEffect(() => {
    // Update item count whenever cart items change
    const newCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(newCount);
  }, [cartItems]);

  const updateQuantity = async (id, newQuantity) => {
    if (!id || newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${id}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        await fetchCart(); // Refresh cart data
      }
    } catch (err) {
      console.error('Update quantity error:', err);
      setError('Failed to update quantity');
    }
  };

  const handleIncrement = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrement = (id) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const removeItem = async (id) => {
    if (!id) {
      console.error('Invalid item ID for removal');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Optimistically update UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));

      const response = await axios.delete(`http://localhost:5000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data) {
        throw new Error('Failed to remove item');
      }
    } catch (err) {
      console.error('Remove item error:', err);
      await fetchCart(); // Refresh cart on error
      setError('Failed to remove item');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <div className="text-center py-24 text-white">Loading...</div>;
  if (error) return <div className="text-center py-24 text-red-500">{error}</div>;

  return (
    <div className="max-w-8xl mx-auto px-6 py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light">Shopping Cart</h1>
        <span className="text-light-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-light-muted text-xl mb-6">Your cart is empty</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            {cartItems.map((item) => (
              <div
                key={`cart-item-${item.id}`}
                className="flex items-center gap-6 bg-dark-card rounded-2xl p-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-light mb-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-primary">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    disabled={item.quantity <= 1}
                    className="p-2 text-light hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="w-16 px-3 py-2 bg-dark text-light rounded-lg border-2 border-primary/20 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    className="p-2 text-light hover:text-primary transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-light hover:text-primary transition-colors ml-4"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-dark-card rounded-2xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-light">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-light-muted">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-light-muted">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="h-px bg-primary/20" />
                <div className="flex justify-between text-xl font-bold text-light">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full btn-primary"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;