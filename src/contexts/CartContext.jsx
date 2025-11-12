import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shippingDetails, setShippingDetails] = useState(null);
  const [shippingType, setShippingType] = useState('cuet'); // 'cuet' | 'bd'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'pay_now'
  const [paymentInfo, setPaymentInfo] = useState({ provider: 'bkash', paymentNumber: '', trxId: '' });
  
  // Track total quantity per product (including all variants)
  const [productQuantityMap, setProductQuantityMap] = useState({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('torunhut-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch (error) {
      }
    }
    const savedShipping = localStorage.getItem('torunhut-shipping-details');
    if (savedShipping) {
      try {
        const parsed = JSON.parse(savedShipping);
        setShippingDetails(parsed.details || null);
        if (parsed.type) setShippingType(parsed.type);
      } catch (error) {
      }
    }
    const savedPayment = localStorage.getItem('torunhut-payment');
    if (savedPayment) {
      try {
        const parsed = JSON.parse(savedPayment);
        if (parsed.method) setPaymentMethod(parsed.method);
        if (parsed.info) setPaymentInfo({ provider: 'bkash', ...parsed.info });
      } catch (error) {
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('torunhut-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  useEffect(() => {
    localStorage.setItem(
      'torunhut-shipping-details',
      JSON.stringify({ type: shippingType, details: shippingDetails })
    );
  }, [shippingDetails, shippingType]);

  useEffect(() => {
    localStorage.setItem(
      'torunhut-payment',
      JSON.stringify({ method: paymentMethod, info: paymentInfo })
    );
  }, [paymentMethod, paymentInfo]);

  // Calculate total quantity for each product (including variants)
  useEffect(() => {
    const quantityMap = {};
    
    cartItems.forEach((item) => {
      // Get the original product ID (for variants) or the item's ID
      const productId = item.originalProductId || item._id || item.id;
      
      if (!quantityMap[productId]) {
        quantityMap[productId] = 0;
      }
      
      quantityMap[productId] += item.quantity;
    });
    
    setProductQuantityMap(quantityMap);
  }, [cartItems]);

  // Helper function to calculate tiered price based on total quantity
  const calculateTieredPrice = (item) => {
    const productId = item.originalProductId || item._id || item.id;
    const totalQuantity = productQuantityMap[productId] || item.quantity;
    
    // Check if item has tiered pricing
    if (!item.tieredPricing || item.tieredPricing.length === 0) {
      return item.discountedPrice || item.price;
    }
    
    // Convert prices to numbers and sort by quantity descending
    const sortedTiers = [...item.tieredPricing]
      .map(tier => ({
        quantity: Number(tier.quantity),
        price: Number(tier.price)
      }))
      .sort((a, b) => b.quantity - a.quantity);
    
    // Find the first tier where total quantity meets or exceeds the requirement
    let applicableTier = null;
    for (const tier of sortedTiers) {
      if (totalQuantity >= tier.quantity) {
        applicableTier = tier;
        break;
      }
    }
    
    const finalPrice = applicableTier ? applicableTier.price : (item.discountedPrice || item.price);
    
    return finalPrice;
  };

  // Get effective price for an item (considers tiered, discounted, or regular price)
  const getItemEffectivePrice = (item) => {
    return calculateTieredPrice(item);
  };

  // Get total quantity of a product (including all variants)
  const getTotalProductQuantity = (productId) => {
    return productQuantityMap[productId] || 0;
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const productKey = product._id || product.id;
      const existingItem = prevItems.find((item) => (item._id || item.id) === productKey);
      if (existingItem) {
        toast.info('Quantity updated');
        return prevItems.map((item) =>
          (item._id || item.id) === productKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success('Added to cart');
        return [...prevItems, { ...product, id: productKey, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item._id || item.id) !== productId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item._id || item.id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateItemSize = (productId, size) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item._id || item.id) === productId ? { ...item, size } : item
      )
    );
  };

  const addDifferentSize = (item) => {
    // Get the true original product ID
    // If item already has originalProductId, use that (it's a variant)
    // Otherwise, use the item's own ID (it's the original product)
    const trueOriginalId = item.originalProductId || item._id || item.id;
    const uniqueId = `${trueOriginalId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    
    const clonedItem = {
      ...item,
      id: uniqueId, // Generate unique ID
      _id: undefined, // Remove _id to avoid confusion
      originalProductId: trueOriginalId, // ALWAYS use the true original product ID
      quantity: 1, // Start with quantity of 1
      size: item.size || 'M', // Keep the original size, user will change it
      isVariant: true, // Mark as variant for identification
      isPreorder: item.isPreorder || false, // Preserve preorder status
      // Preserve tiered pricing from original product
      tieredPricing: item.tieredPricing || [],
    };
    
    setCartItems((prevItems) => [...prevItems, clonedItem]);
    toast.success('Added variant for different size');
  };

  const clearCart = (silent = false) => {
    setCartItems([]);
    if (!silent) {
      toast.success('Cart cleared');
    }
  };

  const clearCheckoutState = () => {
    setShippingDetails(null);
    setShippingType('cuet');
    setPaymentMethod('cod');
    setPaymentInfo({ paymentNumber: '', trxId: '' });
    localStorage.removeItem('torunhut-shipping-details');
    localStorage.removeItem('torunhut-payment');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getItemEffectivePrice(item);
      return total + price * item.quantity;
    }, 0);
  };

  // Calculate preorder subtotal (50% or 100% based on payment type)
  const getPreorderSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.isPreorder) {
        const price = getItemEffectivePrice(item);
        const paymentType = item.preorderPaymentType || 'half';
        const multiplier = paymentType === 'half' ? 0.5 : 1;
        return total + (price * item.quantity * multiplier);
      }
      return total;
    }, 0);
  };

  // Calculate regular items subtotal (100% of regular items)
  const getRegularSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item.isPreorder) {
        const price = getItemEffectivePrice(item);
        return total + price * item.quantity;
      }
      return total;
    }, 0);
  };

  // Calculate total amount to pay now (regular items 100% + preorder based on payment type)
  const getPayableTotal = () => {
    return getRegularSubtotal() + getPreorderSubtotal();
  };

  // Calculate remaining amount for preorder items (only for half payment type)
  const getRemainingPreorderAmount = () => {
    const preorderRemaining = cartItems.reduce((total, item) => {
      if (item.isPreorder) {
        const price = getItemEffectivePrice(item);
        const paymentType = item.preorderPaymentType || 'half';
        if (paymentType === 'half') {
          return total + (price * item.quantity * 0.5); // Remaining 50%
        }
      }
      return total;
    }, 0);
    
    // If there are preorder items with half payment, split delivery charge proportionally
    const preorderTotal = cartItems.reduce((total, item) => {
      if (item.isPreorder) {
        const price = getItemEffectivePrice(item);
        return total + (price * item.quantity);
      }
      return total;
    }, 0);
    
    const cartTotal = getCartTotal();
    
    // Only add delivery charge portion if cart has preorder items
    if (preorderTotal > 0 && cartTotal > 0) {
      const deliveryCharge = getDeliveryCharge();
      const preorderProportion = preorderTotal / cartTotal;
      const preorderDeliveryShare = deliveryCharge * preorderProportion * 0.5; // 50% of their share
      return preorderRemaining + preorderDeliveryShare;
    }
    
    return preorderRemaining;
  };

  // Calculate quantity-based discount (REMOVED - Using product-level discounts instead)
  const getQuantityDiscount = () => {
    return 0; // No quantity discount
  };

  // Get discount message (REMOVED - Using product-level discounts instead)
  const getDiscountMessage = () => {
    return null; // No discount message
  };

  const getDeliveryCharge = () => {
    return shippingType === 'bd' ? 100 : 0;
  };

  const getGrandTotal = () => {
    return getPayableTotal() - getQuantityDiscount() + getDeliveryCharge();
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Helper to get effective price for a specific item (for UI display)
  const getEffectivePrice = (item) => {
    return getItemEffectivePrice(item);
  };

  // Helper to get total quantity of a product across all sizes
  const getProductTotalQuantity = (productId) => {
    return getTotalProductQuantity(productId);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemSize,
    addDifferentSize,
    clearCart,
    clearCheckoutState,
    getCartTotal,
    getPreorderSubtotal,
    getRegularSubtotal,
    getPayableTotal,
    getRemainingPreorderAmount,
    getQuantityDiscount,
    getDiscountMessage,
    getDeliveryCharge,
    getGrandTotal,
    getCartCount,
    getEffectivePrice,
    getProductTotalQuantity,
    shippingDetails,
    setShippingDetails,
    shippingType,
    setShippingType,
    paymentMethod,
    setPaymentMethod,
    paymentInfo,
    setPaymentInfo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
