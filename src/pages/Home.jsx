import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { carouselImages } from '../data/products';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tshirts, setTshirts] = useState([]);
  const [hoodies, setHoodies] = useState([]);
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCategory = async (category, setter, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const { data } = await axios.get(`${API_URL}/products`, {
            params: { category, limit: 3 },
            timeout: 10000, // 10 second timeout
          });
          setter(data.products ? data.products.slice(0, 3) : (data || []).slice(0, 3));
          return; // Success, exit retry loop
        } catch (e) {
          if (i === retries - 1) {
            // Last attempt failed
            setter([]);
          } else {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
    };

    const load = async () => {
      setLoading(true);
      // Fetch sequentially to avoid overwhelming the server
      await fetchCategory('tshirt', setTshirts);
      await fetchCategory('hoodie', setHoodies);
      await fetchCategory('jersey', setJerseys);
      setLoading(false);
    };

    load();
  }, [API_URL]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Tagline */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black leading-tight">
              Define Your
              <span className="logo-font block text-6xl md:text-7xl mt-2">Style</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Premium streetwear designed for those who dare to be different.
              Elevate your wardrobe with our exclusive collection.
            </p>
            <Link to="/category/tshirt">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-10 btn bg-black text-white hover:bg-gray-800 border-none btn-hover text-lg px-8"
              >
                Shop Now
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Side - Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            {carouselImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentSlide === index ? 1 : 0,
                  scale: currentSlide === index ? 1 : 1.1,
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-8">
                  <h3 className="text-white text-3xl font-bold">{image.title}</h3>
                  <p className="text-white text-lg">{image.subtitle}</p>
                </div>
              </motion.div>
            ))}
            {/* Carousel Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-8' : 'bg-white bg-opacity-50'
                    }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* T-Shirts Section (no animations) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-black">T-Shirts</h2>
          <Link to="/category/tshirt">
            <button className="btn btn-outline border-black text-black hover:bg-black hover:text-white">
              Show More
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            tshirts.map((product) => (
              <div key={product._id || product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Hoodies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-black">Hoodies</h2>
          <Link to="/category/hoodie">
            <button className="btn btn-outline border-black text-black hover:bg-black hover:text-white">
              Show More
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : hoodies.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No hoodies available at the moment
            </div>
          ) : (
            hoodies.map((product) => (
              <div key={product._id || product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Jerseys Section - only show when there are jerseys */}
      {!loading && jerseys.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-black">Jerseys</h2>
            <Link to="/category/jersey">
              <button className="btn btn-outline border-black text-black hover:bg-black hover:text-white">
                Show More
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jerseys.map((product) => (
              <div key={product._id || product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
