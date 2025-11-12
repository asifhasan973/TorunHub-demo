import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserShield
} from 'react-icons/fa';
import { useState } from 'react';

const AdminLayout = ({ children }) => {
  const { logout, currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filter menu items based on role
  const allMenuItems = [
    { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard', roles: ['admin', 'subadmin'] },
    { path: '/admin/products', icon: FaBox, label: 'Products', roles: ['admin', 'subadmin'] },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders', roles: ['admin', 'subadmin'] },
    { path: '/admin/users', icon: FaUsers, label: 'Users', roles: ['admin'] },
    { path: '/admin/manage-roles', icon: FaUserShield, label: 'Manage Roles', roles: ['admin'] },
    { path: '/admin/settings', icon: FaCog, label: 'Settings', roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-black text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-gray-800 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-2xl font-bold">TorunHut</span>
                <span className="badge badge-sm bg-white text-black">Admin</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-white text-black font-semibold'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Admin Profile and Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold overflow-hidden">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-300 capitalize">{userRole || 'Admin'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl z-40 lg:hidden overflow-y-auto"
      >
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-black text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
