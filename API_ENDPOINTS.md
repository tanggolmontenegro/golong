# API Endpoints Documentation

## Complete List of All API Endpoints

### Inventory API (`inventory.php`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `?action=list` | List all inventory items | None |
| POST | `?action=add` | Add new inventory item | `model`, `size`, `brand`, `warehouse`, `quantity`, `price`, `minStock` |
| POST | `?action=update` | Update inventory item | `id`, (optional: `model`, `size`, `brand`, `warehouse`, `quantity`, `price`, `minStock`) |
| POST | `?action=delete` | Delete inventory item | `id` |
| POST | `?action=confirm` | Confirm stock order | `orderId`, `model`, `size`, `brand`, `warehouse`, `quantity`, `price` |

### Deliveries API (`deliveries.php`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `?action=list` | List pending deliveries | None |
| GET | `?action=suppliers` | List all suppliers | None |
| GET | `?action=transactions` | Get transaction history | None |
| POST | `?action=add_pending` | Add pending delivery | `model`, `size`, `brand`, `warehouse`, `quantity`, `price`, `minStock`, `supplier`, `deliveryDate` |
| POST | `?action=confirm` | Confirm delivery | `id` |
| POST | `?action=reject` | Reject delivery | `id`, `reason` (optional) |
| POST | `?action=update_status` | Update delivery status | `deliveryId`, `status`, `receivedBy` |

### Warehouses API (`warehouses.php`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `?action=list` | List all warehouses with stats | None |
| GET | `?action=inventory&warehouse={id}` | Get inventory for warehouse | `warehouse` (required) |

### Transactions API (`transactions.php`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `?action=list` | List all transactions | None |
| POST | `?action=clear_old` | Clear old transactions | `days` (required) |

### Reorders API (`reorders.php`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `?action=list` | List all reorders | `status` (optional filter) |
| POST | `?action=create` | Create reorder request | `itemId`, `model`, `size`, `brand`, `quantity`, `warehouse` |
| POST | `?action=update_status` | Update reorder status | `id`, `status` |

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Detailed error (optional)"
}
```

## HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid action or parameters)
- `404` - Not Found (resource doesn't exist)
- `405` - Method Not Allowed (wrong HTTP method)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

## Data Storage

Currently using JSON file storage in `data/` directory:
- `inventory.json` - Confirmed inventory items
- `deliveries.json` - Pending and processed deliveries
- `transactions.json` - Transaction audit log
- `suppliers.json` - Supplier information
- `warehouses.json` - Warehouse information
- `reorders.json` - Reorder requests

All files are automatically initialized with default data if they don't exist.

