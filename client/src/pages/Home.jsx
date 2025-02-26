import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data.slice(0, 3)); // Get first 3 products for featured section
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (axios.defaults.headers.common['Authorization']) {
      delete axios.defaults.headers.common['Authorization'];
    }
    navigate('/login');
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <header className="products-header fixed top-0 w-full h-16 bg-black/90 backdrop-blur-sm flex items-center justify-between px-4 shadow-lg z-10">
        <Link to="/" className="text-red-600 text-2xl font-bold">EvoTech</Link>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-red-600">Home</Link>
          <Link to="/products" className="text-white hover:text-red-600">Products</Link>
          <Link to="/cart" className="text-white hover:text-red-600">Cart</Link>
          <Link to="/profile" className="text-white hover:text-red-600">Profile</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-white hover:text-red-600">Logout</button>
          ) : (
            <Link to="/login" className="text-white hover:text-red-600">Login</Link>
          )}
        </nav>
      </header>
      <section className="py-12 md:py-20 mt-16">
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
          <div className="space-y-6 p-4">
            <h1 className="text-4xl md:text-6xl font-bold text-light">
              Next-Gen Tech
              <span className="block text-primary">For Your Lifestyle</span>
            </h1>
            <p className="text-xl text-light-muted">
              Discover cutting-edge gadgets that enhance your daily life.
            </p>
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-primary text-light rounded-full hover:bg-red-700 transition-all transform hover:-translate-y-1"
            >
              Explore Products
            </Link>
          </div>
          <div className="relative w-full">
            <img
              src={"./evo.jpg"}
              alt="Featured Tech"
              className="rounded-2xl shadow-lg w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-light text-center mb-8">
          Featured Products
        </h2>
        {loading ? (
          <div className="text-center text-light">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="bg-dark-card rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 rounded-xl transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-light mb-2">{product.name}</h3>
                <p className="text-light-muted mb-4">{product.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">${product.price}</span>
                  <div className="flex items-center">
                    <div className="text-primary">
                      {'★'.repeat(Math.round(product.rating || 0))}
                      {'☆'.repeat(5 - Math.round(product.rating || 0))}
                    </div>
                    <span className="text-light-muted ml-2">
                      ({product.reviews?.length || 0})
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 bg-primary text-light rounded-full hover:bg-red-700 transition-colors font-semibold">
                  Add to Cart
                </button>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;