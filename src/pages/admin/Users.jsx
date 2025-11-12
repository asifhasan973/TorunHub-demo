import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaUserShield, 
  FaUser, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaCrown,
  FaUserCog
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (uid, currentRole) => {
    const roles = ['user', 'subadmin', 'admin'];
    const currentIndex = roles.indexOf(currentRole);
    const newRole = roles[(currentIndex + 1) % roles.length];

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
    regularUsers: users.filter((u) => u.role === 'user').length,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">View all registered users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FaUser className="text-3xl text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
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
              <FaUserShield className="text-3xl text-purple-500" />
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
              <FaUserShield className="text-3xl text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">SubAdmins</p>
                <p className="text-2xl font-bold">{stats.subadmins}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3">
              <FaUser className="text-3xl text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold">{stats.regularUsers}</p>
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
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'badge-error'
                            : user.role === 'subadmin'
                            ? 'badge-warning'
                            : 'badge-ghost'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <FaCrown className="mr-1" />
                        ) : user.role === 'subadmin' ? (
                          <FaUserCog className="mr-1" />
                        ) : (
                          <FaUser className="mr-1" />
                        )}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRole(user.uid, user.role)}
                          className="btn btn-sm btn-info"
                          title="Change Role"
                        >
                          <FaEdit />
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
                No users found
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default Users;
