import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/products`, {
          params: { category },
        });
        setProducts(data.products || data || []);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, API_URL]);

  const categoryTitles = {
    tshirt: 'T-Shirts',
    hoodie: 'Hoodies',
    jersey: 'Jerseys',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-black mb-4">
            {categoryTitles[category] || 'Products'}
          </h1>
          <p className="text-gray-600 text-lg">
            Discover our collection of premium {categoryTitles[category]?.toLowerCase()}
          </p>
          <div className="mt-4 h-1 w-24 bg-black"></div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : products.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product) => (
              <motion.div key={product._id || product.id} variants={itemVariants} className="h-full">
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-600">Coming Soon...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Category;
