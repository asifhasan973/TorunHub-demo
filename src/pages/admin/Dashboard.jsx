import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaClock,
  FaArrowUp,
  FaDollarSign
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats from backend
      const token = await currentUser.getIdToken();
      const statsResponse = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const statsData = statsResponse.data.overview;
      setStats({
        totalProducts: statsData.totalProducts || 0,
        totalOrders: statsData.totalOrders || 0,
        totalUsers: statsData.totalUsers || 0,
        pendingOrders: statsData.pendingOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
      });

      // Process orders by status for chart
      const ordersByStatus = statsResponse.data.ordersByStatus || [];
      const orderChartData = ordersByStatus.map((item) => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        count: item.count,
      }));
      setOrderData(orderChartData);

      // Process products by category
      const productsByCategory = statsResponse.data.productsByCategory || [];
      const categoryChartData = productsByCategory.map((item) => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.count,
      }));
      setCategoryData(categoryChartData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#000000', '#4B5563', '#9CA3AF', '#D1D5DB'];

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FaBox,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FaShoppingCart,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'bg-purple-500',
      trend: '+15%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FaClock,
      color: 'bg-orange-500',
      trend: '-5%',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <card.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <FaArrowUp size={12} />
                  <span>{card.trend}</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-gradient-to-r from-black to-gray-800 rounded-xl shadow-lg p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-300 text-sm mb-2">Total Revenue</h3>
              <p className="text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-gray-300 text-sm mt-2">From {stats.totalOrders} orders</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FaDollarSign size={40} />
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Orders by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#000000"
                  fill="#000000"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Products by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn bg-black text-white hover:bg-gray-800 border-none">
              Add New Product
            </button>
            <button className="btn bg-black text-white hover:bg-gray-800 border-none">
              View All Orders
            </button>
            <button className="btn bg-black text-white hover:bg-gray-800 border-none">
              Manage Users
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default Dashboard;
