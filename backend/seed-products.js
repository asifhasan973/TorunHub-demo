// Script to seed initial products into MongoDB
// Run with: node seed-products.js

require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  price: Number,
  stock: Number,
  image: String,
  isActive: Boolean,
  featured: Boolean,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const products = [
  {
    name: 'Classic Black Tee',
    category: 'tshirt',
    description: 'Premium cotton black t-shirt with minimalist design',
    price: 29.99,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    isActive: true,
    featured: true,
  },
  {
    name: 'White Essential Tee',
    category: 'tshirt',
    description: 'Clean white t-shirt perfect for everyday wear',
    price: 29.99,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80',
    isActive: true,
    featured: true,
  },
  {
    name: 'Graphic Print Tee',
    category: 'tshirt',
    description: 'Bold graphic design on premium fabric',
    price: 34.99,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80',
    isActive: true,
    featured: false,
  },
  {
    name: 'Black Pullover Hoodie',
    category: 'hoodie',
    description: 'Cozy black hoodie with kangaroo pocket',
    price: 59.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
    isActive: true,
    featured: true,
  },
  {
    name: 'Zip-Up Hoodie',
    category: 'hoodie',
    description: 'Versatile zip-up hoodie in premium quality',
    price: 64.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
    isActive: true,
    featured: false,
  },
  {
    name: 'Classic Sports Jersey',
    category: 'jersey',
    description: 'Breathable sports jersey with mesh panels',
    price: 49.99,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80',
    isActive: true,
    featured: true,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing products
    await Product.deleteMany({});

    // Insert products
    const inserted = await Product.insertMany(products);

    // Display summary
    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    
    byCategory.forEach(cat => {
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

seedProducts();

