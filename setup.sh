#!/bin/bash

# Chassi eCommerce - Quick Setup Script
# This script helps you get started quickly

echo "🚀 Chassi eCommerce - Quick Setup"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Frontend setup
echo "📦 Step 1: Installing frontend dependencies..."
npm install

# Backend setup
echo ""
echo "📦 Step 2: Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    echo "⚠️  Backend directory not found. Creating..."
    mkdir -p backend
fi

npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Step 3: Creating backend .env file..."
    cp .env.example .env
    echo "✅ .env created! Please edit backend/.env with your MongoDB URI"
else
    echo "✅ backend/.env already exists"
fi

# Check for Firebase service account
if [ ! -f "firebase-service-account.json" ]; then
    echo ""
    echo "⚠️  WARNING: firebase-service-account.json not found in backend/"
    echo "   Please download it from Firebase Console:"
    echo "   1. Go to Project Settings > Service Accounts"
    echo "   2. Click 'Generate New Private Key'"
    echo "   3. Save as backend/firebase-service-account.json"
fi

cd ..

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
# Firebase Configuration
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id

# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Admin Email
VITE_ADMIN_EMAIL=admin@chassi.com
EOF
    echo "✅ .env created! Please edit .env with your Firebase credentials"
else
    echo "✅ .env already exists"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env with your Firebase credentials"
echo "2. Edit backend/.env with your MongoDB URI"
echo "3. Download firebase-service-account.json to backend/"
echo "4. Start MongoDB (if using local):"
echo "   brew services start mongodb-community"
echo ""
echo "5. Start the servers:"
echo "   Terminal 1: npm run dev          # Frontend"
echo "   Terminal 2: cd backend && npm run dev  # Backend"
echo ""
echo "6. Create your first admin (see COMPLETE_SETUP.md)"
echo ""
echo "📚 Documentation:"
echo "   - COMPLETE_SETUP.md - Full setup guide"
echo "   - ROLE_PERMISSIONS.md - Role reference"
echo "   - UPGRADE_SUMMARY.md - What's new"
echo ""
echo "🎉 Happy coding!"
