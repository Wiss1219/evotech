import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      console.log('Registration successful:', response.data);
      window.location.href = '/login'; // Redirect to Login
    } catch (err) {
      console.error('Registration failed:', err.message, err.response?.data);
      setError(err.response?.data.msg || 'Registration failed');
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
        <p className="text-center mb-6">Join EvoTech to explore amazing tech products</p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-black border-2 border-red-600 text-white rounded-lg"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-black border-2 border-red-600 text-white rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-black border-2 border-red-600 text-white rounded-lg"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 bg-black border-2 border-red-600 text-white rounded-lg"
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Create Account
          </button>

          <p className="text-center">
            Already have an account?{' '}
            <a href="/login" className="text-red-600 hover:text-red-700">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
