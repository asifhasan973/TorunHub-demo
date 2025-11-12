import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4"
      >
        <h1 className="text-9xl font-bold text-black mb-4">404</h1>
        <h2 className="text-3xl font-bold text-black mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn bg-black text-white hover:bg-gray-800 border-none"
            >
              <FiHome className="mr-2" />
              Go Home
            </motion.button>
          </Link>
          <Link to="/category/tshirt">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline border-black text-black hover:bg-black hover:text-white"
            >
              <FiShoppingBag className="mr-2" />
              Shop Now
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;

