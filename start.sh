#!/bin/bash

# Tire Inventory Management System - Quick Start Script

echo "========================================="
echo "Tire Inventory Management System"
echo "========================================="
echo ""

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed!"
    echo ""
    echo "Please install PHP first:"
    echo "  macOS:   brew install php"
    echo "  Ubuntu:  sudo apt-get install php"
    echo "  Windows: Download from php.net or use XAMPP"
    echo ""
    exit 1
fi

# Display PHP version
PHP_VERSION=$(php -v | head -n 1)
echo "✅ PHP found: $PHP_VERSION"
echo ""

# Check if data directory exists and is writable
if [ ! -d "data" ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
fi

if [ ! -w "data" ]; then
    echo "⚠️  Setting data directory permissions..."
    chmod 777 data
fi

echo "✅ Data directory ready"
echo ""

# Get the current directory
CURRENT_DIR=$(pwd)
echo "📂 Project directory: $CURRENT_DIR"
echo ""

# Start PHP server
echo "🚀 Starting PHP development server..."
echo ""
echo "========================================="
echo "Server starting on: http://localhost:8000"
echo "========================================="
echo ""
echo "Access the application at:"
echo "  • Main Page:      http://localhost:8000/index.php"
echo "  • Deliveries:     http://localhost:8000/deliveries.php"
echo "  • Transactions:   http://localhost:8000/transactions.php"
echo "  • Supply Chain:   http://localhost:8000/supply-chain.php"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
php -S localhost:8000

