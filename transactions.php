<?php
// Transactions API and Frontend
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

    try {
        // Parse JSON body
        $rawInput = file_get_contents('php://input');
        $body = json_decode($rawInput, true);
        if ($body === null) {
            $body = $_POST;
        }

    if ($action === 'list') {
            // Return all transactions
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }

            $transactions = read_json($transactionsFile);
        echo json_encode(['success' => true, 'data' => $transactions]);
        exit;
    }

        if ($action === 'clear_old') {
            // Clear old transactions
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

            if (!isset($body['days']) || !is_numeric($body['days'])) {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => 'Days parameter required']);
                exit;
            }
            
            $days = (int)$body['days'];
            $cutoffDate = date('c', strtotime("-{$days} days"));
            
            $transactions = read_json($transactionsFile);
            $originalCount = count($transactions);
            
            $transactions = array_filter($transactions, function($t) use ($cutoffDate) {
                return $t['timestamp'] >= $cutoffDate;
            });
            
            $transactions = array_values($transactions);
            write_json($transactionsFile, $transactions);
            
            $deleted = $originalCount - count($transactions);

        echo json_encode([
            'success' => true,
            'data' => [
                    'deleted' => $deleted,
                    'remaining' => count($transactions)
            ]
        ]);
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
    <title>Transaction Log - Indang Tire Supply</title>
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
            <a href="deliveries.php">Deliveries</a>
            <a href="transactions.php" class="active">Transaction Log</a>
            <a href="supply-chain.php">Supply Chain</a>
        </div>
    </div>

    <div class="container">
        <!-- Admin Header -->
        <div class="admin-header">
            <h1>Transaction Log & History</h1>
            <p>Complete audit trail of all system activities and stock movements</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-transactions">0</div>
                <div class="stat-label">Total Transactions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="today-transactions">0</div>
                <div class="stat-label">Today's Transactions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="delivery-transactions">0</div>
                <div class="stat-label">Delivery Transactions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="inventory-transactions">0</div>
                <div class="stat-label">Inventory Transactions</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="management-section">
            <div class="section-header">
                <h2>Transaction History</h2>
                <div>
                    <button class="btn btn-success btn-sm" onclick="refreshTransactions()">Refresh</button>
                    <button class="btn btn-primary btn-sm" onclick="exportTransactions()">Export</button>
                    <button class="btn btn-warning btn-sm" onclick="clearOldTransactions()">Clear Old</button>
                </div>
            </div>
            
            <!-- Filters -->
            <div class="search-filters">
                <input type="text" placeholder="Search transactions..." id="search-input">
                <select id="type-filter">
                    <option value="">All Types</option>
                    <option value="delivery_created">Delivery Created</option>
                    <option value="delivery_status_updated">Delivery Status Updated</option>
                    <option value="inventory_added">Inventory Added</option>
                    <option value="inventory_updated">Inventory Updated</option>
                    <option value="stock_confirmed">Stock Confirmed</option>
                </select>
                <select id="date-filter">
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
                <input type="date" id="from-date" placeholder="From Date">
                <input type="date" id="to-date" placeholder="To Date">
                <button class="btn btn-primary" onclick="applyFilters()">Filter</button>
                <button class="btn btn-secondary" onclick="clearFilters()">Clear</button>
            </div>

            <!-- Transaction Table -->
            <div class="table-container">
                <table id="transactions-table">
                    <thead>
                        <tr>
                            <th onclick="sortTable(0)">Timestamp</th>
                            <th onclick="sortTable(1)">Type</th>
                            <th onclick="sortTable(2)">Description</th>
                            <th onclick="sortTable(3)">User</th>
                            <th onclick="sortTable(4)">Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination">
                <button class="btn btn-secondary" onclick="previousPage()" id="prev-btn" disabled>Previous</button>
                <span id="page-info">Page 1 of 1</span>
                <button class="btn btn-secondary" onclick="nextPage()" id="next-btn" disabled>Next</button>
            </div>
        </div>

        <!-- Transaction Details Modal -->
        <div id="details-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Transaction Details</h3>
                    <span class="close" onclick="closeModal('details-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="transaction-details">
                        <!-- Details will be populated here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="transactions.js"></script>
</body>
</html>
