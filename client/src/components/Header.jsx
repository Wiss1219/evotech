import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-card shadow-lg z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-primary">EvoTech</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-light hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-light hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/cart" className="text-light hover:text-primary transition-colors relative">
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
            <Link to="/profile" className="text-light hover:text-primary transition-colors">
              <UserIcon className="h-6 w-6" />
            </Link>
            {user ? (
              <button 
                onClick={logout}
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-light p-2"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-light hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-light hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/cart"
                className="block px-3 py-2 text-light hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Cart
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 text-light hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-light hover:text-primary transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 text-light hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;