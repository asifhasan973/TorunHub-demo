# TorunHut Demo - Full-Stack E-Commerce Platform

> **This is a demo version** of my part-time startup [TorunHut](https://www.torunhut.com/) - a premium streetwear clothing brand specializing in custom jerseys, hoodies, and t-shirts.

## 🌐 Live Demo

**Live Site**: [https://torunhub-demo.vercel.app/](https://torunhub-demo.vercel.app/)

### Demo Admin Credentials

- **Email**: `admin@torunhutdemo.com`
- **Password**: `123456`

---

## ⭐ Unique Features

### 🎯 Advanced E-Commerce Features

- **Tiered Pricing System**: Dynamic bulk pricing - buy more, save more
- **Pre-order Management**: Support for full/half payment pre-orders with custom name/number options
- **Multi-Image Product Gallery**: Multiple product images with Cloudinary CDN integration
- **Smart Inventory Tracking**: Real-time stock management with low-stock alerts
- **Order Status Workflow**: Complete order lifecycle from pending to delivered
- **Google Sheets Integration**: Automatic order export to Google Sheets for easy management

### 🔐 Authentication & Authorization

- **Firebase Authentication**: Email/Password and Google Sign-in
- **Role-Based Access Control**: Admin, Moderator, and User roles with granular permissions
- **Protected Admin Routes**: Secure admin panel with role verification
- **Email Verification**: Optional email verification for new users

### 👨‍💼 Powerful Admin Panel

- **Product Management**: Complete CRUD operations with image upload
- **Order Management**: View, update, and track all orders with status updates
- **User Management**: Manage user roles and permissions
- **Role Assignment**: Promote users to admin/moderator with custom permissions
- **Settings Management**: Configure site-wide settings (shipping, contact info, payment methods)
- **Dashboard Analytics**: Overview of orders, products, and users

### 💳 Shopping Experience

- **Smart Cart System**: Persistent cart with localStorage and database sync
- **Dynamic Checkout**: Multi-step checkout with shipping and payment options
- **Order History**: Users can view and track their past orders
- **Profile Management**: Update personal information and preferences
- **Shipping Calculator**: Dynamic shipping cost based on order value

### 🎨 UI/UX Excellence

- **Modern Black & White Design**: Minimalist, professional aesthetic
- **Smooth Animations**: Framer Motion for fluid page transitions
- **Lottie Animations**: Engaging animations on auth pages
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **DaisyUI Components**: Beautiful, accessible UI components
- **Toast Notifications**: Real-time feedback for user actions

---

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion + Lottie React
- **State Management**: Context API (Auth, Cart, Admin)
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Icons**: React Icons

### Backend

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **File Storage**: Cloudinary (images and media)
- **External Integration**: Google Sheets API
- **Security**: CORS, Helmet, Express Validator

### Deployment

- **Frontend**: Vercel (Serverless)
- **Backend**: Vercel (Serverless Functions)
- **Database**: MongoDB Atlas (Cloud)
- **CDN**: Cloudinary for images

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Firebase account
- Cloudinary account

### Frontend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TorunHut-Demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` file in the root directory:

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Backend API URL
   VITE_API_URL=http://localhost:5001/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` file in the backend directory:

   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Server
   PORT=5001
   FRONTEND_URL=http://localhost:5173

   # Firebase Service Account (JSON string)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

4. **Run the backend server**
   ```bash
   npm start
   ```

---

## 🎯 Key Functionalities

### For Customers

- Browse products by category (T-Shirts, Hoodies, Jerseys)
- View detailed product information with multiple images
- Add items to cart with tiered pricing benefits
- Secure checkout with shipping options
- Track order status in real-time
- Manage profile and view order history

### For Admins

- **Dashboard**: Overview of business metrics
- **Product Management**:
  - Add/Edit/Delete products
  - Upload multiple images via Cloudinary
  - Set tiered pricing rules
  - Configure pre-order settings
  - Manage stock levels
- **Order Management**:
  - View all orders with filters
  - Update order status
  - Export to Google Sheets
  - Track shipping information
- **User Management**:
  - View all registered users
  - Assign roles (Admin/Moderator)
  - Manage user permissions
- **Settings**:
  - Configure shipping rates
  - Update contact information
  - Manage payment methods

---

## 📱 Features Breakdown

### Product Catalog

- **Categories**: T-Shirts, Hoodies, Jerseys
- **Filtering**: By category, price, availability
- **Search**: Find products quickly
- **Sorting**: By price, date, popularity
- **Tiered Pricing**: Automatic discounts for bulk orders
- **Pre-orders**: Support for upcoming products

### Shopping Cart

- **Persistent Cart**: Saved across sessions
- **Quantity Management**: Adjust item quantities
- **Price Calculation**: Dynamic pricing with discounts
- **Stock Validation**: Real-time inventory checks
- **Guest Cart**: Cart without login (syncs on login)

### Checkout Process

1. **Cart Review**: Verify items and quantities
2. **Shipping Information**: Enter delivery details
3. **Payment Method**: Select payment option
4. **Order Confirmation**: Review and place order
5. **Email Notification**: Order confirmation sent

### User Dashboard

- **Order History**: Track all past orders
- **Order Details**: View itemized order information
- **Order Status**: Real-time status updates
- **Profile Management**: Update personal information
- **Password Change**: Secure password updates

---

## � Project Structure

```
TorunHut-Demo/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── AdminContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Category.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── Products.jsx
│   │       ├── Orders.jsx
│   │       ├── Users.jsx
│   │       ├── ManageRoles.jsx
│   │       └── Settings.jsx
│   ├── firebase/
│   │   └── config.js
│   ├── utils/
│   │   └── pricing.js
│   └── App.jsx
├── backend/
│   ├── server.js (Main server file)
│   ├── api/
│   │   └── index.js (Vercel serverless entry)
│   └── package.json
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

### Backend (Vercel)

```bash
cd backend
vercel --prod
```

**Note**: Make sure to configure environment variables in Vercel dashboard for production deployment.

---

## 🎨 Design Philosophy

- **Minimalism**: Clean, distraction-free shopping experience
- **Performance**: Optimized images and lazy loading
- **Accessibility**: WCAG compliant, keyboard navigation
- **Responsive**: Mobile-first design approach
- **Brand Consistency**: Black & white theme matching TorunHut identity

---

## � Security Features

- Firebase Authentication with email verification
- Role-based access control (RBAC)
- Protected API routes with JWT verification
- Input validation and sanitization
- CORS configuration
- Secure payment handling (ready for integration)
- Environment variable protection

---

## 📊 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders

- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/user/:userId` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin)

### Users

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/role` - Update user role (Admin)

### Settings

- `GET /api/settings` - Get site settings
- `PUT /api/settings` - Update settings (Admin)

---

## 🔜 Future Enhancements

- [ ] Payment gateway integration (Stripe/SSLCommerz)
- [ ] Email marketing integration
- [ ] Product review system
- [ ] Wishlist functionality
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Push notifications
- [ ] Social media integration
- [ ] Coupon/Discount system

---

## 📝 License

This project is created for portfolio and demonstration purposes.

---

## 👨‍💻 Developer

**Created by**: Asif Hasan  
**Startup**: [TorunHut](https://www.torunhut.com/)  
**Demo**: [https://torunhub-demo.vercel.app/](https://torunhub-demo.vercel.app/)

---

## 🙏 Acknowledgments

- Firebase for authentication services
- MongoDB for database solutions
- Cloudinary for image hosting
- Vercel for deployment platform
- Tailwind CSS & DaisyUI for styling framework

---

**⚠️ Note**: This is a demo version with sample data. For the full production experience, visit [TorunHut.com](https://www.torunhut.com/)
