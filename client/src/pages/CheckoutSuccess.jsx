import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

function CheckoutSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
        <p className="text-gray-300 mb-8">
          Thank you for your purchase. We'll send you a confirmation email with your order details.
        </p>
        <div className="space-y-4">
          <Link
            to="/products"
            className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/profile"
            className="block w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
