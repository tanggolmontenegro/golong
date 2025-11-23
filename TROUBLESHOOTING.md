# Troubleshooting Guide

## "This site cannot be reached" Error

If you're seeing "This site cannot be reached" or "ERR_CONNECTION_REFUSED", follow these steps:

### Step 1: Check if Server is Running

**Using npm:**
```bash
# Check if process is running
ps aux | grep "node.*server-node" | grep -v grep
# or
lsof -i :8000
```

**Using PHP directly:**
```bash
ps aux | grep "php.*-S" | grep -v grep
```

If nothing shows up, the server is NOT running. Start it:
```bash
npm start
# or
php -S localhost:8000
```

### Step 2: Verify PHP Installation

```bash
php -v
```

**If PHP is not installed:**

**macOS:**
```bash
brew install php
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install php
```

**Windows:**
- Download from https://www.php.net/downloads.php
- Or install XAMPP from https://www.apachefriends.org/

### Step 3: Check Port Availability

Port 8000 might be in use by another application:

```bash
# Check what's using port 8000
lsof -i :8000
# or on Windows: netstat -ano | findstr :8000
```

**If port is in use, either:**
1. Kill the process using it
2. Use a different port (change in server-node.js or use: `php -S localhost:8080`)

### Step 4: Try Different URLs

Make sure you're using the correct URL:

✅ **Correct:**
- `http://localhost:8000/index.php`
- `http://127.0.0.1:8000/index.php`

❌ **Wrong:**
- `https://localhost:8000` (no https)
- `http://localhost:8000/` (might work, but try with index.php)
- `localhost:8000` (missing http://)

### Step 5: Check Firewall

Your firewall might be blocking the connection:

**macOS:**
- System Preferences → Security & Privacy → Firewall
- Make sure it's not blocking PHP or Node.js

**Windows:**
- Windows Defender Firewall might be blocking
- Add exception for PHP or Node.js

### Step 6: Verify Server Started Successfully

When you run `npm start` or `php -S localhost:8000`, you should see:

```
✅ PHP is available
✅ Data directory ready
🚀 Starting PHP server...
=========================================
Server running on: http://localhost:8000
=========================================
```

If you see errors, note them down.

### Step 7: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Go to Network tab
5. Try accessing the page again
6. Check if requests are being made

### Step 8: Test with curl (Command Line)

```bash
curl http://localhost:8000/index.php
```

If this works, the server is running but there might be a browser issue.

### Common Issues and Solutions

#### Issue: "PHP not found"
**Solution:**
```bash
# Add PHP to PATH or install it
# macOS
brew install php
export PATH="/opt/homebrew/bin:$PATH"

# Verify
php -v
```

#### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Find and kill process
lsof -i :8000
kill -9 <PID>

# Or use different port
php -S localhost:8080
```

#### Issue: "Permission denied" on data directory
**Solution:**
```bash
chmod -R 777 data/
# or
sudo chmod -R 777 data/
```

#### Issue: Server starts but immediately stops
**Solution:**
- Check PHP error logs
- Verify all PHP files are in the same directory
- Check for syntax errors in PHP files

#### Issue: Works with curl but not browser
**Solution:**
- Clear browser cache
- Try incognito/private mode
- Try different browser
- Check browser extensions (ad blockers, etc.)

### Quick Diagnostic Commands

Run these to diagnose:

```bash
# 1. Check PHP
php -v

# 2. Check Node.js
node -v
npm -v

# 3. Check if port is free
lsof -i :8000

# 4. Test server manually
cd /Users/admin/Downloads/TIRE-main
php -S localhost:8000

# 5. In another terminal, test connection
curl http://localhost:8000/index.php
```

### Still Not Working?

1. **Check the terminal output** - Look for error messages
2. **Try a different port** - Use 8080 or 3000
3. **Check file permissions** - Make sure PHP can read files
4. **Verify file paths** - All files should be in the same directory
5. **Check PHP errors** - Enable error display:
   ```bash
   php -S localhost:8000 -d display_errors=1
   ```

### Alternative: Use XAMPP/MAMP

If PHP command line isn't working, use a full web server:

1. **XAMPP** (Windows/Mac/Linux):
   - Download from https://www.apachefriends.org/
   - Copy project to `htdocs/TIRE-main/`
   - Start Apache
   - Access at `http://localhost/TIRE-main/`

2. **MAMP** (Mac):
   - Download from https://www.mamp.info/
   - Copy project to `htdocs/TIRE-main/`
   - Start servers
   - Access at `http://localhost:8888/TIRE-main/`

