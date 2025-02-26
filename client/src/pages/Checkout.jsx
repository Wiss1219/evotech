import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate order summary
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(response.data.items || []);
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setError('Failed to load cart items');
      }
    };

    fetchCart();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Validate form data
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        setError('Please fill in all payment details');
        return;
      }

      // Process the order
      const orderData = {
        items: cartItems,
        total: total,
        shippingDetails: {
          fullName: formData.fullName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        paymentDetails: {
          cardNumber: formData.cardNumber.replace(/\s/g, '').slice(-4), // Only store last 4 digits
          expiryDate: formData.expiryDate
        }
      };

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear cart and redirect to success page
      navigate('/checkout/success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Shipping' },
    { number: 2, title: 'Payment' },
    { number: 3, title: 'Review' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Back to Cart Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Cart
          </button>
        </div>

        {/* Checkout Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4 md:space-x-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${currentStep >= step.number 
                    ? 'border-red-600 bg-red-600 text-white' 
                    : 'border-gray-600 text-gray-600'}`}
                >
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`hidden md:block ml-2 ${
                  currentStep >= step.number ? 'text-white' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
                {step.number < steps.length && (
                  <div className={`w-10 md:w-20 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-red-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mr-3">1</span>
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-3 bg-black/50 border-2 border-red-600/50 focus:border-red-600 text-white rounded-lg transition-colors"
                      required
                    />
                  </div>
                  {/* More shipping fields... */}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center mr-3">2</span>
                  Payment Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 bg-black/50 border-2 border-red-600/50 focus:border-red-600 text-white rounded-lg transition-colors"
                      required
                      maxLength="19"
                      pattern="\d*"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      className="w-full p-3 bg-black/50 border-2 border-red-600/50 focus:border-red-600 text-white rounded-lg transition-colors"
                      required
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full p-3 bg-black/50 border-2 border-red-600/50 focus:border-red-600 text-white rounded-lg transition-colors"
                      required
                      maxLength="4"
                      pattern="\d*"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white p-4 rounded-xl hover:bg-red-700 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>{loading ? 'Processing...' : 'Place Order'}</span>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.name} x {item.quantity}</span>
                    <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-gray-700">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
