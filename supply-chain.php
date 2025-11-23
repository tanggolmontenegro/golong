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
    <title>Supply Chain - Add Stock - Indang Tire Supply</title>
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
            <a href="transactions.php">Transaction Log</a>
            <a href="#" class="active">Supply Chain</a>
        </div>
    </div>

    <div class="container">
        <!-- Admin Header -->
        <div class="admin-header">
            <h1>Supply Chain Management</h1>
            <p>Add new stock to inventory system</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-suppliers">3</div>
                <div class="stat-label">Active Suppliers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="pending-orders">0</div>
                <div class="stat-label">Pending Orders</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="total-warehouses">3</div>
                <div class="stat-label">Warehouses</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="items-added-today">0</div>
                <div class="stat-label">Items Added Today</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="management-section">
            <div class="section-header">
                <h2>Add Stock to Inventory</h2>
                <div>
                    <button class="btn btn-success btn-sm" onclick="refreshData()">Refresh</button>
                    <button class="btn btn-info btn-sm" onclick="viewRecentAdditions()">View Recent</button>
                </div>
            </div>

            <!-- Add Stock Form -->
            <div class="form-container">
                <form id="add-stock-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="supplier-select">Supplier *</label>
                            <select id="supplier-select" name="supplier" required>
                                <option value="">Select Supplier</option>
                                <option value="Bridgestone Philippines">Bridgestone Philippines</option>
                                <option value="Michelin Philippines">Michelin Philippines</option>
                                <option value="Goodyear Philippines">Goodyear Philippines</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="warehouse-select">Warehouse *</label>
                            <select id="warehouse-select" name="warehouse" required>
                                <option value="">Select Warehouse</option>
                                <option value="main">Main Warehouse</option>
                                <option value="branch1">Branch 1</option>
                                <option value="branch2">Branch 2</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="delivery-date">Delivery Date *</label>
                            <input type="date" id="delivery-date" name="deliveryDate" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="tire-model">Tire Model *</label>
                            <input type="text" id="tire-model" name="model" placeholder="e.g., GErami, Potenza, Pilot Sport" required>
                        </div>
                        <div class="form-group">
                            <label for="tire-size">Tire Size *</label>
                            <input type="text" id="tire-size" name="size" placeholder="e.g., 185/65R15, 205/55R16" required>
                        </div>
                        <div class="form-group">
                            <label for="tire-brand">Brand *</label>
                            <select id="tire-brand" name="brand" required>
                                <option value="">Select Brand</option>
                                <option value="Bridgestone">Bridgestone</option>
                                <option value="Michelin">Michelin</option>
                                <option value="Goodyear">Goodyear</option>
                                <option value="Continental">Continental</option>
                                <option value="Pirelli">Pirelli</option>
                                <option value="Yokohama">Yokohama</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="quantity">Quantity *</label>
                            <input type="number" id="quantity" name="quantity" min="1" max="1000" required>
                        </div>
                        <div class="form-group">
                            <label for="unit-price">Unit Price (₱) *</label>
                            <input type="number" id="unit-price" name="price" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="min-stock">Minimum Stock Level *</label>
                            <input type="number" id="min-stock" name="minStock" min="1" value="5" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="notes">Notes</label>
                            <textarea id="notes" name="notes" rows="3" placeholder="Additional notes about this stock addition..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Add Stock to Inventory</button>
                        <button type="reset" class="btn btn-secondary">Clear Form</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Recent Additions Section -->
        <div class="management-section" id="recent-additions" style="display: none;">
            <div class="section-header">
                <h2>Recent Stock Additions</h2>
                <button class="btn btn-secondary btn-sm" onclick="hideRecentAdditions()">Hide</button>
            </div>
            
            <div class="table-container">
                <table id="recent-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Value</th>
                            <th>Warehouse</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="supply-chain.js"></script>
</body>
</html>

