import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { showToast } from '../components/Toast';

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await addToCart(product._id, quantity);
      showToast('Product added to cart!');
    } catch (err) {
      showToast('Failed to add to cart', 'error');
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 h-96 rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Image gallery controls
  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === (product?.images?.length - 1) ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? (product?.images?.length - 1) : prev - 1
    );
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!product) return <div className="text-center p-4">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              className="w-full h-[500px] object-cover rounded-2xl"
            />
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 ${selectedImage === idx ? 'ring-2 ring-red-600' : ''}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">
                {product.reviews?.length || 0} reviews
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-3xl font-bold text-red-600">${product.price}</p>
            {product.oldPrice && (
              <p className="text-gray-400 line-through">${product.oldPrice}</p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-600 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleAddToCart(product._id, quantity)}
              className="flex-1 bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              disabled={!product.inStock}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-3 rounded-lg border ${
                isWishlisted
                  ? 'border-red-600 text-red-600'
                  : 'border-gray-600 text-gray-400'
              } hover:border-red-600 hover:text-red-600 transition-colors`}
            >
              <HeartIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex gap-8 border-b border-gray-800">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="py-6">
              {activeTab === 'description' && (
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              )}
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-2 gap-4">
                  {product.specifications?.map((spec, idx) => (
                    <div key={idx} className="flex justify-between border-b border-gray-800 py-2">
                      <span className="text-gray-400">{spec.name}</span>
                      <span className="text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review stats and list would go here */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct._id}
                to={`/product/${relatedProduct._id}`}
                className="group"
              >
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-white font-medium group-hover:text-red-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-red-600 font-bold mt-2">
                    ${relatedProduct.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;