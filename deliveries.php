<?php
// Deliveries API and Frontend
// Load database configuration
require_once __DIR__ . '/config/database.php';

// Check if this is an API request
$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : '';

// If action is provided, handle as API request
if (!empty($action)) {
    header('Content-Type: application/json');
    
    // Get data directory and file paths
    $dataDir = getDataDir();
    $transactionsFile = $dataDir . DIRECTORY_SEPARATOR . 'transactions.json';
    $deliveriesFile = $dataDir . DIRECTORY_SEPARATOR . 'deliveries.json';
    $suppliersFile = $dataDir . DIRECTORY_SEPARATOR . 'suppliers.json';
    $inventoryFile = $dataDir . DIRECTORY_SEPARATOR . 'inventory.json';
    
    try {
        // Parse JSON body
        $rawInput = file_get_contents('php://input');
        $body = json_decode($rawInput, true);
        if ($body === null) {
            $body = $_POST;
        }
        
        if ($action === 'transactions') {
            // Return transactions for transaction log
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            $transactions = read_json($transactionsFile);
            echo json_encode(['success' => true, 'data' => $transactions]);
            exit;
        }
        
        if ($action === 'list') {
            // Return pending deliveries list
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            $deliveries = read_json($deliveriesFile);
            // Filter to show only pending deliveries
            $pendingDeliveries = array_filter($deliveries, function($d) {
                return isset($d['status']) && $d['status'] === 'pending';
            });
            
            echo json_encode(['success' => true, 'data' => array_values($pendingDeliveries)]);
            exit;
        }
        
        if ($action === 'suppliers') {
            // Return suppliers list
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            $suppliers = read_json($suppliersFile);
            echo json_encode(['success' => true, 'data' => $suppliers]);
            exit;
        }
        
        if ($action === 'update_status') {
            // Update delivery status
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            // This is a placeholder - you can implement actual status update logic
            echo json_encode(['success' => true, 'data' => ['message' => 'Status updated']]);
            exit;
        }
        
        if ($action === 'add_pending') {
            // Add new pending delivery from supply chain
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            $required = ['model', 'size', 'brand', 'warehouse', 'quantity', 'price', 'minStock', 'supplier', 'deliveryDate'];
            foreach ($required as $key) {
                if (!isset($body[$key]) || $body[$key] === '') {
                    http_response_code(422);
                    echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                    exit;
                }
            }
            
            $deliveries = read_json($deliveriesFile);
            
            $newDelivery = [
                'id' => uniqid('del_', true),
                'model' => (string)$body['model'],
                'size' => (string)$body['size'],
                'brand' => (string)$body['brand'],
                'warehouse' => (string)$body['warehouse'],
                'quantity' => (int)$body['quantity'],
                'price' => (float)$body['price'],
                'minStock' => (int)$body['minStock'],
                'supplier' => (string)$body['supplier'],
                'deliveryDate' => (string)$body['deliveryDate'],
                'notes' => isset($body['notes']) ? (string)$body['notes'] : '',
                'status' => 'pending',
                'createdAt' => date('c')
            ];
            
            if ($newDelivery['quantity'] <= 0 || $newDelivery['price'] < 0 || $newDelivery['minStock'] < 0) {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => 'Invalid numeric values']);
                exit;
            }
            
            $deliveries[] = $newDelivery;
            write_json($deliveriesFile, $deliveries);
            
            echo json_encode(['success' => true, 'data' => $newDelivery]);
            exit;
        }
        
        if ($action === 'confirm') {
            // Confirm delivery and add to inventory
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            if (!isset($body['id']) || empty($body['id'])) {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => 'Delivery ID required']);
                exit;
            }
            
            $deliveries = read_json($deliveriesFile);
            $deliveryIndex = -1;
            $delivery = null;
            
            foreach ($deliveries as $index => $d) {
                if ($d['id'] === $body['id']) {
                    $deliveryIndex = $index;
                    $delivery = $d;
                    break;
                }
            }
            
            if ($deliveryIndex === -1 || !$delivery) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Delivery not found']);
                exit;
            }
            
            if ($delivery['status'] !== 'pending') {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Delivery is not pending']);
                exit;
            }
            
            // Add to inventory
            $inventory = read_json($inventoryFile);
            $inventoryItem = [
                'id' => uniqid('inv_', true),
                'model' => $delivery['model'],
                'size' => $delivery['size'],
                'brand' => $delivery['brand'],
                'warehouse' => $delivery['warehouse'],
                'quantity' => $delivery['quantity'],
                'price' => $delivery['price'],
                'minStock' => $delivery['minStock'],
                'createdAt' => date('c')
            ];
            
            $inventory[] = $inventoryItem;
            write_json($inventoryFile, $inventory);
            
            // Update delivery status to confirmed
            $deliveries[$deliveryIndex]['status'] = 'confirmed';
            $deliveries[$deliveryIndex]['confirmedAt'] = date('c');
            write_json($deliveriesFile, $deliveries);
            
            // Log transaction
            $transactions = read_json($transactionsFile);
            $transaction = [
                'id' => uniqid('txn_', true),
                'type' => 'inventory_added',
                'description' => "Inventory added: {$inventoryItem['model']} {$inventoryItem['size']} ({$inventoryItem['brand']})",
                'data' => $inventoryItem,
                'timestamp' => date('c'),
                'user' => 'system'
            ];
            $transactions[] = $transaction;
            write_json($transactionsFile, $transactions);
            
            echo json_encode(['success' => true, 'data' => $inventoryItem]);
            exit;
        }
        
        if ($action === 'reject') {
            // Reject delivery
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'error' => 'Method not allowed']);
                exit;
            }
            
            if (!isset($body['id']) || empty($body['id'])) {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => 'Delivery ID required']);
                exit;
            }
            
            $deliveries = read_json($deliveriesFile);
            $deliveryIndex = -1;
            
            foreach ($deliveries as $index => $d) {
                if ($d['id'] === $body['id']) {
                    $deliveryIndex = $index;
                    break;
                }
            }
            
            if ($deliveryIndex === -1) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Delivery not found']);
                exit;
            }
            
            // Update delivery status to rejected
            $deliveries[$deliveryIndex]['status'] = 'rejected';
            $deliveries[$deliveryIndex]['rejectedAt'] = date('c');
            $deliveries[$deliveryIndex]['rejectionReason'] = isset($body['reason']) ? (string)$body['reason'] : '';
            write_json($deliveriesFile, $deliveries);
            
            echo json_encode(['success' => true, 'data' => ['message' => 'Delivery rejected']]);
            exit;
        }
        
        // Invalid action
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit;
        
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
        exit;
    }
}

// If no action, serve the HTML page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Product Deliveries - Indang Tire Supply</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">
            <div class="logo-circle"></div>
            <div class="logo-text">
                <h1>INDANG TIRE<br>SUPPLY &<br>RECAPPING CENTER</h1>
            </div>
        </div>
        <div class="nav-links">
            <a href="index.php">Inventory</a>
            <a href="deliveries.php" class="active">Deliveries</a>
            <a href="transactions.php">Transaction Log</a>
            <a href="supply-chain.php">Supply Chain</a>
        </div>
    </div>

    <div class="container">
        <!-- Admin Header -->
        <div class="admin-header">
            <h1>Product Delivery Management</h1>
            <p>Track incoming deliveries from suppliers and manage stock movements</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-deliveries">0</div>
                <div class="stat-label">Total Deliveries</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-value">₱0</div>
                <div class="stat-label">Total Delivery Value</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="delivered-today">0</div>
                <div class="stat-label">Delivered Today</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-items">0</div>
                <div class="stat-label">Total Items Delivered</div>
            </div>
        </div>

        <!-- Main Content Sections -->
        <div class="management-section">
            <div class="tabs">
                <div class="tab active" onclick="showTab('delivery-history')">Delivery History</div>
                <div class="tab" onclick="showTab('stock-movements')">Stock Movements</div>
            </div>

            <!-- Delivery History Tab -->
            <div id="delivery-history" class="tab-content active">
                <div class="section-header">
                    <h2>Delivery History</h2>
                    <div>
                        <button class="btn btn-success btn-sm" onclick="refreshDeliveries()">Refresh</button>
                        <button class="btn btn-primary btn-sm" onclick="exportDeliveries()">Export</button>
                    </div>
                </div>
                
                <div class="search-filters">
                    <input type="text" placeholder="Search by product, brand, or supplier..." id="search-input">
                    <select id="supplier-filter">
                        <option value="">All Suppliers</option>
                    </select>
                    <select id="warehouse-filter">
                        <option value="">All Warehouses</option>
                        <option value="main">Main Warehouse</option>
                        <option value="branch1">Branch 1</option>
                        <option value="branch2">Branch 2</option>
                    </select>
                    <button class="btn btn-primary" onclick="applyFilters()">Filter</button>
                </div>

                <div class="table-container">
                    <table id="deliveries-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Brand</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Value</th>
                                <th>Warehouse</th>
                                <th>Supplier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Stock Movements Tab -->
            <div id="stock-movements" class="tab-content">
                <div class="section-header">
                    <h2>Stock Movements</h2>
                    <div>
                        <button class="btn btn-success btn-sm" onclick="refreshStockMovements()">Refresh</button>
                        <button class="btn btn-primary btn-sm" onclick="exportStockMovements()">Export</button>
                    </div>
                </div>

                <div class="alert alert-info">
                    <strong>Info:</strong> This shows all stock movements - items added to inventory and any deductions.
                </div>
                
                <div class="search-filters">
                    <input type="text" placeholder="Search by product, brand, or movement type..." id="movement-search">
                    <select id="movement-type-filter">
                        <option value="">All Movements</option>
                        <option value="added">Stock Added</option>
                        <option value="deducted">Stock Deducted</option>
                    </select>
                    <select id="movement-warehouse-filter">
                        <option value="">All Warehouses</option>
                        <option value="main">Main Warehouse</option>
                        <option value="branch1">Branch 1</option>
                        <option value="branch2">Branch 2</option>
                    </select>
                    <button class="btn btn-primary" onclick="applyMovementFilters()">Filter</button>
                </div>

                <div class="table-container">
                    <table id="stock-movements-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Movement Type</th>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Brand</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total Value</th>
                                <th>Warehouse</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>


    <script src="deliveries.js"></script>
</body>
</html>
