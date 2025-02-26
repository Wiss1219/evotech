import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const success = await addToCart(productId);
      if (success) {
        alert('Added to cart!');
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart');
    }
  };

  if (loading) return <div className="text-center py-24"><div className="text-primary">Loading...</div></div>;
  if (error) return <div className="text-center py-24 text-red-500">{error}</div>;

  return (
    <div className="max-w-8xl mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold text-light mb-12">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product._id} className="bg-dark-card rounded-2xl p-6 space-y-4">
            <Link to={`/product/${product._id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-semibold text-light">{product.name}</h2>
            </Link>
            <p className="text-light-muted line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">${product.price}</span>
              <button 
                onClick={() => handleAddToCart(product._id)}
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
