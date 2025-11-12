/**
 * Calculate the effective price for a product based on tiered pricing
 * @param {Object} product - The product object
 * @param {number} totalQuantity - Total quantity of this product in cart (all sizes combined)
 * @returns {number} - The effective price per item
 */
export const calculateTieredPrice = (product, totalQuantity) => {
  // If no tiered pricing or empty array, use discountedPrice or regular price
  if (!product.tieredPricing || product.tieredPricing.length === 0) {
    return product.discountedPrice || product.price;
  }

  // Sort tiered pricing by quantity (ascending) to find the right tier
  const sortedTiers = [...product.tieredPricing].sort((a, b) => a.quantity - b.quantity);
  
  // Find the highest tier that the quantity qualifies for
  let applicableTier = null;
  for (const tier of sortedTiers) {
    if (totalQuantity >= tier.quantity) {
      applicableTier = tier;
    } else {
      break;
    }
  }

  // Return the tier price if found, otherwise use discountedPrice or regular price
  if (applicableTier) {
    return applicableTier.price;
  }

  return product.discountedPrice || product.price;
};

/**
 * Get the total quantity of a specific product in the cart (across all sizes)
 * @param {Array} cartItems - All cart items
 * @param {string} productId - The product ID to count
 * @returns {number} - Total quantity
 */
export const getTotalProductQuantity = (cartItems, productId) => {
  return cartItems
    .filter(item => {
      const itemId = item._id || item.id;
      const originalId = item.originalProductId;
      // Match either the item's ID or its originalProductId
      return itemId === productId || originalId === productId;
    })
    .reduce((total, item) => total + item.quantity, 0);
};

/**
 * Calculate the effective price for a cart item considering tiered pricing
 * @param {Object} item - Cart item
 * @param {Array} cartItems - All cart items (to calculate total quantity)
 * @returns {number} - Effective price per item
 */
export const getItemEffectivePrice = (item, cartItems) => {
  // Use originalProductId if it exists (for variants), otherwise use the item's own ID
  const productId = item.originalProductId || item._id || item.id;
  const totalQuantity = getTotalProductQuantity(cartItems, productId);
  return calculateTieredPrice(item, totalQuantity);
};
