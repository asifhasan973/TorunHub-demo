// Mock product data for the TorunHut eCommerce store
// In a real application, this would come from an API or database

export const products = [
  // T-Shirts
  {
    id: 1,
    name: 'Classic Black Tee',
    category: 'tshirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80',
    description: 'Premium cotton black t-shirt with minimalist design',
  },
  {
    id: 2,
    name: 'White Essential Tee',
    category: 'tshirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&q=80',
    description: 'Clean white t-shirt perfect for everyday wear',
  },
  {
    id: 3,
    name: 'Graphic Print Tee',
    category: 'tshirt',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80',
    description: 'Bold graphic design on premium fabric',
  },
  {
    id: 4,
    name: 'Vintage Black Tee',
    category: 'tshirt',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&q=80',
    description: 'Vintage-inspired black tee with soft wash',
  },
  {
    id: 5,
    name: 'Oversized Tee',
    category: 'tshirt',
    price: 36.99,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80',
    description: 'Relaxed fit oversized t-shirt for ultimate comfort',
  },
  {
    id: 6,
    name: 'Striped Tee',
    category: 'tshirt',
    price: 31.99,
    image: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=500&q=80',
    description: 'Classic black and white striped t-shirt',
  },

  // Hoodies
  {
    id: 7,
    name: 'Black Pullover Hoodie',
    category: 'hoodie',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
    description: 'Cozy black hoodie with kangaroo pocket',
  },
  {
    id: 8,
    name: 'Zip-Up Hoodie',
    category: 'hoodie',
    price: 64.99,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
    description: 'Versatile zip-up hoodie in premium quality',
  },
  {
    id: 9,
    name: 'Oversized Hoodie',
    category: 'hoodie',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
    description: 'Ultra-comfortable oversized hoodie',
  },
  {
    id: 10,
    name: 'Minimalist White Hoodie',
    category: 'hoodie',
    price: 62.99,
    image: 'https://images.unsplash.com/photo-1614252368036-fb86d47d5f38?w=500&q=80',
    description: 'Clean white hoodie with subtle branding',
  },
  {
    id: 11,
    name: 'Technical Hoodie',
    category: 'hoodie',
    price: 74.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
    description: 'Performance hoodie with technical fabric',
  },
  {
    id: 12,
    name: 'Classic Logo Hoodie',
    category: 'hoodie',
    price: 67.99,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
    description: 'Iconic hoodie with embroidered logo',
  },

  // Jerseys
  {
    id: 13,
    name: 'Classic Sports Jersey',
    category: 'jersey',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80',
    description: 'Breathable sports jersey with mesh panels',
  },
  {
    id: 14,
    name: 'Premium Jersey Black',
    category: 'jersey',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&q=80',
    description: 'Premium black jersey with moisture-wicking technology',
  },
  {
    id: 15,
    name: 'Vintage Jersey',
    category: 'jersey',
    price: 52.99,
    image: 'https://images.unsplash.com/photo-1628250361098-e77e48a9b8df?w=500&q=80',
    description: 'Retro-style jersey with classic fit',
  },
  {
    id: 16,
    name: 'Performance Jersey',
    category: 'jersey',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=500&q=80',
    description: 'High-performance jersey for active wear',
  },
  {
    id: 17,
    name: 'Street Jersey',
    category: 'jersey',
    price: 56.99,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&q=80',
    description: 'Urban street-style jersey',
  },
  {
    id: 18,
    name: 'Elite Jersey',
    category: 'jersey',
    price: 64.99,
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&q=80',
    description: 'Top-tier jersey with premium features',
  },
];

export const getProductsByCategory = (category) => {
  return products.filter((product) => product.category === category);
};

export const getTopProductsByCategory = (category, limit = 3) => {
  return products.filter((product) => product.category === category).slice(0, limit);
};

export const getProductById = (id) => {
  return products.find((product) => product.id === parseInt(id));
};

export const carouselImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
    title: 'New Collection',
    subtitle: 'Discover our latest styles',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    title: 'Premium Quality',
    subtitle: 'Crafted with excellence',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1521498542256-5aeb47ba2b36?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340',
    title: 'Urban Style',
    subtitle: 'Define your style',
  },
];
