import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaUserShield, 
  FaTrash,
  FaSearch,
  FaPlus,
  FaTimes,
  FaCrown,
  FaUserCog
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ManageRoles = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Create user form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'subadmin',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to show only admin and subadmin
      const adminUsers = response.data.filter(user => 
        user.role === 'admin' || user.role === 'subadmin'
      );
      setUsers(adminUsers);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to backend. Make sure the server is running.');
      } else {
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.email || !newUser.password || !newUser.displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!['admin', 'subadmin'].includes(newUser.role)) {
      toast.error('Role must be admin or subadmin');
      return;
    }

    setCreating(true);
    try {
      const token = await currentUser.getIdToken();
      
      const response = await axios.post(
        `${API_URL}/users/create-admin`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`${newUser.role === 'admin' ? 'Admin' : 'SubAdmin'} created successfully!`);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', displayName: '', role: 'subadmin' });
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (uid, currentRole) => {
    // Toggle between admin and subadmin only
    const newRole = currentRole === 'admin' ? 'subadmin' : 'admin';

    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/users/${uid}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Role updated to ${newRole}!`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/users/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    subadmins: users.filter((u) => u.role === 'subadmin').length,
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-error';
      case 'subadmin':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaCrown className="mr-1" />;
      case 'subadmin':
        return <FaUserCog className="mr-1" />;
      default:
        return <FaUserShield className="mr-1" />;
    }
  };

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
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin & SubAdmin Management</h1>
            <p className="text-gray-600 mt-2">Manage admin and subadmin roles</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="btn bg-black text-white hover:bg-gray-800 border-none"
          >
            <FaPlus className="mr-2" />
            Create Admin/SubAdmin
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FaUserShield className="text-3xl text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Admins/SubAdmins</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FaCrown className="text-3xl text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FaUserCog className="text-3xl text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">SubAdmins</p>
                <p className="text-2xl font-bold">{stats.subadmins}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.uid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} />
                            ) : (
                              <span className="text-lg">
                                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">{user.displayName || 'No name'}</p>
                          <p className="text-sm text-gray-500">{user.uid.substring(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRole(user.uid, user.role)}
                          className="btn btn-sm btn-info"
                          title={user.role === 'admin' ? 'Change to SubAdmin' : 'Change to Admin'}
                        >
                          <FaUserShield />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid, user.email)}
                          className="btn btn-sm btn-error"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No admin or subadmin users found
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Create Admin/SubAdmin</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="input input-bordered w-full"
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Password</span>
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="input input-bordered w-full"
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Display Name</span>
                    </label>
                    <input
                      type="text"
                      value={newUser.displayName}
                      onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                      className="input input-bordered w-full"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Role</span>
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="select select-bordered w-full"
                    >
                      <option value="subadmin">SubAdmin</option>
                      <option value="admin">Admin</option>
                    </select>
                    <label className="label">
                      <span className="label-text-alt text-gray-500">
                        {newUser.role === 'admin' && 'Full access to all features'}
                        {newUser.role === 'subadmin' && 'Can manage products and orders'}
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-ghost flex-1"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn bg-black text-white hover:bg-gray-800 border-none flex-1"
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="font-bold text-blue-900 mb-2">Role Permissions</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <FaUserCog /> SubAdmin
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Manage products</li>
                <li>Manage orders</li>
                <li>View dashboard</li>
                <li>Update order status</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold flex items-center gap-2">
                <FaCrown /> Admin
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Full access</li>
                <li>Manage users</li>
                <li>Manage roles</li>
                <li>Settings control</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

export default ManageRoles;
