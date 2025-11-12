#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Restarting Backend Server...${NC}"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")" || exit

# Find and kill existing server processes
echo -e "${YELLOW}Stopping existing server...${NC}"
pkill -f "node.*server.js" 2>/dev/null
sleep 2

# Check if port is still in use
if lsof -ti:5001 > /dev/null 2>&1; then
  echo -e "${YELLOW}Port 5001 still in use, force killing...${NC}"
  lsof -ti:5001 | xargs kill -9 2>/dev/null
  sleep 1
fi

echo -e "${GREEN}✅ Server stopped${NC}"
echo ""

# Start the server
echo -e "${BLUE}Starting server...${NC}"
npm start

