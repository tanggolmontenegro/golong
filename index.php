<?php
// Database connection can be added here
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Incoming Stock Confirmation - Indang Tire Supply</title>
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
            <a href="index.php" class="active">Inventory</a>
            <a href="deliveries.php">Deliveries</a>
            <a href="transactions.php">Transaction Log</a>
            <a href="supply-chain.php">Supply Chain</a>
        </div>
    </div>

    <div class="container">
        <!-- Admin Header -->
        <div class="admin-header">
            <h1>Incoming Stock Confirmation System</h1>
            <p>Confirm incoming stocks ordered by sales and assign warehouse locations</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="pending-confirmations">0</div>
                <div class="stat-label">Pending Confirmations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-order-value">₱0</div>
                <div class="stat-label">Total Order Value</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="warehouse-count">0</div>
                <div class="stat-label">Warehouse Locations</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="confirmed-today">0</div>
                <div class="stat-label">Confirmed Today</div>
            </div>
        </div>

        <!-- Warehouse Selection Section -->
        <div class="management-section">
            <div class="section-header">
                <h2>Select Warehouse</h2>
                <div>
                    <button class="btn btn-primary" href="add-stock.php">Add New Stock</button>
                    <button class="btn btn-success btn-sm" onclick="refreshWarehouses()">Refresh</button>
                </div>
            </div>

            <div class="warehouse-grid" id="warehouse-selection">
                <!-- Warehouses will be populated here -->
            </div>
        </div>

        <!-- Inventory Section (Hidden initially) -->
        <div id="inventory-section" class="management-section" style="display: none;">
            <div class="section-header">
                <h2 id="selected-warehouse-title">Inventory</h2>
                <div>
                    <button class="btn btn-secondary" onclick="backToWarehouses()">← Back to Warehouses</button>
                    <button class="btn btn-primary" href="add-stock.php">Add Stock to This Warehouse</button>
                    <button class="btn btn-success btn-sm" onclick="exportInventory()">Export</button>
                </div>
            </div>

            <!-- Warehouse Info Card -->
            <div class="warehouse-info-card" id="warehouse-info">
                <!-- Warehouse details will be populated here -->
            </div>
            
            <!-- Search and Filters -->
            <div class="search-filters">
                <input type="text" placeholder="Search by tire model, size, or brand..." id="search-input">
                <select id="brand-filter">
                    <option value="">All Brands</option>
                </select>
                <select id="size-filter">
                    <option value="">All Sizes</option>
                </select>
                <select id="stock-status-filter">
                    <option value="">All Stock Levels</option>
                    <option value="out">Out of Stock</option>
                    <option value="low">Low Stock (≤5)</option>
                    <option value="medium">Medium Stock</option>
                    <option value="high">High Stock</option>
                </select>
                <button class="btn btn-primary" onclick="applyInventoryFilters()">Filter</button>
                <button class="btn btn-secondary" onclick="clearInventoryFilters()">Clear</button>
                <button class="btn btn-warning" onclick="showLowStockOnly()">Show Low Stock Only</button>
            </div>

            <!-- Inventory Table -->
            <div class="table-container">
                <table id="inventory-table">
                    <thead>
                        <tr>
                            <th>Tire Model</th>
                            <th>Size</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Min Stock</th>
                            <th>Stock Status</th>
                            <th>Unit Price</th>
                            <th>Total Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Edit Stock Modal -->
    <div id="edit-stock-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Inventory Item</h2>
                <span class="close" onclick="closeModal('edit-stock-modal')">&times;</span>
            </div>
            <form id="edit-stock-form">
                <input type="hidden" id="edit-item-id" name="id">
                <div class="form-group">
                    <label for="edit-tire-model">Tire Model *</label>
                    <input type="text" id="edit-tire-model" name="tire-model" required>
                </div>
                <div class="form-group">
                    <label for="edit-tire-size">Tire Size *</label>
                    <input type="text" id="edit-tire-size" name="tire-size" required>
                </div>
                <div class="form-group">
                    <label for="edit-tire-brand">Brand *</label>
                    <input type="text" id="edit-tire-brand" name="tire-brand" required>
                </div>
                <div class="form-group">
                    <label for="edit-warehouse-location">Warehouse Location *</label>
                    <select id="edit-warehouse-location" name="warehouse-location" required>
                        <option value="main">Main Warehouse</option>
                        <option value="branch1">Branch 1</option>
                        <option value="branch2">Branch 2</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-quantity">Quantity *</label>
                    <input type="number" id="edit-quantity" name="quantity" min="0" required>
                </div>
                <div class="form-group">
                    <label for="edit-unit-price">Unit Price (₱) *</label>
                    <input type="number" id="edit-unit-price" name="unit-price" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="edit-min-stock">Minimum Stock *</label>
                    <input type="number" id="edit-min-stock" name="min-stock" min="0" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('edit-stock-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Stock</button>
                </div>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>

