import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useAuth } from '../../contexts/AuthContext';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import loginAnimation from '../../lottie/Login.json';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, hasAdminAccess, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in with admin/subadmin access
    if (currentUser && hasAdminAccess()) {
      navigate('/admin/dashboard');
    }
  }, [currentUser, hasAdminAccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      
      // Wait a moment for role to be fetched
      setTimeout(() => {
        // Check if user has admin access after login
        if (hasAdminAccess()) {
          navigate('/admin/dashboard');
        } else {
          navigate('/access-denied');
        }
      }, 1000);
    } catch (error) {
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left Side - Animation */}
            <div className="bg-gradient-to-br from-black to-gray-800 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64"
              >
                <Lottie 
                  animationData={loginAnimation} 
                  loop={true}
                  className="w-full h-full"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center mt-4 sm:mt-6 md:mt-8"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                  TorunHut Admin
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm">
                  Secure access to your dashboard
                </p>
              </motion.div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
                    Admin Login
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Enter your credentials to access the dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="admin@admin"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`btn w-full bg-black text-white hover:bg-gray-800 border-none ${
                      loading ? 'loading' : ''
                    }`}
                  >
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                  </motion.button>
                </form>

                {/* Info Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-6 p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-xs text-gray-600 text-center">
                    🔒 This is a secure admin area. Only authorized personnel can access this dashboard.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
