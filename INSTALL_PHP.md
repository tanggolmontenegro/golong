# Installing PHP - Quick Guide

## The Problem
Your system doesn't have PHP installed, which is why the server cannot start.

## Solution: Install PHP

### For macOS (Your System)

#### Option 1: Using Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install PHP**:
   ```bash
   brew install php
   ```

3. **Verify installation**:
   ```bash
   php -v
   ```

4. **Add to PATH** (if needed):
   ```bash
   echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

#### Option 2: Using MacPorts

```bash
sudo port install php82
```

#### Option 3: Download PHP Binary

1. Visit https://www.php.net/downloads.php
2. Download macOS version
3. Extract and add to PATH

### After Installing PHP

1. **Verify it works**:
   ```bash
   php -v
   ```

2. **Start the server**:
   ```bash
   npm start
   # or
   php -S localhost:8000
   ```

3. **Open browser**:
   ```
   http://localhost:8000/index.php
   ```

## Alternative: Use XAMPP (Easier for Beginners)

If installing PHP via command line is difficult:

1. **Download XAMPP** from https://www.apachefriends.org/
2. **Install XAMPP**
3. **Copy your project** to:
   ```
   /Applications/XAMPP/htdocs/TIRE-main/
   ```
4. **Start Apache** from XAMPP Control Panel
5. **Access at**: `http://localhost/TIRE-main/`

## Quick Install Script

Run this to install PHP via Homebrew:

```bash
# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install PHP
echo "Installing PHP..."
brew install php

# Verify
php -v
```

## Still Having Issues?

1. Make sure you restart your terminal after installing PHP
2. Check if PHP is in your PATH: `which php`
3. Try using full path: `/opt/homebrew/bin/php -v`
4. Use XAMPP as an alternative

