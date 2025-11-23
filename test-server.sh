#!/bin/bash
echo "Testing server startup..."
echo ""

# Check PHP
if command -v php &> /dev/null; then
    echo "✅ PHP found: $(php -v | head -n 1)"
else
    echo "❌ PHP not found"
    exit 1
fi

# Check port
if lsof -i :8000 &> /dev/null; then
    echo "⚠️  Port 8000 is in use"
    lsof -i :8000
else
    echo "✅ Port 8000 is available"
fi

# Check data directory
if [ -d "data" ]; then
    echo "✅ Data directory exists"
    if [ -w "data" ]; then
        echo "✅ Data directory is writable"
    else
        echo "⚠️  Data directory is not writable"
    fi
else
    echo "⚠️  Data directory does not exist"
fi

echo ""
echo "Starting test server for 5 seconds..."
timeout 5 php -S localhost:8000 2>&1 &
SERVER_PID=$!
sleep 2

# Test connection
if curl -s http://localhost:8000/index.php > /dev/null 2>&1; then
    echo "✅ Server is responding!"
else
    echo "❌ Server is not responding"
fi

# Kill test server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "Test complete"
