#!/bin/bash

echo "========================================="
echo "PHP Installation Helper"
echo "========================================="
echo ""

# Check if PHP is already installed
if command -v php &> /dev/null; then
    echo "✅ PHP is already installed!"
    php -v
    exit 0
fi

# Check for Homebrew
if command -v brew &> /dev/null; then
    echo "✅ Homebrew found"
    echo ""
    echo "Installing PHP via Homebrew..."
    echo "This may take a few minutes..."
    echo ""
    
    brew install php
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ PHP installed successfully!"
        php -v
        echo ""
        echo "You can now run: npm start"
    else
        echo ""
        echo "❌ Installation failed"
        echo "Try manually: brew install php"
    fi
else
    echo "❌ Homebrew not found"
    echo ""
    echo "Please install Homebrew first:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "Or download XAMPP from: https://www.apachefriends.org/"
fi
