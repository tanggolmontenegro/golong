<?php
// Database connection can be added here
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Incoming Stock - Indang Tire Supply</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="header">
        <div class="logo">
            <div class="logo-circle"></div>
            <div class="logo-text">
                <h1>INDANG TIRE<br>SUPPLY &<br>RECAPPING CENTER</h1>
            </div>
        </div>
        <div class="nav-links">
            <a href="index.php">Back to Inventory</a>
            <a href="#" class="active">Confirm Stock</a>
        </div>
    </div>

    <div class="container">
        <div class="admin-header">
            <h1>Confirm Incoming Stock</h1>
            <p>Confirm incoming stocks ordered by sales and assign warehouse locations</p>
        </div>

        <div class="management-section">
            <div class="section-header">
                <h2>Stock Confirmation Form</h2>
            </div>

            <form id="add-stock-form" class="form-grid">
                <div class="form-group">
                    <label for="order-id">Sales Order ID</label>
                    <input type="text" id="order-id" name="order-id" required placeholder="e.g., SO-2024-001">
                </div>
                <div class="form-group">
                    <label for="tire-model">Tire Model</label>
                    <input type="text" id="tire-model" name="tire-model" required>
                </div>
                <div class="form-group">
                    <label for="tire-size">Size</label>
                    <input type="text" id="tire-size" name="tire-size" required>
                </div>
                <div class="form-group">
                    <label for="tire-brand">Brand</label>
                    <select id="tire-brand" name="tire-brand" required>
                        <option value="">Select Brand</option>
                        <option value="bridgestone">Bridgestone</option>
                        <option value="michelin">Michelin</option>
                        <option value="continental">Continental</option>
                        <option value="goodyear">Goodyear</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantity">Ordered Quantity</label>
                    <input type="number" id="quantity" name="quantity" required min="1">
                </div>
                <div class="form-group">
                    <label for="unit-price">Unit Price</label>
                    <input type="number" id="unit-price" name="unit-price" required min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="warehouse-location">Assign to Warehouse</label>
                    <select id="warehouse-location" name="warehouse-location" required>
                        <option value="">Select Warehouse</option>
                        <option value="main">Main Warehouse (Indang, Cavite)</option>
                        <option value="branch1">Branch 1 (Tagaytay City)</option>
                        <option value="branch2">Branch 2 (Dasmarinas City)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="confirmation-notes">Confirmation Notes</label>
                    <textarea id="confirmation-notes" name="confirmation-notes" rows="3" placeholder="Any additional notes about this stock confirmation..."></textarea>
                </div>
                <div style="text-align: right; grid-column: 1 / -1;">
                    <button type="reset" class="btn btn-warning">Reset</button>
                    <button type="submit" class="btn btn-primary">Confirm Stock</button>
                </div>
            </form>
        </div>

        <!-- Pending Deliveries Section -->
        <div class="management-section" style="margin-top: 2rem;">
            <div class="section-header">
                <h2>Pending Deliveries to Confirm</h2>
                <div>
                    <button class="btn btn-success btn-sm" onclick="refreshPendingDeliveries()">Refresh</button>
                </div>
            </div>

            <div class="table-container">
                <table id="pending-deliveries-table">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Supplier</th>
                            <th>Tire Model</th>
                            <th>Size</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Value</th>
                            <th>Expected Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="10" style="text-align: center; padding: 2rem;">
                                <p>Loading pending deliveries...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Confirmed Stocks Section -->
        <div class="management-section" style="margin-top: 2rem;">
            <div class="section-header">
                <h2>Confirmed Stocks</h2>
                <div>
                    <button class="btn btn-success btn-sm" onclick="exportConfirmedStocks()">Export</button>
                    <button class="btn btn-primary btn-sm" onclick="refreshConfirmedStocks()">Refresh</button>
                </div>
            </div>

            <div class="table-container">
                <table id="inventory-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Tire Model</th>
                            <th>Size</th>
                            <th>Brand</th>
                            <th>Confirmed Qty</th>
                            <th>Unit Price</th>
                            <th>Total Value</th>
                            <th>Assigned Warehouse</th>
                            <th>Confirmed Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="add-stock.js"></script>
</body>
</html>

