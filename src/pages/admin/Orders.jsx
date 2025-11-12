import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FaEye, 
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaTimes
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  const statusIcons = {
    pending: FaClock,
    processing: FaTruck,
    shipped: FaTruck,
    delivered: FaCheckCircle,
    cancelled: FaTimes,
  };

  const statusColors = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };

  const getStatusLabel = (status) => {
    if (status === 'processing') return 'Approved';
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus, notes: newStatus === 'cancelled' ? null : undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Order status updated to ${newStatus}`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus, notes: newStatus === 'cancelled' ? null : o.notes } : o)));
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === 'all' ||
      order.status === filterStatus ||
      (filterStatus === 'cancellation_requested' && order.notes === 'cancellation_requested' && order.status !== 'cancelled');
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Track and manage customer orders</p>
        </div>

        {/* Tabs with colorful badges and counts */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${filterStatus === 'all' ? 'bg-black text-white' : 'btn-outline'}`}
              onClick={() => setFilterStatus('all')}
            >
              All
              <span className="badge ml-2">{orders.length}</span>
            </button>
            {statuses.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              const color = (
                status === 'pending' ? 'badge-warning' :
                status === 'processing' ? 'badge-info' :
                status === 'shipped' ? 'badge-primary' :
                status === 'delivered' ? 'badge-success' :
                'badge-error'
              );
              return (
                <button
                  key={status}
                  className={`btn btn-sm capitalize ${filterStatus === status ? 'bg-black text-white' : 'btn-outline'}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {getStatusLabel(status)}
                  <span className={`badge ml-2 ${color}`}>{count}</span>
                </button>
              );
            })}
            <button
              className={`btn btn-sm ${filterStatus === 'cancellation_requested' ? 'bg-black text-white' : 'btn-outline'}`}
              onClick={() => setFilterStatus('cancellation_requested')}
            >
              Cancellation Requests
              <span className="badge ml-2 badge-error">
                {orders.filter((o) => o.notes === 'cancellation_requested' && o.status !== 'cancelled').length}
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Subtotal</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || FaClock;
                  const isPreorder = Array.isArray(order.items) && order.items.some((it) => (it.productId && it.productId.isPreorder) || it.customName || it.customNumber);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="font-mono text-sm font-bold">{order.shortOrderId || order._id.substring(0, 8)}</td>
                      <td>
                        <div>
                          <p className="font-semibold">{order.userName || 'Guest'}</p>
                          <p className="text-sm text-gray-500">{order.userEmail || 'N/A'}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isPreorder ? 'badge-warning' : 'badge-ghost'}`}>{isPreorder ? 'Preorder' : 'Regular'}</span>
                      </td>
                      <td>
                        <div>
                          <p className="font-semibold">{(order.subtotal || 0).toFixed(0)} Taka</p>
                          {order.remainingPreorderAmount > 0 && (
                            <p className="text-xs text-yellow-600">+{order.remainingPreorderAmount.toFixed(0)} pending</p>
                          )}
                        </div>
                      </td>
                      <td className="font-bold text-green-600">{order.total?.toFixed(0) || '0'} Taka</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusIcon />
                          <span className={`badge ${statusColors[order.status] || 'badge-ghost'}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-sm btn-ghost">
                              Change Status
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-52 z-[100]">
                              {statuses.map((status) => (
                                <li key={status}>
                                  <button
                                    onClick={() => handleStatusChange(order._id, status)}
                                    className={order.status === status ? 'active' : ''}
                                  >
                                    {getStatusLabel(status)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Cancellation controls removed as requested */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-ghost btn-circle"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-semibold text-lg">{selectedOrder.shortOrderId || selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">{selectedOrder.userName || 'Guest'}</p>
                <p className="text-sm">{selectedOrder.userEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`badge ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              
              {/* Order Pricing Breakdown */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Pricing Details</p>
                <div className="space-y-2">
                  {/* Cart Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cart Total (100%):</span>
                    <span className="font-semibold">{(selectedOrder.subtotal || 0).toFixed(0)} Taka</span>
                  </div>
                  
                  {/* Preorder Breakdown if applicable */}
                  {selectedOrder.preorderSubtotal > 0 && (
                    <div className="space-y-1 text-xs border-l-2 border-yellow-400 pl-3 py-1 bg-yellow-50">
                      {selectedOrder.regularSubtotal > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Regular Items (100% paid):</span>
                          <span>{(selectedOrder.regularSubtotal || 0).toFixed(0)} Taka</span>
                        </div>
                      )}
                      <div className="flex justify-between text-yellow-700">
                        <span>Preorder Items Paid Now:</span>
                        <span>{(selectedOrder.preorderSubtotal || 0).toFixed(0)} Taka</span>
                      </div>
                      {selectedOrder.remainingPreorderAmount > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Preorder Balance (On Delivery):</span>
                          <span>{(selectedOrder.remainingPreorderAmount || 0).toFixed(0)} Taka</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium border-t border-yellow-300 pt-1 mt-1">
                        <span>Subtotal Paid Now:</span>
                        <span>{(selectedOrder.payableSubtotal || 0).toFixed(0)} Taka</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivery Charge */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-semibold">{(selectedOrder.deliveryCharge || 0).toFixed(0)} Taka</span>
                  </div>
                  
                  {/* Total Paid */}
                  <div className="flex justify-between text-base font-bold border-t pt-2">
                    <span>Total Paid Now:</span>
                    <span className="text-green-600">{(selectedOrder.total || 0).toFixed(0)} Taka</span>
                  </div>
                  
                  {/* Remaining Balance Warning */}
                  {selectedOrder.remainingPreorderAmount > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="text-yellow-800 font-semibold">
                        ⚠️ Collect on Delivery: {(selectedOrder.remainingPreorderAmount || 0).toFixed(0)} Taka
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Remaining balance for preorder items
                      </p>
                    </div>
                  )}
                  
                  {/* Payment Status */}
                  <div className="flex justify-between text-sm items-center mt-2">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`badge ${
                      selectedOrder.paymentStatus === 'paid' ? 'badge-success' :
                      selectedOrder.paymentStatus === 'partial' ? 'badge-warning' :
                      'badge-ghost'
                    }`}>
                      {selectedOrder.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Order Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => {
                      const img = item.image || item.productId?.image;
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="relative">
                              {img && (
                                <div className="w-20 h-20 rounded overflow-hidden border bg-white">
                                  <img src={img} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              {item.isPreorder && (
                                <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-br">
                                  Pre Order
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-base">{item.name}</p>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                                    {item.size && <span className="text-xs text-gray-600">Size: {item.size}</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Custom Name/Number for Preorder */}
                              {(item.customName || item.customNumber) && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs border border-blue-200">
                                  {item.customName && <p><span className="font-medium">Custom Name:</span> {item.customName}</p>}
                                  {item.customNumber && <p><span className="font-medium">Custom Number:</span> {item.customNumber}</p>}
                                </div>
                              )}

                              {/* Price Display */}
                              <div className="mt-3">
                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-xs text-gray-500">Price per item:</p>
                                    <p className="text-sm font-semibold text-gray-700">{Number(item.price).toFixed(0)} Taka</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Item Total:</p>
                                    <p className="text-base font-bold text-gray-800">{(item.price * item.quantity).toFixed(0)} Taka</p>
                                  </div>
                                </div>

                                {/* Preorder Payment Info */}
                                {item.isPreorder && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    {item.preorderPaymentType === 'full' ? (
                                      <div className="text-xs">
                                        <p className="font-semibold text-yellow-800">
                                          ✓ Full Payment: {(item.price * item.quantity).toFixed(0)} Taka (Paid Now)
                                        </p>
                                        <p className="text-yellow-700 mt-1">
                                          Pay Full Amount Now • No balance on delivery
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="text-xs">
                                        <p className="font-semibold text-yellow-800">
                                          ⚡ Half Payment: {(item.price * item.quantity * 0.5).toFixed(0)} Taka (Paid Now)
                                        </p>
                                        <p className="text-yellow-700 mt-1">
                                          Pay 50% Now • Remaining {(item.price * item.quantity * 0.5).toFixed(0)} Taka on delivery
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedOrder.shippingDetails && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Shipping</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="mb-1"><span className="font-medium">Type:</span> {selectedOrder.shippingType === 'cuet' ? 'CUET Campus' : 'All Over Bangladesh'}</p>
                    {selectedOrder.shippingType === 'cuet' ? (
                      <div className="text-sm">
                        <p><span className="font-medium">Name:</span> {selectedOrder.shippingDetails.name}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrder.shippingDetails.phone}</p>
                        <p><span className="font-medium">Student ID:</span> {selectedOrder.shippingDetails.studentId}</p>
                        <p><span className="font-medium">Department:</span> {selectedOrder.shippingDetails.department}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.shippingDetails.email}</p>
                        <p><span className="font-medium">Hall:</span> {selectedOrder.shippingDetails.hallName}</p>
                        {selectedOrder.shippingDetails.roomNumber && <p><span className="font-medium">Room:</span> {selectedOrder.shippingDetails.roomNumber}</p>}
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p><span className="font-medium">Name:</span> {selectedOrder.shippingDetails.name}</p>
                        <p><span className="font-medium">Phone:</span> {selectedOrder.shippingDetails.phone}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.shippingDetails.email}</p>
                        <p><span className="font-medium">District:</span> {selectedOrder.shippingDetails.district}</p>
                        <p><span className="font-medium">Address:</span> {selectedOrder.shippingDetails.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment</p>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod === 'PAY_NOW' ? 'Pay Now' : 'Cash on Delivery (COD)'}</p>
                  {selectedOrder.paymentMethod === 'PAY_NOW' && (
                    <p><span className="font-medium">Provider:</span> {
                      selectedOrder.paymentInfo?.provider === 'nagad' ? 'Nagad' : 
                      selectedOrder.paymentInfo?.provider === 'rocket' ? 'Rocket' : 
                      'bKash'
                    }</p>
                  )}
                  {selectedOrder.paymentMethod === 'PAY_NOW' && (
                    <>
                      <p><span className="font-medium">Gateway Number:</span> {selectedOrder.paymentInfo?.gatewayNumber || '01533696047'}</p>
                      <p><span className="font-medium">Payment Number:</span> {selectedOrder.paymentInfo?.paymentNumber || 'N/A'}</p>
                      <p><span className="font-medium">TrxID:</span> {selectedOrder.paymentInfo?.trxId || 'N/A'}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default Orders;
