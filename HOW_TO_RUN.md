# How to Run the Tire Inventory Management System

## Quick Start Guide

### Option 1: Using npm (Recommended - Easiest)

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Or use: `brew install node` (macOS)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   Or:
   ```bash
   npm run dev
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:8000
   ```

5. **Access the application**:
   - Main page: `http://localhost:8000/index.php`
   - Deliveries: `http://localhost:8000/deliveries.php`
   - Transactions: `http://localhost:8000/transactions.php`
   - Supply Chain: `http://localhost:8000/supply-chain.php`

### Option 2: Using PHP Built-in Server (Direct)

1. **Install PHP** (if not already installed):
   - **macOS**: `brew install php` or download from php.net
   - **Windows**: Download from php.net or use XAMPP
   - **Linux**: `sudo apt-get install php` (Ubuntu/Debian) or `sudo yum install php` (CentOS/RHEL)

2. **Navigate to the project directory**:
   ```bash
   cd /Users/admin/Downloads/TIRE-main
   ```

3. **Start the PHP built-in server**:
   ```bash
   php -S localhost:8000
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:8000
   ```

5. **Access the application**:
   - Main page: `http://localhost:8000/index.php`
   - Deliveries: `http://localhost:8000/deliveries.php`
   - Transactions: `http://localhost:8000/transactions.php`
   - Supply Chain: `http://localhost:8000/supply-chain.php`

### Option 2: Using XAMPP (Windows/Mac/Linux)

1. **Download and install XAMPP** from https://www.apachefriends.org/

2. **Copy project files** to XAMPP's htdocs folder:
   - Windows: `C:\xampp\htdocs\TIRE-main\`
   - Mac: `/Applications/XAMPP/htdocs/TIRE-main/`
   - Linux: `/opt/lampp/htdocs/TIRE-main/`

3. **Start Apache** from XAMPP Control Panel

4. **Open browser** and go to:
   ```
   http://localhost/TIRE-main/
   ```

### Option 3: Using MAMP (Mac)

1. **Download and install MAMP** from https://www.mamp.info/

2. **Copy project files** to:
   ```
   /Applications/MAMP/htdocs/TIRE-main/
   ```

3. **Start MAMP** servers

4. **Open browser** and go to:
   ```
   http://localhost:8888/TIRE-main/
   ```

### Option 4: Using Apache/Nginx (Production)

#### Apache Setup:

1. **Copy project** to web root:
   ```bash
   sudo cp -r /Users/admin/Downloads/TIRE-main /var/www/html/tire
   ```

2. **Set permissions**:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/tire
   sudo chmod -R 755 /var/www/html/tire
   sudo chmod -R 777 /var/www/html/tire/data
   ```

3. **Enable Apache** (if needed):
   ```bash
   sudo systemctl start apache2  # Ubuntu/Debian
   sudo systemctl start httpd    # CentOS/RHEL
   ```

4. **Access** at: `http://localhost/tire/`

#### Nginx Setup:

1. **Copy project** to web root:
   ```bash
   sudo cp -r /Users/admin/Downloads/TIRE-main /var/www/html/tire
   ```

2. **Create Nginx config** (`/etc/nginx/sites-available/tire`):
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /var/www/html/tire;
       index index.php index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       location ~ \.php$ {
           include snippets/fastcgi-php.conf;
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
       }
   }
   ```

3. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tire /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Verify Installation

1. **Check PHP version** (should be 7.4 or higher):
   ```bash
   php -v
   ```

2. **Check if data directory is writable**:
   ```bash
   ls -la data/
   chmod 777 data/  # If needed
   ```

3. **Test the application**:
   - Go to `http://localhost:8000/index.php`
   - You should see the inventory management page
   - Try adding an item from Supply Chain page

## Troubleshooting

### Issue: "PHP not found"
**Solution**: Install PHP or add it to your PATH

### Issue: "Permission denied" on data directory
**Solution**: 
```bash
chmod -R 777 data/
```

### Issue: "404 Not Found" errors
**Solution**: 
- Make sure you're accessing the correct URL
- Check that PHP server is running
- Verify file paths are correct

### Issue: "Failed to fetch" errors in browser console
**Solution**:
- Make sure PHP server is running
- Check browser console for specific error messages
- Verify all PHP files are in the same directory

### Issue: Data files not being created
**Solution**:
- Check `data/` directory permissions: `chmod 777 data/`
- Verify PHP has write permissions
- Check PHP error logs

## Development vs Production

### Development (Current Setup)
- Uses JSON file storage
- No database required
- Easy to set up and test
- Good for development and small deployments

### Production (Optional)
- Can migrate to MySQL/PostgreSQL
- See `database_schema.sql` for schema
- Update `config/database.php` to use database mode
- Requires database server setup

## Quick Test Commands

```bash
# Check PHP is installed
php --version

# Start server (from project directory)
php -S localhost:8000

# Check if data directory exists and is writable
ls -la data/
touch data/test.txt && rm data/test.txt

# View PHP errors (if any)
php -S localhost:8000 -d display_errors=1
```

## Default Access

Once running, access the application at:
- **Main Inventory**: `http://localhost:8000/index.php`
- **Deliveries**: `http://localhost:8000/deliveries.php`
- **Transactions**: `http://localhost:8000/transactions.php`
- **Supply Chain**: `http://localhost:8000/supply-chain.php`

## Next Steps

1. Start the server using one of the methods above
2. Open the application in your browser
3. Try adding an item from Supply Chain
4. Confirm it in Deliveries
5. View it in Inventory

Enjoy using the Tire Inventory Management System! 🚗

