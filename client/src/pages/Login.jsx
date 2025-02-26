import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && location.pathname !== '/login') {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        console.log('Login successful');
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/products';
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        {localStorage.getItem('token') ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">You are logged in</h2>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back</h2>
            <p className="text-center mb-4">Enter your credentials to access your account</p>
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  className="w-full p-2 bg-black border-2 border-red-600 text-white rounded-lg"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  className="w-full p-2 bg-black border-2 border-red-600 text-white rounded-lg"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className="text-center">
                Don’t have an account?{' '}
                <a href="/register" className="text-red-600 hover:text-red-700">
                  Register
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;