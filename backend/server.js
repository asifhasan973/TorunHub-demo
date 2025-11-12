/* eslint-env node */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

// Middleware - CORS with multiple allowed origins
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy',
});

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      reject(new Error('No image buffer provided'));
      return;
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'dummy') {
      // Fallback: return a placeholder URL if Cloudinary is not configured
      resolve('https://via.placeholder.com/1200x1200?text=Image+Upload');
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Write buffer to stream
    uploadStream.write(buffer);
    uploadStream.end();
  });
};

// Helper function to write order to Google Sheets
const writeOrderToGoogleSheets = async (order) => {
  try {
    // Check if Google Sheets is configured
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');


    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      return;
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Format order data for the sheet
    const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Format items as a string
    const itemsString = order.items
      .map(
        (item) =>
          `${item.name} (Qty: ${item.quantity}${item.size ? `, Size: ${item.size}` : ''}${item.isPreorder ? ' [PREORDER]' : ''}${item.customName ? `, Custom: ${item.customName} #${item.customNumber}` : ''})`
      )
      .join('; ');

    // Format shipping details
    const shippingInfo = order.shippingDetails
      ? `${order.shippingDetails.name || ''}, ${order.shippingDetails.phone || ''}, ${order.shippingDetails.address || ''}, ${order.shippingDetails.city || ''}, ${order.shippingDetails.postalCode || ''}`
      : 'N/A';

    // Format payment info
    const paymentInfoString = order.paymentInfo
      ? `${order.paymentInfo.provider || 'N/A'} - ${order.paymentInfo.paymentNumber || 'N/A'} (TrxID: ${order.paymentInfo.trxId || 'N/A'})`
      : 'N/A';

    // Prepare row data
    const rowData = [
      order.shortOrderId || order._id.toString(),
      orderDate,
      order.userName || 'N/A',
      order.userEmail,
      itemsString,
      order.subtotal.toFixed(2),
      order.payableSubtotal?.toFixed(2) || order.subtotal.toFixed(2),
      order.remainingPreorderAmount?.toFixed(2) || '0.00',
      order.discount?.toFixed(2) || '0.00',
      order.deliveryCharge.toFixed(2),
      order.total.toFixed(2),
      order.paymentMethod,
      order.paymentStatus,
      paymentInfoString,
      order.shippingType === 'cuet' ? 'CUET' : 'Bangladesh',
      shippingInfo,
      order.status,
      order.trackingNumber || '',
      order.notes || '',
    ];

    // Check if sheet exists, create if it doesn't
    const sheetName = 'Orders';
    let sheetId = null;
    
    try {
      // Get spreadsheet to check if sheet exists
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      const sheetExists = spreadsheet.data.sheets.some(
        (sheet) => sheet.properties.title === sheetName
      );

      if (!sheetExists) {
        const createResponse = await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });
        sheetId = createResponse.data.replies[0].addSheet.properties.sheetId;
      } else {
        sheetId = spreadsheet.data.sheets.find(s => s.properties.title === sheetName)?.properties.sheetId;
      }

      // Check if sheet has headers, if not add them
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:S1`,
      });

      const needsHeaders = !headerCheck.data.values || headerCheck.data.values.length === 0 || 
                          !headerCheck.data.values[0] || headerCheck.data.values[0][0] !== 'Order ID';

      if (needsHeaders) {
        // Add headers with formatting
        const headerRow = [
          'Order ID',
          'Date/Time',
          'Customer Name',
          'Customer Email',
          'Items',
          'Cart Subtotal',
          'Payable Now',
          'Preorder Balance',
          'Discount',
          'Delivery Charge',
          'Total Paid',
          'Payment Method',
          'Payment Status',
          'Payment Info',
          'Shipping Type',
          'Shipping Details',
          'Status',
          'Tracking Number',
          'Notes',
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:S1`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [headerRow],
          },
        });

        // Format headers: bold and background color
        if (sheetId !== undefined && sheetId !== null) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 19,
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                        textFormat: {
                          foregroundColor: { red: 1, green: 1, blue: 1 },
                          bold: true,
                        },
                      },
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)',
                  },
                },
                // Auto-resize columns
                {
                  autoResizeDimensions: {
                    dimensions: {
                      sheetId: sheetId,
                      dimension: 'COLUMNS',
                      startIndex: 0,
                      endIndex: 18,
                    },
                  },
                },
              ],
            },
          });
        }

      }
    } catch (headerError) {
      // Continue anyway - try to append data
    }

    // Find the next empty row
    let nextRow = 2; // Start from row 2 (row 1 is headers)
    try {
      const allData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
      });
      if (allData.data.values) {
        nextRow = allData.data.values.length + 1;
      }
    } catch (err) {
      // If we can't read, just use row 2
    }

    // Write order data to specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${nextRow}:S${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData],
      },
    });

  } catch (error) {
    // Log error but don't throw - we don't want to fail order creation if Sheets fails
  }
};

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in backend/.env file');
  console.error('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/torunhut');
  process.exit(1);
}

console.log('🔄 Connecting to MongoDB...');
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Please check your MONGODB_URI in backend/.env');
    process.exit(1);
  });

// Firebase Admin Initialization
try {
  console.log('🔄 Initializing Firebase Admin...');
  // Check if running on Vercel or using environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Use JSON from environment variable (entire service account JSON as string)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized (from env variable)');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use individual environment variables (recommended for Vercel)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized (from individual env vars)');
  } else {
    // Fallback to JSON file (local development)
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized (from service account file)');
  }
} catch (error) {
  console.warn('⚠️  Firebase Admin initialization failed:', error.message);
  console.warn('Authentication features will not work. Please configure Firebase credentials.');
  // Firebase initialization failed - continue without it
}

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, trim: true },
    photoURL: { type: String },
    role: { type: String, enum: ['user', 'subadmin', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// Helper function to normalize category
const normalizeCategory = (category) => {
  if (!category) return 'tshirt';
  const lower = category.toLowerCase().trim();
  // Map variations to standard format
  if (lower === 't-shirt' || lower === 't shirt' || lower === 'tshirt') return 'tshirt';
  if (lower === 'hoodie' || lower === 'hoodies') return 'hoodie';
  if (lower === 'jersey' || lower === 'jerseys') return 'jersey';
  return lower; // Return as-is if doesn't match
};

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['tshirt', 'hoodie', 'jersey'],
      lowercase: true,
      index: true,
    },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0, default: null },
    tieredPricing: [{
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    isPreorder: { type: Boolean, default: false, index: true },
    preorderPaymentType: { type: String, enum: ['full', 'half'], default: 'half' },
    requireCustomNameNumber: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    shortOrderId: { type: String, unique: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    userName: { type: String },
    items: [
      {
        productId: { type: String }, // Changed from ObjectId to String to handle variants
        originalProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // For variants
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String },
        image: { type: String },
        isPreorder: { type: Boolean, default: false },
        preorderPaymentType: { type: String, enum: ['half', 'full'], default: 'half' }, // Payment type for preorder
        isVariant: { type: Boolean, default: false }, // Flag for variant items
        // Optional customizations for preorder jerseys
        customName: { type: String },
        customNumber: { type: String },
      },
    ],
    subtotal: { type: Number, default: 0 },
    preorderSubtotal: { type: Number, default: 0 }, // 50% of preorder items
    regularSubtotal: { type: Number, default: 0 }, // 100% of regular items
    payableSubtotal: { type: Number, default: 0 }, // Amount to pay now (regular 100% + preorder 50%)
    remainingPreorderAmount: { type: Number, default: 0 }, // 50% remaining for preorder items
    discount: { type: Number, default: 0 }, // Quantity-based discount
    deliveryCharge: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 }, // Total to pay now
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Shipping type and details (Bangladesh specific)
    shippingType: { type: String, enum: ['cuet', 'bd'], required: true },
    shippingDetails: { type: Object, required: true },
    // Payment
    paymentMethod: { type: String, enum: ['COD', 'PAY_NOW'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    paymentInfo: {
      provider: { type: String },
      gatewayNumber: { type: String },
      paymentNumber: { type: String },
      trxId: { type: String },
    },
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

// Helper function to generate unique 5-digit order ID
const generateUniqueOrderId = async () => {
  let orderId;
  let exists = true;
  while (exists) {
    // Generate random 5-digit number (10000-99999)
    orderId = Math.floor(10000 + Math.random() * 90000).toString();
    const existingOrder = await Order.findOne({ shortOrderId: orderId });
    exists = !!existingOrder;
  }
  return orderId;
};

// Settings Schema
const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'TorunHut' },
    tagline: { type: String, default: 'Wear Your Style' },
    heroTitle: { type: String, default: 'Welcome to TorunHut' },
    heroSubtitle: { type: String, default: 'Premium Quality Clothing' },
    carouselImages: [{ type: String }],
    bannerImage: { type: String },
    contactEmail: { type: String, default: 'contact@torunhut.com' },
    contactPhone: { type: String, default: '+1234567890' },
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

// ============ MIDDLEWARE ============

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking admin status' });
  }
};

// Middleware to check if user has admin or subadmin access
const hasAdminAccess = async (req, res, next) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user || (user.role !== 'admin' && user.role !== 'subadmin')) {
      return res.status(403).json({ error: 'Admin or SubAdmin access required' });
    }
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error checking access' });
  }
};

// ============ PRODUCT ROUTES ============

// GET /api/products - Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = normalizeCategory(category);
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

// GET /api/products/:id - Get single product (public)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// GET /api/products/category/:category - Get products by category (public)
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const category = normalizeCategory(req.params.category);
    const products = await Product.find({
      category: category,
      isActive: true
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// POST /api/products - Create product (Admin/SubAdmin only)
app.post('/api/products', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const { name, category, description, price, discountedPrice, tieredPricing, stock, image, images, sizes, colors, featured, tags, isPreorder, preorderPaymentType, requireCustomNameNumber } = req.body;

    if (!name || !category || !price || stock === undefined || !image) {
      return res.status(400).json({ error: 'Missing required fields: name, category, price, stock, image' });
    }

    // Validate image is a URL, not base64 data
    if (image.startsWith('data:')) {
      return res.status(400).json({
        error: 'Invalid image format. Image must be uploaded first. Base64 data is not allowed.'
      });
    }

    // Validate image is a proper URL
    if (!image.startsWith('http://') && !image.startsWith('https://')) {
      return res.status(400).json({
        error: 'Invalid image URL. Image must be a valid HTTP/HTTPS URL.'
      });
    }


    // Normalize category before saving
    const normalizedCategory = normalizeCategory(category);

    const product = new Product({
      name,
      category: normalizedCategory,
      description: description || '',
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      tieredPricing: tieredPricing && Array.isArray(tieredPricing) 
        ? tieredPricing.map(tier => ({
            quantity: parseInt(tier.quantity),
            price: parseFloat(tier.price)
          })).sort((a, b) => a.quantity - b.quantity)
        : [],
      stock: parseInt(stock),
      image,
      images: images ? (Array.isArray(images) ? images : [images]) : [],
      sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',')) : [],
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(',')) : [],
      featured: featured === 'true' || featured === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      isPreorder: isPreorder === 'true' || isPreorder === true,
      preorderPaymentType: preorderPaymentType || 'half',
      requireCustomNameNumber: requireCustomNameNumber === 'true' || requireCustomNameNumber === true,
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Error creating product', details: error.message });
  }
});

// PUT /api/products/:id - Update product (Admin/SubAdmin only)
app.put('/api/products/:id', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const { name, category, description, price, discountedPrice, tieredPricing, stock, image, images, sizes, colors, featured, tags, isActive, isPreorder, preorderPaymentType, requireCustomNameNumber } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name) product.name = name;
    if (category) product.category = normalizeCategory(category);
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (discountedPrice !== undefined) {
      product.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : null;
    }
    if (tieredPricing !== undefined) {
      product.tieredPricing = tieredPricing && Array.isArray(tieredPricing)
        ? tieredPricing.map(tier => ({
            quantity: parseInt(tier.quantity),
            price: parseFloat(tier.price)
          })).sort((a, b) => a.quantity - b.quantity)
        : [];
    }
    if (stock !== undefined) product.stock = parseInt(stock);
    if (image) product.image = image;
    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [images];
    }
    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',');
    }
    if (colors !== undefined) {
      product.colors = Array.isArray(colors) ? colors : colors.split(',');
    }
    if (featured !== undefined) {
      product.featured = featured === 'true' || featured === true;
    }
    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : tags.split(',');
    }
    if (isActive !== undefined) {
      product.isActive = isActive === 'true' || isActive === true;
    }
    if (isPreorder !== undefined) {
      product.isPreorder = isPreorder === 'true' || isPreorder === true;
    }
    if (preorderPaymentType !== undefined) {
      product.preorderPaymentType = preorderPaymentType;
    }
    if (requireCustomNameNumber !== undefined) {
      product.requireCustomNameNumber = requireCustomNameNumber === 'true' || requireCustomNameNumber === true;
    }

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Error updating product', details: error.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin/SubAdmin only)
app.delete('/api/products/:id', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// ============ USER ROUTES ============

// Create or update user
app.post('/api/users/create', verifyToken, async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, role } = req.body;

    let user = await User.findOne({ uid: uid || req.user.uid });

    if (user) {
      if (displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;
      if (email) user.email = email;
      user.lastLogin = new Date();
      await user.save();
      return res.json({ message: 'User updated', user });
    }

    user = new User({
      uid: uid || req.user.uid,
      email: email || req.user.email,
      displayName: displayName || req.user.name,
      photoURL: photoURL || req.user.picture,
      role: role || 'user',
    });

    await user.save();
    res.json({ message: 'User created', user });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
});

// Get user role
app.get('/api/users/role', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.json({ role: 'user' });
    }
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching role' });
  }
});

// Get all users (Admin only)
app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Update user role (Admin only)
app.put('/api/users/:uid/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    if (!['user', 'subadmin', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate({ uid }, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Error updating role' });
  }
});

// Create admin/subadmin (Admin only)
app.post('/api/users/create-admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const { email, password, role, displayName } = req.body;

    if (!['admin', 'subadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or subadmin' });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    const user = new User({
      uid: userRecord.uid,
      email,
      displayName,
      role,
    });

    await user.save();
    res.json({ message: `${role} created successfully`, user });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Error creating admin/subadmin', details: error.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:uid', verifyToken, isAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    try {
      await admin.auth().deleteUser(uid);
    } catch (firebaseError) {
      // Firebase user might not exist
    }

    const user = await User.findOneAndDelete({ uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// ============ ORDER ROUTES ============

// Create order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, shippingType, shippingDetails, deliveryCharge, paymentMethod, paymentInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    if (!shippingType || !shippingDetails) {
      return res.status(400).json({ error: 'Shipping type and details are required' });
    }

    let calculatedSubtotal = 0;
    let preorderPayableAmount = 0; // Amount to pay now for preorder items
    let regularSubtotal = 0;
    let remainingPreorderAmount = 0; // Amount to pay on delivery for preorder items
    
    // Process items and calculate totals
    const processedItems = [];
    for (const item of items) {
      let product = null;
      let isPreorder = item.isPreorder || false;
      let preorderPaymentType = item.preorderPaymentType || 'half'; // Use frontend value as default
      let actualProductId = item.productId;
      let originalProductId = null;
      let isVariant = false;
      
      // Check if this is a variant item (has underscore and timestamp)
      if (item.productId && item.productId.includes('_')) {
        isVariant = true;
        // Extract original product ID (part before first underscore)
        originalProductId = item.productId.split('_')[0];
        actualProductId = originalProductId;
      }
      
      // Try to fetch product details for stock validation
      // We trust the frontend for isPreorder and preorderPaymentType since it has the latest cart data
      if (actualProductId && mongoose.Types.ObjectId.isValid(actualProductId)) {
        try {
          product = await Product.findById(actualProductId);
          if (product && product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
          }
          if (product) {
            // Use frontend values for isPreorder and preorderPaymentType (they come from cart context)
            // Only override if not provided by frontend
            if (item.isPreorder === undefined || item.isPreorder === null) {
              isPreorder = product.isPreorder || false;
            }
            if (!item.preorderPaymentType) {
              preorderPaymentType = product.preorderPaymentType || 'half';
            }
          }
        } catch (err) {
          // Error fetching product - continue with item data
        }
      }
      
      // item.price already contains the effective price (tiered/discounted) from frontend
      const itemTotal = item.price * item.quantity;
      calculatedSubtotal += itemTotal;
      
      // Calculate preorder vs regular amounts based on payment type
      if (isPreorder) {
        if (preorderPaymentType === 'half') {
          // Pay 50% now, 50% on delivery
          preorderPayableAmount += itemTotal * 0.5;
          remainingPreorderAmount += itemTotal * 0.5;
        } else {
          // Pay full amount now
          preorderPayableAmount += itemTotal;
        }
      } else {
        // Regular items - pay full amount now
        regularSubtotal += itemTotal;
      }
      
      processedItems.push({
        productId: item.productId, // Keep original ID (including variant IDs)
        originalProductId: isVariant ? originalProductId : null,
        name: item.name,
        price: item.price, // Effective price (already includes tiered/discounted pricing)
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        isPreorder: isPreorder,
        preorderPaymentType: preorderPaymentType,
        isVariant: isVariant,
        customName: item.customName,
        customNumber: item.customNumber,
      });
    }

    const payableSubtotal = regularSubtotal + preorderPayableAmount;
    
    // No quantity discount - removed as per requirements
    const discount = 0;
    
    const computedDelivery = shippingType === 'bd' ? 100 : 0;
    const finalDelivery = typeof deliveryCharge === 'number' ? deliveryCharge : computedDelivery;
    const total = payableSubtotal + finalDelivery; // Total to pay now (no discount)

    // Generate unique 5-digit order ID
    const shortOrderId = await generateUniqueOrderId();

    // Determine payment status
    let paymentStatus = 'pending';
    if (paymentMethod === 'PAY_NOW') {
      paymentStatus = remainingPreorderAmount > 0 ? 'partial' : 'paid';
    }

    const order = new Order({
      shortOrderId,
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: req.user.name || shippingDetails.name,
      items: processedItems,
      subtotal: calculatedSubtotal, // Total cart value (100%)
      preorderSubtotal: preorderPayableAmount, // Amount to pay now for preorder items
      regularSubtotal, // Regular items total
      payableSubtotal, // Total to pay now (regular + preorder payable)
      remainingPreorderAmount, // Amount to collect on delivery
      discount, // No discount
      deliveryCharge: finalDelivery,
      total, // Final amount to pay now
      shippingType,
      shippingDetails,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus,
      paymentInfo: paymentMethod === 'PAY_NOW' ? (paymentInfo || {}) : undefined,
    });

    // Update product stock
    for (const item of processedItems) {
      // For variants, use the originalProductId; for regular items, use productId
      const productIdToUpdate = item.originalProductId || item.productId;
      
      if (productIdToUpdate && mongoose.Types.ObjectId.isValid(productIdToUpdate)) {
        try {
          await Product.findByIdAndUpdate(productIdToUpdate, {
            $inc: { stock: -item.quantity },
          });
        } catch (err) {
          // Continue anyway - order is more important than stock update
        }
      }
    }

    await order.save();

    // Write order to Google Sheets (non-blocking)
    writeOrderToGoogleSheets(order).catch(() => {
      // Google Sheets write failed - non-critical
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
});

// Get user orders
app.get('/api/orders/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image isPreorder requireCustomNameNumber');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Get all orders (Admin/SubAdmin only)
app.get('/api/orders', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name image isPreorder requireCustomNameNumber');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Update order status (Admin/SubAdmin only)
app.put('/api/orders/:id/status', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: 'Error updating order status' });
  }
});

// ============ STATS ROUTES ============

app.get('/api/stats', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Products by category
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: revenue[0]?.total || 0,
      },
      ordersByStatus: ordersByStatus.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      productsByCategory: productsByCategory.map((item) => ({
        category: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TorunHut Backend API',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ============ IMAGE UPLOAD ROUTES ============

// Upload image endpoint
app.post('/api/upload/image', verifyToken, hasAdminAccess, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const folder = req.body.folder || 'products';
    const imageUrl = await uploadToCloudinary(req.file.buffer, folder);

    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to get image URL from upload service' });
    }

    res.json({ url: imageUrl });
  } catch (error) {
    const errorMessage = error.message || 'Failed to upload image';
    res.status(500).json({
      error: 'Failed to upload image',
      details: errorMessage
    });
  }
});

// ============ SETTINGS ROUTES ============

// Get settings (public, but only one document)
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching settings', details: error.message });
  }
});

// Update settings (Admin/SubAdmin only)
app.put('/api/settings', verifyToken, hasAdminAccess, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Error updating settings', details: error.message });
  }
});

// Test MongoDB connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    res.json({
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      database: mongoose.connection.name,
      collections: {
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    hint: 'All API routes start with /api. Example: /api/users, /api/products, /api/orders'
  });
});

// Export for Vercel serverless functions
module.exports = app;

// Only listen on port if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API health check: http://localhost:${PORT}/api/health`);
  });
}
