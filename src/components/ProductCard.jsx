import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Determine the display price
  const displayPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const paymentType = product.preorderPaymentType || 'half';
  const preorderAmount = paymentType === 'half' ? displayPrice * 0.5 : displayPrice;

  return (
    <Link to={`/product/${product._id || product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer h-full flex flex-col"
      >
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {product.isPreorder && (
            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              Pre Order Only
            </div>
          )}
          {hasDiscount && !product.isPreorder && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-black mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          <div className="mt-auto">
            {product.isPreorder ? (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  {hasDiscount ? (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        {Number(product.price).toFixed(0)} Taka
                      </span>
                      <span className="text-3xl font-bold text-green-600">
                        {Number(product.discountedPrice).toFixed(0)} Taka
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">
                      {Number(product.price).toFixed(0)} Taka
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">
                   <span className='text-lg text-yellow-600 font-bold'>{preorderAmount.toFixed(0)} Taka  </span> 
                   {paymentType === 'half' ? 'Pay 50% Now + 50% on delivery' : 'Pay Full Amount Now'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-3">
                {hasDiscount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-gray-400 line-through">
                      {Number(product.price).toFixed(0)} Taka
                    </span>
                    <span className="text-4xl font-bold text-green-600">
                      {Number(product.discountedPrice).toFixed(0)} Taka
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-black">
                    {Number(product.price).toFixed(0)} Taka
                  </span>
                )}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="btn btn-sm bg-black text-white hover:bg-gray-800 border-none btn-hover w-full"
            >
              <FiShoppingCart className="mr-1" />
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
