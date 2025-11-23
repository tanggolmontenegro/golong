// deliveries.js - Product Delivery Management System

// Global variables
let deliveries = [];
let stockMovements = [];
let suppliers = [];
let currentFilter = '';

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Modal functionality
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#4285f4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Build API URL
function buildApiUrl(pathWithQuery) {
    return pathWithQuery;
}

// Fetch suppliers
async function fetchSuppliers() {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=suppliers'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch suppliers');
        }
        suppliers = data.data;
        populateSupplierSelects();
    } catch (err) {
        showNotification(`Error loading suppliers: ${err.message}`, 'error');
    }
}

// Populate supplier dropdowns
function populateSupplierSelects() {
    const supplierSelect = document.getElementById('supplier-select');
    const supplierFilter = document.getElementById('supplier-filter');
    
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
    }
    
    if (supplierFilter) {
        supplierFilter.innerHTML = '<option value="">All Suppliers</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierFilter.appendChild(option);
        });
    }
}

// Get supplier name by ID
function getSupplierName(supplierId) {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
}

// Fetch deliveries (pending from supply chain)
async function fetchDeliveries() {
    try {
        // Get pending deliveries
        const res = await fetch(buildApiUrl('deliveries.php?action=list'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch deliveries');
        }
        deliveries = data.data;
        renderDeliveries();
        updateStatistics();
    } catch (err) {
        showNotification(`Error loading deliveries: ${err.message}`, 'error');
    }
}

// Fetch stock movements from transactions
async function fetchStockMovements() {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=transactions'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch stock movements');
        }
        
        // Filter for inventory-related transactions
        stockMovements = data.data.filter(t => 
            t.type.includes('inventory') || t.type.includes('stock')
        );
        renderStockMovements();
    } catch (err) {
        showNotification(`Error loading stock movements: ${err.message}`, 'error');
    }
}

// Render deliveries table (shows inventory items as deliveries)
function renderDeliveries() {
    const tbody = document.querySelector('#deliveries-table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    deliveries.forEach(item => {
        const row = createDeliveryRow(item);
        tbody.appendChild(row);
    });
}

// Render stock movements table
function renderStockMovements() {
    const tbody = document.querySelector('#stock-movements-table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    stockMovements.forEach(movement => {
        const row = createStockMovementRow(movement);
        tbody.appendChild(row);
    });
}

// Create delivery row (shows pending deliveries)
function createDeliveryRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', item.id);
    
    const totalValue = (item.quantity * item.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    const unitPrice = item.price.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    const deliveryDate = item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('en-PH') : 'N/A';
    const warehouseName = getWarehouseName(item.warehouse);
    const supplier = item.supplier || 'Unknown Supplier';
    
    // Only show Confirm/Reject buttons for pending items
    const actionButtons = item.status === 'pending' ? `
        <button class="btn btn-success btn-sm" onclick="confirmDelivery('${item.id}')">Confirm</button>
        <button class="btn btn-danger btn-sm" onclick="rejectDelivery('${item.id}')">Reject</button>
    ` : `
        <span class="status-badge status-${item.status}">${item.status === 'confirmed' ? 'Confirmed' : item.status === 'rejected' ? 'Rejected' : item.status}</span>
    `;
    
    row.innerHTML = `
        <td>${deliveryDate}</td>
        <td>${item.model}</td>
        <td>${item.size}</td>
        <td>${item.brand}</td>
        <td>${item.quantity}</td>
        <td>${unitPrice}</td>
        <td>${totalValue}</td>
        <td>${warehouseName}</td>
        <td>${supplier}</td>
        <td>${actionButtons}</td>
    `;
    
    return row;
}

// Create stock movement row
function createStockMovementRow(movement) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', movement.id);
    
    const timestamp = new Date(movement.timestamp).toLocaleDateString('en-PH');
    const movementType = movement.type.includes('added') ? 'Stock Added' : 'Stock Deducted';
    const typeClass = movement.type.includes('added') ? 'movement-added' : 'movement-deducted';
    
    // Extract data from movement
    const data = movement.data || {};
    const quantity = data.quantity || 0;
    const price = data.price || 0;
    const totalValue = (quantity * price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    const unitPrice = price.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    row.innerHTML = `
        <td>${timestamp}</td>
        <td><span class="movement-type ${typeClass}">${movementType}</span></td>
        <td>${data.model || 'N/A'}</td>
        <td>${data.size || 'N/A'}</td>
        <td>${data.brand || 'N/A'}</td>
        <td>${quantity}</td>
        <td>${unitPrice}</td>
        <td>${totalValue}</td>
        <td>${getWarehouseName(data.warehouse) || 'N/A'}</td>
        <td>${movement.description}</td>
    `;
    
    return row;
}

// Helper function to get warehouse name
function getWarehouseName(warehouseValue) {
    const warehouseNames = {
        'main': 'Main Warehouse',
        'branch1': 'Branch 1',
        'branch2': 'Branch 2'
    };
    return warehouseNames[warehouseValue] || warehouseValue;
}

// Open status update modal
function openStatusModal(deliveryId, currentStatus) {
    document.getElementById('delivery-id').value = deliveryId;
    document.getElementById('new-status').value = currentStatus;
    
    const receivedByGroup = document.getElementById('received-by-group');
    if (currentStatus === 'delivered') {
        receivedByGroup.style.display = 'block';
    } else {
        receivedByGroup.style.display = 'none';
    }
    
    openModal('status-modal');
}

// Update delivery status
async function updateDeliveryStatus(deliveryId, status, receivedBy = '') {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=update_status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deliveryId: deliveryId,
                status: status,
                receivedBy: receivedBy
            })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to update status');
        }
        showNotification('Delivery status updated successfully!', 'success');
        closeModal('status-modal');
        fetchDeliveries();
    } catch (err) {
        showNotification(`Error updating status: ${err.message}`, 'error');
    }
}

// Confirm delivery and add to inventory
async function confirmDelivery(deliveryId) {
    if (!confirm('Are you sure you want to confirm this delivery? It will be added to inventory.')) {
        return;
    }
    
    try {
        showNotification('Confirming delivery...', 'info');
        const res = await fetch(buildApiUrl('deliveries.php?action=confirm'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: deliveryId })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to confirm delivery');
        }
        showNotification('Delivery confirmed and added to inventory!', 'success');
        fetchDeliveries();
    } catch (err) {
        showNotification(`Error confirming delivery: ${err.message}`, 'error');
    }
}

// Reject delivery
async function rejectDelivery(deliveryId) {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) {
        return; // User cancelled
    }
    
    try {
        showNotification('Rejecting delivery...', 'info');
        const res = await fetch(buildApiUrl('deliveries.php?action=reject'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: deliveryId,
                reason: reason || ''
            })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to reject delivery');
        }
        showNotification('Delivery rejected!', 'success');
        fetchDeliveries();
    } catch (err) {
        showNotification(`Error rejecting delivery: ${err.message}`, 'error');
    }
}

// Update statistics
function updateStatistics() {
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
    const totalDeliveries = pendingDeliveries.length;
    const deliveredToday = pendingDeliveries.filter(d => {
        const today = new Date().toDateString();
        const deliveryDate = d.deliveryDate ? new Date(d.deliveryDate).toDateString() : new Date(d.createdAt).toDateString();
        return today === deliveryDate;
    }).length;
    
    const totalValue = pendingDeliveries.reduce((sum, d) => sum + (d.quantity * d.price), 0);
    const totalItems = pendingDeliveries.reduce((sum, d) => sum + d.quantity, 0);
    
    // Update stat cards
    const totalEl = document.getElementById('total-deliveries');
    const valueEl = document.getElementById('total-value');
    const deliveredEl = document.getElementById('delivered-today');
    const itemsEl = document.getElementById('total-items');
    
    if (totalEl) totalEl.textContent = totalDeliveries;
    if (valueEl) valueEl.textContent = '₱' + totalValue.toLocaleString();
    if (deliveredEl) deliveredEl.textContent = deliveredToday;
    if (itemsEl) itemsEl.textContent = totalItems;
}

// Filter functionality
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const supplierFilter = document.getElementById('supplier-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const rows = document.querySelectorAll('#deliveries-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 10) return;
        
        const deliveryId = cells[0].textContent.toLowerCase();
        const supplier = cells[1].textContent.toLowerCase();
        const product = cells[2].textContent.toLowerCase();
        const brand = cells[4].textContent.toLowerCase();
        const status = cells[9].textContent.toLowerCase();
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !deliveryId.includes(searchTerm) && !supplier.includes(searchTerm) && 
            !product.includes(searchTerm) && !brand.includes(searchTerm)) {
            showRow = false;
        }
        
        // Supplier filter
        if (supplierFilter) {
            const delivery = deliveries.find(d => d.id === row.getAttribute('data-id'));
            if (!delivery || delivery.supplierId !== supplierFilter) {
                showRow = false;
            }
        }
        
        // Status filter
        if (statusFilter && !status.includes(statusFilter.toLowerCase())) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
        if (showRow) visibleCount++;
    });
    
    showNotification(`Showing ${visibleCount} deliveries`);
}

// Export functionality
function exportDeliveries() {
    const table = document.getElementById('deliveries-table');
    const rows = table.getElementsByTagName('tr');
    let csvContent = '';
    
    // Add headers
    const headers = ['Delivery ID', 'Supplier', 'Product', 'Size', 'Brand', 'Quantity', 'Unit Price', 'Total Value', 'Expected Date', 'Status'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.style.display !== 'none') {
            const cols = row.getElementsByTagName('td');
            const rowData = [];
            
            for (let j = 0; j < cols.length - 1; j++) { // Skip actions column
                let cellText = cols[j].textContent.trim();
                if (cellText.includes('₱')) {
                    cellText = cellText.replace(/₱|,/g, '');
                }
                rowData.push('"' + cellText.replace(/"/g, '""') + '"');
            }
            csvContent += rowData.join(',') + '\n';
        }
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Refresh deliveries
function refreshDeliveries() {
    showNotification('Refreshing deliveries...', 'info');
    fetchDeliveries();
}

// Refresh stock movements
function refreshStockMovements() {
    showNotification('Refreshing stock movements...', 'info');
    fetchStockMovements();
}

// Apply movement filters
function applyMovementFilters() {
    const searchTerm = document.getElementById('movement-search').value.toLowerCase();
    const typeFilter = document.getElementById('movement-type-filter').value;
    const warehouseFilter = document.getElementById('movement-warehouse-filter').value;
    
    const rows = document.querySelectorAll('#stock-movements-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 10) return;
        
        const movementType = cells[1].textContent.toLowerCase();
        const product = cells[2].textContent.toLowerCase();
        const brand = cells[4].textContent.toLowerCase();
        const warehouse = cells[8].textContent.toLowerCase();
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !product.includes(searchTerm) && !brand.includes(searchTerm)) {
            showRow = false;
        }
        
        // Type filter
        if (typeFilter) {
            if (typeFilter === 'added' && !movementType.includes('added')) {
                showRow = false;
            } else if (typeFilter === 'deducted' && !movementType.includes('deducted')) {
                showRow = false;
            }
        }
        
        // Warehouse filter
        if (warehouseFilter && !warehouse.includes(warehouseFilter.toLowerCase())) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
        if (showRow) visibleCount++;
    });
    
    showNotification(`Showing ${visibleCount} stock movements`);
}

// Export stock movements
function exportStockMovements() {
    const table = document.getElementById('stock-movements-table');
    const rows = table.getElementsByTagName('tr');
    let csvContent = '';
    
    // Add headers
    const headers = ['Date', 'Movement Type', 'Product', 'Size', 'Brand', 'Quantity', 'Unit Price', 'Total Value', 'Warehouse', 'Notes'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.style.display !== 'none') {
            const cols = row.getElementsByTagName('td');
            const rowData = [];
            
            for (let j = 0; j < cols.length; j++) {
                let cellText = cols[j].textContent.trim();
                if (cellText.includes('₱')) {
                    cellText = cellText.replace(/₱|,/g, '');
                }
                rowData.push('"' + cellText.replace(/"/g, '""') + '"');
            }
            csvContent += rowData.join(',') + '\n';
        }
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_movements_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    fetchSuppliers();
    fetchDeliveries();
    fetchStockMovements();
    
    // Tab switching to load appropriate data
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (tabName === 'stock-movements') {
                fetchStockMovements();
            } else if (tabName === 'delivery-history') {
                fetchDeliveries();
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#deliveries-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const deliveryDateInput = document.getElementById('delivery-date');
    const expectedDateInput = document.getElementById('expected-date');
    
    if (deliveryDateInput) deliveryDateInput.value = today;
    if (expectedDateInput) expectedDateInput.value = tomorrow;
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .status-level {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .status-delivered {
        background: #d4edda;
        color: #155724;
    }
    
    .status-cancelled {
        background: #f8d7da;
        color: #721c24;
    }
    
    .form-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group {
        flex: 1;
    }
    
    .form-group.full-width {
        flex: 100%;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    
    .movement-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .movement-added {
        background: #d4edda;
        color: #155724;
    }
    
    .movement-deducted {
        background: #f8d7da;
        color: #721c24;
    }
    
    .btn-danger {
        background: #dc3545;
        color: white;
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .btn-danger:hover {
        background: #c82333;
        transform: translateY(-1px);
    }
    
    .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        display: inline-block;
    }
    
    .status-confirmed {
        background: #d4edda;
        color: #155724;
    }
    
    .status-rejected {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
    }
`;
document.head.appendChild(style);
