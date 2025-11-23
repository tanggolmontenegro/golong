# Running with npm

Yes! You can now run this application using npm. Here's how:

## Quick Start with npm

### 1. Install Node.js (if needed)
Download from https://nodejs.org/ or use:
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

That's it! The server will start on `http://localhost:8000`

## Available npm Scripts

- `npm start` - Start the PHP server via Node.js wrapper
- `npm run dev` - Same as `npm start` (alias)
- `npm run php` - Start PHP server directly (bypasses Node.js)

## How It Works

The `server-node.js` file:
1. Checks if PHP is installed
2. Creates the `data/` directory if needed
3. Spawns the PHP built-in server
4. Provides a clean interface with npm

## Requirements

- **Node.js** 14.0.0 or higher
- **PHP** 7.4 or higher (still required - Node.js just wraps it)

## Benefits of Using npm

✅ Consistent interface across platforms  
✅ Easy to add to CI/CD pipelines  
✅ Can add more npm scripts for automation  
✅ Familiar workflow for Node.js developers  
✅ Easy to extend with additional tooling  

## Troubleshooting

### "PHP is not installed"
The Node.js wrapper still requires PHP. Install it:
```bash
# macOS
brew install php

# Ubuntu/Debian
sudo apt-get install php

# Windows
Download from php.net or use XAMPP
```

### "npm: command not found"
Install Node.js from https://nodejs.org/

### Port already in use
Change the port in `server-node.js` or kill the process using port 8000:
```bash
# Find process
lsof -i :8000

# Kill process (replace PID)
kill -9 <PID>
```

## Alternative: Direct PHP

If you prefer not to use npm, you can still run directly:
```bash
php -S localhost:8000
```

Or use the provided scripts:
- `./start.sh` (Mac/Linux)
- `start.bat` (Windows)

