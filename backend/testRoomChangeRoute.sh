#!/bin/bash

echo "🧪 Testing Room Change Request Route Registration..."

cd /home/nadeem/SHMS/backend

echo "1. Checking if files exist..."
if [ -f "models/RoomChangeRequest.js" ]; then
    echo "✅ RoomChangeRequest.js model exists"
else
    echo "❌ RoomChangeRequest.js model missing"
fi

if [ -f "routes/roomChangeRequestRoutes.js" ]; then
    echo "✅ roomChangeRequestRoutes.js exists"
else
    echo "❌ roomChangeRequestRoutes.js missing"
fi

if [ -f "controllers/roomChangeRequestController.js" ]; then
    echo "✅ roomChangeRequestController.js exists"
else
    echo "❌ roomChangeRequestController.js missing"
fi

echo ""
echo "2. Checking server.js route registration..."
if grep -q "room-change-requests" server.js; then
    echo "✅ Route registered in server.js"
    grep -n "room-change-requests" server.js
else
    echo "❌ Route NOT registered in server.js"
fi

echo ""
echo "3. Testing server startup..."
timeout 10s node server.js > server_test.log 2>&1 &
SERVER_PID=$!
sleep 3

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server started successfully"
    kill $SERVER_PID 2>/dev/null
    
    echo ""
    echo "4. Testing route with curl..."
    timeout 5s curl -s -X POST http://localhost:5000/api/room-change-requests \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer test-token" \
      -d '{"currentRoom":"test","requestedRoom":"test","reason":"test"}' \
      -w "HTTPSTATUS:%{http_code}" 2>/dev/null || echo "Route test failed"
else
    echo "❌ Server failed to start"
    echo "Error log:"
    cat server_test.log
fi

rm -f server_test.log
