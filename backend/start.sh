#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Chassi Backend Auto-Setup        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╝${NC}"
echo ""

# Navigate to backend directory
cd "/Users/asifhasan/My Computer/Coding/web development/Nobbo Fashion/chassi-ecommerce/backend" || exit

# Check if firebase-service-account.json exists
if [ ! -f "firebase-service-account.json" ]; then
    echo -e "${RED}❌ firebase-service-account.json NOT FOUND!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Please download it from Firebase Console:${NC}"
    echo "   1. Go to: https://console.firebase.google.com/"
    echo "   2. Select 'nobbo-fashion' project"
    echo "   3. Settings ⚙️ → Project settings → Service accounts"
    echo "   4. Click 'Generate new private key'"
    echo "   5. Save it as: firebase-service-account.json"
    echo "   6. Move to: backend/firebase-service-account.json"
    echo ""
    echo -e "${YELLOW}Then run this script again!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ firebase-service-account.json found!${NC}"
echo ""

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating...${NC}"
    
    echo "# MongoDB Connection" > .env
    echo "MONGODB_URI=mongodb://localhost:27017/chassi-ecommerce" >> .env
    echo "" >> .env
    echo "# Server Configuration" >> .env
    echo "PORT=5000" >> .env
    echo "NODE_ENV=development" >> .env
    
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Update MONGODB_URI in .env file!${NC}"
    echo ""
    echo -e "${BLUE}For MongoDB Atlas:${NC}"
    echo "   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chassi-ecommerce"
    echo ""
    echo -e "${BLUE}For Local MongoDB:${NC}"
    echo "   MONGODB_URI=mongodb://localhost:27017/chassi-ecommerce"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    echo ""
fi

# Display MongoDB setup instructions
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📊 MongoDB Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Option 1: MongoDB Atlas (Cloud - Recommended)${NC}"
echo "   1. Sign up: https://www.mongodb.com/cloud/atlas/register"
echo "   2. Create FREE M0 cluster"
echo "   3. Add database user: chassi_admin / Chassi2024!"
echo "   4. Allow network access: 0.0.0.0/0"
echo "   5. Get connection string"
echo "   6. Update backend/.env with connection string"
echo ""
echo -e "${YELLOW}Option 2: Local MongoDB${NC}"
echo "   brew install mongodb-community"
echo "   brew services start mongodb-community"
echo ""

# Ask if MongoDB is ready
echo -e "${YELLOW}Is MongoDB configured and running? (y/n)${NC}"
read -r mongodb_ready

if [ "$mongodb_ready" != "y" ]; then
    echo -e "${RED}⚠️  Please set up MongoDB first, then run this script again.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting backend server...${NC}"
echo ""
echo -e "${BLUE}Server will run on: http://localhost:5000${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps After Server Starts:${NC}"
echo "   1. Create admin account in Firebase Console"
echo "   2. Copy the User UID"
echo "   3. Run: curl -X PUT http://localhost:5000/api/users/YOUR_UID/role \\"
echo "             -H \"Content-Type: application/json\" \\"
echo "             -d '{\"role\": \"admin\"}'"
echo "   4. Login at: http://localhost:5173/admin/login"
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Start the server
npm run dev
