import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFacebook } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h2 className="logo-font text-3xl font-bold mb-4">TorunHut</h2>
            <p className="text-gray-400 text-sm">
              Premium streetwear for the modern individual. Quality, style, and comfort in every piece.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/tshirt" className="text-gray-400 hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/category/jersey" className="text-gray-400 hover:text-white transition-colors">
                  Jerseys
                </Link>
              </li>
              <li>
                <Link to="/category/hoodie" className="text-gray-400 hover:text-white transition-colors">
                  Hoodies
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="https://web.facebook.com/profile.php?id=61583154645450"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Visit our Facebook page"
              >
                <FiFacebook className="text-2xl" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Nobbo Fashion. All rights reserved. | Designed with ♥
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
