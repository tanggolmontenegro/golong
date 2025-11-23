# Tire Inventory Management System

A comprehensive inventory management system for tire supply and recapping center.

## Features

- **Supply Chain Management**: Add new stock items from suppliers
- **Delivery Management**: Review and confirm/reject pending deliveries
- **Inventory Management**: Track inventory across multiple warehouses
- **Transaction Log**: Complete audit trail of all system activities
- **Warehouse Management**: Manage multiple warehouse locations

## System Architecture

### Storage
Currently uses JSON file-based storage. Can be easily migrated to MySQL/PostgreSQL by:
1. Running `database_schema.sql` to create database tables
2. Updating `config/database.php` to set `STORAGE_MODE` to `'database'`

### API Endpoints

#### Inventory API (`inventory.php`)
- `GET ?action=list` - List all inventory items
- `POST ?action=add` - Add new inventory item
- `POST ?action=update` - Update inventory item
- `POST ?action=delete` - Delete inventory item
- `POST ?action=confirm` - Confirm stock order

#### Deliveries API (`deliveries.php`)
- `GET ?action=list` - List pending deliveries
- `GET ?action=suppliers` - List all suppliers
- `GET ?action=transactions` - Get transaction history
- `POST ?action=add_pending` - Add pending delivery from supply chain
- `POST ?action=confirm` - Confirm delivery and add to inventory
- `POST ?action=reject` - Reject delivery

#### Warehouses API (`warehouses.php`)
- `GET ?action=list` - List all warehouses with statistics
- `GET ?action=inventory&warehouse={id}` - Get inventory for specific warehouse

#### Transactions API (`transactions.php`)
- `GET ?action=list` - List all transactions
- `POST ?action=clear_old` - Clear old transactions (requires `days` parameter)

#### Reorders API (`reorders.php`)
- `GET ?action=list` - List all reorder requests
- `POST ?action=create` - Create new reorder request
- `POST ?action=update_status` - Update reorder status

## Workflow

1. **Supply Chain** → Add items → Creates pending deliveries
2. **Deliveries** → Review pending items → Confirm or Reject
3. **Confirmed Items** → Added to inventory → Visible in warehouse inventory
4. **Rejected Items** → Marked as rejected → Not added to inventory

## Installation

1. Ensure PHP 7.4+ is installed
2. Place files in web server directory (Apache/Nginx)
3. Ensure `data/` directory is writable
4. Access via web browser

## Database Setup (Optional)

To use MySQL/PostgreSQL instead of JSON:

1. Create database:
```sql
CREATE DATABASE tire_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:
```bash
mysql -u root -p tire_inventory < database_schema.sql
```

3. Update `config/database.php`:
```php
define('STORAGE_MODE', 'database');
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'tire_inventory');
```

## File Structure

```
/
├── config/
│   └── database.php          # Database configuration
├── data/                     # JSON data files (auto-created)
│   ├── inventory.json
│   ├── deliveries.json
│   ├── transactions.json
│   ├── suppliers.json
│   └── warehouses.json
├── index.php                 # Inventory management page
├── deliveries.php            # Deliveries management (with API)
├── transactions.php          # Transaction log (with API)
├── supply-chain.php          # Supply chain management
├── inventory.php             # Inventory API
├── warehouses.php            # Warehouses API
├── reorders.php              # Reorders API
├── database_schema.sql       # Database schema
└── [JS/CSS files]
```

## API Response Format

All API endpoints return JSON in the following format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Detailed error information (optional)"
}
```

## Security Notes

- All API endpoints validate input data
- JSON file writes are atomic (using temporary files)
- Error handling prevents data corruption
- Transaction logging provides audit trail

## License

Proprietary - Internal Use Only

