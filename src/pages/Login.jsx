import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import { FcGoogle } from 'react-icons/fc';
import loginAnimation from '../lottie/Login.json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.user?.emailVerified) {
        navigate('/');
      } else {
        navigate('/verify-email');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await loginWithGoogle();
      if (res?.user?.emailVerified) {
        navigate('/');
      } else {
        navigate('/verify-email');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center items-center order-first lg:order-first"
        >
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-full lg:h-auto lg:max-w-md">
            <Lottie animationData={loginAnimation} loop />
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto order-last lg:order-last"
        >
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">
            <h2 className="text-4xl font-bold text-black mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Login to your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover text-gray-600">
                    Forgot password?
                  </a>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn bg-black text-white hover:bg-gray-800 border-none w-full btn-hover"
              >
                {loading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>

            <div className="divider my-6">OR</div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn btn-outline border-gray-300 hover:bg-gray-50 w-full"
            >
              <FcGoogle className="text-2xl mr-2" />
              Continue with Google
            </motion.button>

            <p className="text-center text-gray-600 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-black font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
