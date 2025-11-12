import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiX, FiChevronLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Size chart data
  const sizeChart = {
    tshirt: {
      XS: { chest: '34-36', length: '26', shoulder: '15' },
      S: { chest: '36-38', length: '27', shoulder: '16' },
      M: { chest: '38-40', length: '28', shoulder: '17' },
      L: { chest: '40-42', length: '29', shoulder: '18' },
      XL: { chest: '42-44', length: '30', shoulder: '19' },
      XXL: { chest: '44-46', length: '31', shoulder: '20' },
    },
    hoodie: {
      XS: { chest: '36-38', length: '25', shoulder: '16' },
      S: { chest: '38-40', length: '26', shoulder: '17' },
      M: { chest: '40-42', length: '27', shoulder: '18' },
      L: { chest: '42-44', length: '28', shoulder: '19' },
      XL: { chest: '44-46', length: '29', shoulder: '20' },
      XXL: { chest: '46-48', length: '30', shoulder: '21' },
    },
    jersey: {
      XS: { chest: '34-36', length: '27', shoulder: '15' },
      S: { chest: '36-38', length: '28', shoulder: '16' },
      M: { chest: '38-40', length: '29', shoulder: '17' },
      L: { chest: '40-42', length: '30', shoulder: '18' },
      XL: { chest: '42-44', length: '31', shoulder: '19' },
      XXL: { chest: '44-46', length: '32', shoulder: '20' },
    },
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/products/${id}`);
        setProduct(data);
        setSelectedImage(0); // Reset to first image when product changes

        // Fetch similar products by category
        if (data?.category) {
          const { data: similar } = await axios.get(
            `${API_URL}/products/category/${data.category}`
          );
          const filtered = (similar || []).filter((p) => (p._id || p.id) !== (data._id || data.id));
          setSimilarProducts(filtered);
        } else {
          setSimilarProducts([]);
        }
      } catch (error) {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, API_URL]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      ...product,
      id: product._id || product.id,
      size: selectedSize,
      quantity: quantity,
    };

    addToCart(cartItem);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart', { state: { openCheckout: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
        >
          <FiChevronLeft className="text-xl" />
          <span>Back</span>
        </motion.button>
      </div>

      {/* Product Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-12">
            {/* Product Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={
                    selectedImage === 0
                      ? product.image
                      : product.images && product.images[selectedImage - 1]
                      ? product.images[selectedImage - 1]
                      : product.image
                  }
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Main image thumbnail */}
                  <button
                    onClick={() => setSelectedImage(0)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === 0 ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={`${product.name} - Main`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {/* Additional images thumbnails */}
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index + 1)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index + 1 ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col justify-between"
            >
              <div>
                {/* Category Badge */}
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-3 py-1 bg-black text-white text-xs uppercase tracking-wider rounded-full mb-4"
                >
                  {product.category}
                </motion.span>

                {/* Product Name */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                >
                  {product.name}
                  {product.isPreorder && (
                    <span className="ml-3 inline-block px-3 py-1 bg-yellow-400 text-black text-sm font-bold rounded">
                      Pre Order Only
                    </span>
                  )}
                </motion.h1>

                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  {product.isPreorder ? (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {product.discountedPrice && product.discountedPrice < product.price ? (
                          <>
                            <span className="text-xl text-gray-400 line-through">
                              {Number(product.price).toFixed(0)} Taka
                            </span>
                            <span className="text-4xl font-bold text-green-600">
                              {Number(product.discountedPrice).toFixed(0)} Taka
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-semibold text-gray-700">
                            {Number(product.price).toFixed(0)} Taka
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        {(product.preorderPaymentType === 'half' || !product.preorderPaymentType) ? (
                          <>
                            <span className="text-xl font-bold text-yellow-600">
                              {(Number(product.discountedPrice || product.price) * 0.5).toFixed(0)} Taka
                            </span>
                            <span className="text-sm text-gray-500 mt-1">Pay 50% Now + 50% on delivery</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl font-bold text-yellow-600">
                              {Number(product.discountedPrice || product.price).toFixed(0)} Taka
                            </span>
                            <span className="text-sm text-gray-500 mt-1">Pay Full Amount Now</span>
                          </>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          {(product.preorderPaymentType === 'half' || !product.preorderPaymentType) 
                            ? '⚠️ Preorder items require 50% advance payment. Remaining 50% will be collected on delivery.'
                            : '⚠️ Preorder items require full payment in advance.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {product.discountedPrice && product.discountedPrice < product.price ? (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl text-gray-400 line-through">
                            {Number(product.price).toFixed(0)} Taka
                          </span>
                          <span className="text-4xl font-bold text-green-600">
                            {Number(product.discountedPrice).toFixed(0)} Taka
                          </span>
                          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
                            SALE
                          </span>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-black">
                          {Number(product.price).toFixed(0)} Taka
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-600 text-lg mb-8 leading-relaxed whitespace-pre-line"
                >
                  {product.description}
                </motion.div>

                {/* Size Selection */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Select Size
                    </label>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-sm text-black underline hover:text-gray-700 transition-colors"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {sizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 px-4 text-sm font-medium rounded-lg transition-all ${selectedSize === size
                            ? 'bg-black text-white shadow-lg'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Quantity Selector */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mb-8"
                >
                  <label className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-black text-black font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  <FiShoppingCart />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="py-4 px-6 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
                >
                  Buy Now
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.slice(0, 4).map((similarProduct, index) => (
                <motion.div
                  key={similarProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <Link
                    to={`/product/${similarProduct._id || similarProduct.id}`}
                    className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={similarProduct.image}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                        {similarProduct.name}
                      </h3>
                      <p className="text-lg font-bold">{Number(similarProduct.price).toFixed(0)} Taka</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSizeChart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Size Guide</h3>
                <button
                  onClick={() => setShowSizeChart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold">Size</th>
                      <th className="text-center py-3 px-4 font-semibold">Chest (inches)</th>
                      <th className="text-center py-3 px-4 font-semibold">Length (inches)</th>
                      <th className="text-center py-3 px-4 font-semibold">Shoulder (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sizeChart[product.category] || sizeChart.tshirt).map(
                      ([size, measurements]) => (
                        <tr
                          key={size}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${selectedSize === size ? 'bg-black text-white hover:bg-gray-800' : ''
                            }`}
                        >
                          <td className="py-3 px-4 font-medium">{size}</td>
                          <td className="text-center py-3 px-4">{measurements.chest}</td>
                          <td className="text-center py-3 px-4">{measurements.length}</td>
                          <td className="text-center py-3 px-4">{measurements.shoulder}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Measuring Tips:</strong> For best results, measure a similar garment that
                  fits you well. Lay it flat and measure from seam to seam.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
