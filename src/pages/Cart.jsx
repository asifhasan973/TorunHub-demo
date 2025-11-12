import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiX, FiCopy } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, updateItemSize, addDifferentSize, getCartTotal, getPreorderSubtotal, getRegularSubtotal, getPayableTotal, getRemainingPreorderAmount, clearCart, getEffectivePrice, getProductTotalQuantity } = useCart();
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('tshirt');
  const sizes = ['XS','S','M','L','XL','XXL'];
  
  // Dynamic size chart data based on category
  const sizeChart = {
    tshirt: {
      XS: { chest: '34', length: '26', shoulder: '16' },
      S: { chest: '36', length: '27', shoulder: '17' },
      M: { chest: '38', length: '28', shoulder: '18' },
      L: { chest: '40', length: '29', shoulder: '19' },
      XL: { chest: '42', length: '30', shoulder: '20' },
      XXL: { chest: '44', length: '31', shoulder: '21' },
    },
    hoodie: {
      XS: { chest: '36', length: '27', shoulder: '17' },
      S: { chest: '38', length: '28', shoulder: '18' },
      M: { chest: '40', length: '29', shoulder: '19' },
      L: { chest: '42', length: '30', shoulder: '20' },
      XL: { chest: '44', length: '31', shoulder: '21' },
      XXL: { chest: '46', length: '32', shoulder: '22' },
    },
    jersey: {
      XS: { chest: '34', length: '26', shoulder: '16' },
      S: { chest: '36', length: '27', shoulder: '17' },
      M: { chest: '38', length: '28', shoulder: '18' },
      L: { chest: '40', length: '29', shoulder: '19' },
      XL: { chest: '42', length: '30', shoulder: '20' },
      XXL: { chest: '44', length: '31', shoulder: '21' },
    },
  };
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {}, [currentUser]);

  // Open checkout if navigated with state from Product Detail (Buy Now)
  useEffect(() => {
    if (location.state && location.state.openCheckout) {
      navigate('/shipping', { replace: true });
    }
  }, [location.state, navigate]);

  const openCheckout = () => {
    if (!currentUser) {
      toast.info('Please log in to place an order');
      navigate('/login');
      return;
    }
    navigate('/shipping');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FiShoppingCart className="text-8xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-black mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to get started!</p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn bg-black text-white hover:bg-gray-800 border-none btn-hover"
            >
              Continue Shopping
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-black mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} items in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
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
                        <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                        
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="text-xl" />
                      </motion.button>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="btn btn-sm btn-circle bg-gray-200 hover:bg-gray-300 border-none"
                        >
                          <FiMinus />
                        </motion.button>
                        <span className="font-semibold text-lg w-12 text-center">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="btn btn-sm btn-circle bg-gray-200 hover:bg-gray-300 border-none"
                        >
                          <FiPlus />
                        </motion.button>
                      </div>

                      {/* Add Different Size Button */}
                      <div className="flex items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addDifferentSize(item)}
                          className="btn btn-xs bg-black text-white hover:bg-gray-800 border-none flex items-center gap-1"
                          title="Add another variant with different size"
                        >
                          <FiCopy className="text-sm" />
                          <span className="hidden sm:inline">Add Different Size</span>
                          <span className="sm:hidden">Different Size</span>
                        </motion.button>
                      </div>

                      {/* Size & Price */}
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <label className="text-sm text-gray-600">Size</label>
                          <select
                            className="select select-bordered select-sm"
                            value={item.size || 'M'}
                            onChange={(e) => updateItemSize(item.id, e.target.value)}
                          >
                            {sizes.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button className="link text-sm" onClick={() => setShowSizeChart(true)}>Size guide</button>
                        </div>
                        {/* Price Display with Tiered Pricing */}
                        {(() => {
                          const effectivePrice = getEffectivePrice(item);
                          // Use originalProductId if it exists (for variants), otherwise use the item's ID
                          const productId = item.originalProductId || item._id || item.id;
                          const totalQty = getProductTotalQuantity(productId);
                          const hasTieredPricing = item.tieredPricing && item.tieredPricing.length > 0;
                          const regularPrice = item.price;
                          
                          return (
                            <div>
                              {hasTieredPricing ? (
                                <div>
                                  <p className="text-xs text-gray-400 line-through">
                                    Regular: {Number(regularPrice).toFixed(0)} Taka each
                                  </p>
                                  <p className="text-sm text-green-600 font-semibold">
                                    {Number(effectivePrice).toFixed(0)} Taka each
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    Qty-based price (Total: {totalQty} items)
                                  </p>
                                </div>
                              ) : item.discountedPrice ? (
                                <div>
                                  <p className="text-xs text-gray-400 line-through">
                                    {Number(item.price).toFixed(0)} Taka each
                                  </p>
                                  <p className="text-sm text-green-600 font-semibold">
                                    {Number(item.discountedPrice).toFixed(0)} Taka each
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">
                                  {Number(item.price).toFixed(0)} Taka each
                                </p>
                              )}
                            </div>
                          );
                        })()}
                        {/* Total Price */}
                        {item.isPreorder ? (
                          <>
                            <p className="text-sm text-gray-600 mt-2">
                              Total: {(getEffectivePrice(item) * item.quantity).toFixed(0)} Taka
                            </p>
                            {(item.preorderPaymentType === 'half' || !item.preorderPaymentType) ? (
                              <>
                                <p className="text-xl font-bold text-yellow-600">
                                  {(getEffectivePrice(item) * item.quantity * 0.5).toFixed(0)} Taka
                                </p>
                                <p className="text-xs text-gray-500">
                                  Pay 50% Now + 50% on delivery
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-xl font-bold text-yellow-600">
                                  {(getEffectivePrice(item) * item.quantity).toFixed(0)} Taka
                                </p>
                                <p className="text-xs text-gray-500">
                                  (Pay Full Amount Now)
                                </p>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-black mt-2">
                              {(getEffectivePrice(item) * item.quantity).toFixed(0)} Taka
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearCart}
              className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full"
            >
              Clear Cart
            </motion.button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-6 shadow-md sticky top-20"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Total</span>
                  <span className='text-green-600 font-bold text-lg'>{getCartTotal().toFixed(0)} Taka</span>
                </div>
                
                {/* Show preorder breakdown if there are preorder items */}
                {getPreorderSubtotal() > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown:</p>
                      {getRegularSubtotal() > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Regular Items (100%)</span>
                          <span>{getRegularSubtotal().toFixed(0)} Taka</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-yellow-600">
                        <span>Preorder Items (50% now)</span>
                        <span>{getPreorderSubtotal().toFixed(0)} Taka</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Preorder Remaining (50% later)</span>
                        <span>{getRemainingPreorderAmount().toFixed(0)} Taka</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Will show on Checkout</span>
                </div>
                
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold text-black">
                    <span>Pay Now</span>
                    <span>{getPayableTotal().toFixed(0)} Taka</span>
                  </div>
                  {getRemainingPreorderAmount() > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      + {getRemainingPreorderAmount().toFixed(0)} Taka to be paid on delivery (preorder items)
                    </p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCheckout}
                className="btn bg-black text-white hover:bg-gray-800 border-none w-full btn-hover text-lg"
              >
                Proceed to Checkout
              </motion.button>

              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-outline border-black text-black hover:bg-black hover:text-white w-full mt-3"
                >
                  Continue Shopping
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Checkout modal removed in favor of dedicated pages */}
    </div>
    {/* Size Chart Modal */}
    <AnimatePresence>
      {showSizeChart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSizeChart(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Size Guide</h3>
              <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setShowSizeChart(false)}>
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Category</label>
              <select
                className="select select-bordered w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="tshirt">T-Shirt</option>
                <option value="hoodie">Hoodie</option>
                <option value="jersey">Jersey</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Length (in)</th>
                    <th>Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => {
                    const measurements = sizeChart[selectedCategory]?.[s] || { chest: '-', length: '-', shoulder: '-' };
                    return (
                      <tr key={s}>
                        <td className="font-semibold">{s}</td>
                        <td>{measurements.chest}</td>
                        <td>{measurements.length}</td>
                        <td>{measurements.shoulder}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Cart;
