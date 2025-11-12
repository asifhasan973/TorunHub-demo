import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiLogOut } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Profile = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setDisplayName(currentUser.displayName || '');

    const fetchOrders = async () => {
      try {
        const token = await currentUser.getIdToken();
        const { data } = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data || []);
      } catch (error) {
      }
    };
    fetchOrders();
    const onFocus = () => fetchOrders();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(fetchOrders, 10000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [currentUser, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(displayName, currentUser.photoURL);
      setIsEditing(false);
    } catch (error) {
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-black mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your orders</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                      }}
                    />
                  ) : (
                    <FiUser size={48} className="block" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-black">
                  {currentUser.displayName || 'User'}
                </h2>
                <p className="text-gray-600 text-sm">{currentUser.email}</p>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Display Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-white"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn bg-black text-white hover:bg-gray-800 border-none flex-1"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-outline border-gray-300 flex-1"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline border-black text-black hover:bg-black hover:text-white w-full"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="btn bg-red-500 text-white hover:bg-red-600 border-none w-full"
                  >
                    <FiLogOut className="mr-2" />
                    Logout
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Orders Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                <FiShoppingBag className="mr-2" />
                Order History
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No orders yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start shopping to see your orders here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-black">
                            Order #{order.shortOrderId || order._id?.substring(0,8)}
                          </h3>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <span
                          className={`badge ${
                            order.status === 'delivered'
                              ? 'badge-success'
                              : order.status === 'shipped'
                              ? 'badge-info'
                              : order.status === 'cancelled'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {order.status === 'cancelled'
                            ? 'Cancelled'
                            : order.notes === 'cancellation_requested'
                            ? 'Cancellation Pending'
                            : order.status === 'processing'
                            ? 'Approved'
                            : (order.status || 'pending')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} item(s)
                        </p>
                        <p className="font-bold text-black">{Number(order.total).toFixed(0)} Taka</p>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {order.shippingType && (
                          <span>Shipping: {order.shippingType === 'cuet' ? 'CUET Campus' : 'All Over Bangladesh'}</span>
                        )}
                      </div>
                      {order.status === 'pending' && (
                        <div className="text-right mt-3 ">
                          {/* <button className="btn btn-sm btn-outline" onClick={() => requestCancellation(order)}>
                            {order.notes === 'cancellation_requested' ? 'Cancel Request' : 'Request Cancellation'}
                          </button> */}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
