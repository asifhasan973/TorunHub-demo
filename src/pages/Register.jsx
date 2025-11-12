import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Lottie from 'lottie-react';
import { FcGoogle } from 'react-icons/fc';
import registerAnimation from '../lottie/register.json';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      setLoading(true);
      await signup(formData.email, formData.password, formData.name);
      navigate('/verify-email');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
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
            <Lottie
              animationData={registerAnimation}
              loop={true}
              className="w-full h-full"
            />
          </div>
        </motion.div>

        {/* Right Side - Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto order-last lg:order-last"
        >
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-100">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">Create Account</h1>
            <p className="text-gray-600 mb-8">Join the TorunHut community</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="input input-bordered w-full bg-white border-gray-300 focus:border-black"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn bg-black text-white hover:bg-gray-800 border-none w-full btn-hover"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            <div className="divider my-6">OR</div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignup}
              disabled={loading}
              className="btn btn-outline border-gray-300 hover:bg-gray-50 w-full"
            >
              <FcGoogle className="text-2xl mr-2" />
              Sign up with Google
            </motion.button>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
