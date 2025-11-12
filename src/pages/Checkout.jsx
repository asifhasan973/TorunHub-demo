import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PAYMENT_NUMBER = '01533696047';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    cartItems,
    getCartTotal,
    getPreorderSubtotal,
    getRegularSubtotal,
    getPayableTotal,
    getRemainingPreorderAmount,
    getDeliveryCharge,
    getEffectivePrice,
    getProductTotalQuantity,
    getGrandTotal,
    shippingType,
    shippingDetails,
    paymentMethod,
    setPaymentMethod,
    paymentInfo,
    setPaymentInfo,
    clearCart,
    clearCheckoutState,
  } = useCart();
  const [placing, setPlacing] = useState(false);
  const [customByItem, setCustomByItem] = useState({}); // { [itemId]: { customName, customNumber } }
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (!currentUser) {
      toast.info('Please login to continue');
      navigate('/login');
      return;
    }
    if (!shippingDetails) {
      toast.info('Add shipping details first');
      navigate('/shipping');
    }
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [currentUser, shippingDetails, cartItems.length, navigate]);

  const subtotal = useMemo(() => getCartTotal(), [getCartTotal]);
  const payableSubtotal = useMemo(() => getPayableTotal(), [getPayableTotal]);
  const preorderSubtotal = useMemo(() => getPreorderSubtotal(), [getPreorderSubtotal]);
  const regularSubtotal = useMemo(() => getRegularSubtotal(), [getRegularSubtotal]);
  const remainingPreorder = useMemo(() => getRemainingPreorderAmount(), [getRemainingPreorderAmount]);
  const delivery = useMemo(() => getDeliveryCharge(), [getDeliveryCharge]);
  const grandTotal = useMemo(() => getGrandTotal(), [getGrandTotal]);
  
  // Check if cart has any preorder items
  const hasPreorderItems = useMemo(() => {
    return cartItems.some(item => item.isPreorder);
  }, [cartItems]);
  
  // If cart has preorder items, default to pay_now and disable COD
  useEffect(() => {
    if (hasPreorderItems && paymentMethod === 'cod') {
      setPaymentMethod('pay_now');
      toast.info('COD is not available for preorder items. Please use online payment.');
    }
  }, [hasPreorderItems, paymentMethod, setPaymentMethod]);

  const validatePayment = () => {
    if (paymentMethod === 'cod') return true;
    return paymentInfo.paymentNumber?.trim() && paymentInfo.trxId?.trim();
  };

  const copyGatewayNumber = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_NUMBER);
      toast.success('Copied');
    } catch (error) {
      console.error('Failed to copy payment number', error);
      toast.error('Failed to copy the payment number. Please copy it manually.');
    }
  };

  const placeOrder = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!shippingDetails) {
      toast.error('Shipping details missing');
      navigate('/shipping');
      return;
    }
    // Validate custom fields for preorder items
    for (const item of cartItems) {
      if (item.isPreorder && item.requireCustomNameNumber) {
        const key = item._id || item.id;
        const val = customByItem[key];
        if (!val || !val.customName?.trim() || !val.customNumber?.trim()) {
          toast.error('Provide custom name and number for preorder items');
          return;
        }
      }
    }

    if (!validatePayment()) {
      toast.error('Provide payment number and TrxID');
      return;
    }
    try {
      setPlacing(true);
      const token = await currentUser.getIdToken();
      const items = cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: Number(getEffectivePrice(item)), // Use effective price (tiered/discounted)
        quantity: Number(item.quantity),
        size: item.size,
        image: item.image,
        isPreorder: item.isPreorder || false,
        preorderPaymentType: item.preorderPaymentType || 'half', // Send payment type
        customName: customByItem[item._id || item.id]?.customName,
        customNumber: customByItem[item._id || item.id]?.customNumber,
      }));

      const payload = {
        items,
        shippingType, // 'cuet' | 'bd'
        shippingDetails,
        deliveryCharge: delivery,
        subtotal,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'PAY_NOW',
        paymentInfo: paymentMethod === 'cod' ? null : {
          provider: paymentInfo.provider || 'bkash',
          gatewayNumber: PAYMENT_NUMBER,
          paymentNumber: paymentInfo.paymentNumber,
          trxId: paymentInfo.trxId,
        },
      };

      await axios.post(`${API_URL}/orders`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Order placed successfully');
      clearCart(true);
      clearCheckoutState();
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.details || error.message;
      toast.error(msg || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete payment</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-4">Cart Overview</h2>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const key = item._id || item.id;
                  const isPre = item.isPreorder;
                  const needsCustom = item.requireCustomNameNumber && isPre;
                  const effectivePrice = getEffectivePrice(item);
                  // Use originalProductId if it exists (for variants), otherwise use the item's ID
                  const productId = item.originalProductId || item._id || item.id;
                  const totalQty = getProductTotalQuantity(productId);
                  const hasTieredPricing = item.tieredPricing && item.tieredPricing.length > 0;
                  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
                  const displayPrice = effectivePrice;
                  
                  return (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-black flex items-center gap-2">
                            {item.name}
                            {isPre && <span className="badge badge-warning">Pre Order Only</span>}
                          </p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} | Size: {item.size || 'M'}</p>
                          {hasTieredPricing && (
                            <p className="text-xs text-blue-600">Qty-based price (Total: {totalQty} items)</p>
                          )}
                          {isPre ? (
                            <div className="text-sm mt-1">
                              {(hasDiscount || hasTieredPricing) && (
                                <p className="text-xs text-gray-400 line-through">Was: {item.price} Taka each</p>
                              )}
                              <p className="text-gray-700">Price: {displayPrice.toFixed(0)} Taka each</p>
                              {(item.preorderPaymentType === 'half' || !item.preorderPaymentType) ? (
                                <>
                                  <p className="text-xl font-bold text-yellow-600">{(displayPrice * item.quantity * 0.5).toFixed(0)} Taka</p>
                                  <p className="text-xs text-gray-500">Pay 50% Now + 50% on delivery</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xl font-bold text-yellow-600">{(displayPrice * item.quantity).toFixed(0)} Taka</p>
                                  <p className="text-xs text-gray-500">Pay Full Amount Now</p>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm mt-1">
                              {(hasDiscount || hasTieredPricing) ? (
                                <>
                                  <p className="text-xs text-gray-400 line-through">Was: {(item.price * item.quantity).toFixed(0)} Taka</p>
                                  <p className="text-green-600 font-medium">Total: {(effectivePrice * item.quantity).toFixed(0)} Taka</p>
                                </>
                              ) : (
                                <p className="text-gray-600">Total: {(item.price * item.quantity).toFixed(0)} Taka</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="font-semibold">
                          {isPre ? (
                            <span className="text-yellow-600">
                              {(item.preorderPaymentType === 'half' || !item.preorderPaymentType) 
                                ? (displayPrice * item.quantity * 0.5).toFixed(0) 
                                : (displayPrice * item.quantity).toFixed(0)} Taka
                            </span>
                          ) : (
                            <span className={(hasDiscount || hasTieredPricing) ? 'text-green-600' : ''}>{(displayPrice * item.quantity).toFixed(0)} Taka</span>
                          )}
                        </div>
                      </div>
                      {needsCustom && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm mb-1">Backside Custom Name</label>
                            <input
                              className="input input-bordered w-full"
                              value={customByItem[key]?.customName || ''}
                              onChange={(e) => setCustomByItem((prev) => ({ ...prev, [key]: { ...(prev[key]||{}), customName: e.target.value } }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Custom Number</label>
                            <input
                              className="input input-bordered w-full"
                              value={customByItem[key]?.customNumber || ''}
                              onChange={(e) => setCustomByItem((prev) => ({ ...prev, [key]: { ...(prev[key]||{}), customNumber: e.target.value } }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Shipping Details</h2>
                <button className="btn btn-sm btn-outline" onClick={() => navigate('/shipping')}>Edit</button>
              </div>
              {shippingType === 'cuet' ? (
                <div className="text-gray-700">
                  <p><span className="font-medium">Type:</span> CUET Campus</p>
                  <p><span className="font-medium">Name:</span> {shippingDetails?.name}</p>
                  <p><span className="font-medium">Phone:</span> {shippingDetails?.phone}</p>
                  <p><span className="font-medium">Student ID:</span> {shippingDetails?.studentId}</p>
                  <p><span className="font-medium">Department:</span> {shippingDetails?.department}</p>
                  <p><span className="font-medium">Email:</span> {shippingDetails?.email}</p>
                  <p><span className="font-medium">Hall:</span> {shippingDetails?.hallName}</p>
                  {shippingDetails?.roomNumber && <p><span className="font-medium">Room:</span> {shippingDetails.roomNumber}</p>}
                </div>
              ) : (
                <div className="text-gray-700">
                  <p><span className="font-medium">Type:</span> All Over Bangladesh</p>
                  <p><span className="font-medium">Name:</span> {shippingDetails?.name}</p>
                  <p><span className="font-medium">Phone:</span> {shippingDetails?.phone}</p>
                  <p><span className="font-medium">Email:</span> {shippingDetails?.email}</p>
                  <p><span className="font-medium">District:</span> {shippingDetails?.district}</p>
                  <p><span className="font-medium">Address:</span> {shippingDetails?.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Totals and Payment */}
          <div>
            <div className="bg-gray-50 rounded-xl p-6 shadow-md sticky top-20">
              <h2 className="text-2xl font-bold text-black mb-6">Payment Summary</h2>
              <div className="space-y-3 mb-6 text-gray-700">
                <div className="flex justify-between">
                  <span>Cart Total</span>
                  <span>{subtotal.toFixed(0)} Taka</span>
                </div>
                
                {/* Show preorder breakdown if there are preorder items */}
                {preorderSubtotal > 0 && (
                  <div className="border-t border-gray-300 pt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Payment Breakdown:</p>
                    {regularSubtotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Regular Items (100%)</span>
                        <span>{regularSubtotal.toFixed(0)} Taka</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-yellow-600">
                      <span>Preorder (50% now)</span>
                      <span>{preorderSubtotal.toFixed(0)} Taka</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Preorder (50% on delivery)</span>
                      <span>{remainingPreorder.toFixed(0)} Taka</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Subtotal to Pay Now</span>
                      <span>{payableSubtotal.toFixed(0)} Taka</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{delivery.toFixed(0)} Taka</span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-bold text-black">
                  <span>Total to Pay Now</span>
                  <span>{grandTotal.toFixed(0)} Taka</span>
                </div>
                {remainingPreorder > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Preorder Balance: {remainingPreorder.toFixed(0)} Taka
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      The remaining 50% will be collected on delivery for preorder items.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Payment Options</h3>
                {hasPreorderItems && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Preorder items require advance payment. COD is not available for preorder items.
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border ${paymentMethod === 'cod' ? 'border-black' : 'border-gray-200'} ${hasPreorderItems ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      disabled={hasPreorderItems}
                    />
                    <span className="font-medium">Cash on Delivery (COD){hasPreorderItems && ' (Not available for preorders)'}</span>
                  </label>
                  <div className={`p-3 rounded-lg border ${paymentMethod === 'pay_now' ? 'border-black' : 'border-gray-200'}`}>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === 'pay_now'} onChange={() => setPaymentMethod('pay_now')} />
                      <span className="font-medium">Pay Now</span>
                    </label>
                    {paymentMethod === 'pay_now' && (
                      <div className="mt-3 space-y-3 text-sm text-gray-700">
                        <div>
                          <label className="block text-sm mb-1">Payment Provider</label>
                          <select className="select select-bordered w-full" value={paymentInfo.provider || 'bkash'}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, provider: e.target.value })}>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                          </select>
                        </div>
                        <div className="p-3 bg-white rounded border">
                          <p className="font-medium text-lg flex items-center gap-3">
                            {paymentInfo.provider === 'nagad' ? 'Nagad' : paymentInfo.provider === 'rocket' ? 'Rocket' : 'bKash'} number:
                            <button type="button" onClick={copyGatewayNumber} className="link link-hover text-black text-xl">
                              {PAYMENT_NUMBER}
                            </button>
                          </p>
                          <ol className="list-decimal ml-5 mt-2 space-y-1">
                            <li>Open your {paymentInfo.provider === 'nagad' ? 'Nagad' : paymentInfo.provider === 'rocket' ? 'Rocket' : 'bKash'} app</li>
                            <li>Send {grandTotal.toFixed(0)} Taka to {PAYMENT_NUMBER}</li>
                            <li>Copy the sender number and TrxID</li>
                            <li>Fill the fields below and place order</li>
                          </ol>
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Payment Number</label>
                          <input className="input input-bordered w-full" value={paymentInfo.paymentNumber} onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentNumber: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Transaction ID (TrxID)</label>
                          <input className="input input-bordered w-full" value={paymentInfo.trxId} onChange={(e) => setPaymentInfo({ ...paymentInfo, trxId: e.target.value })} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button disabled={placing} onClick={placeOrder} className={`btn bg-black text-white hover:bg-gray-800 border-none w-full ${placing ? 'loading' : ''}`}>
                {placing ? 'Placing Order...' : 'Order Now'}
              </button>
              <button onClick={() => navigate('/shipping')} className="btn btn-outline w-full mt-3">Back to Shipping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


