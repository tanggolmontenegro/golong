// script.js - Warehouse-Centric Inventory Management System

// Global variables
let warehouses = [];
let currentWarehouse = null;
let currentInventory = [];

// Warehouse selection functionality
function selectWarehouse(warehouseId) {
    currentWarehouse = warehouses.find(w => w.id === warehouseId);
    if (!currentWarehouse) return;
    
    // Hide warehouse selection, show inventory
    document.querySelector('.management-section').style.display = 'none';
    document.getElementById('inventory-section').style.display = 'block';
    
    // Update title and load inventory
    document.getElementById('selected-warehouse-title').textContent = `${currentWarehouse.name} - Inventory`;
    loadWarehouseInventory(warehouseId);
    populateWarehouseInfo();
}

// Back to warehouses
function backToWarehouses() {
    document.querySelector('.management-section').style.display = 'block';
    document.getElementById('inventory-section').style.display = 'none';
    currentWarehouse = null;
    currentInventory = [];
}

// Modal functionality
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
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

// Apply inventory filters
function applyInventoryFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const brandFilter = document.getElementById('brand-filter').value;
    const sizeFilter = document.getElementById('size-filter').value;
    const stockStatusFilter = document.getElementById('stock-status-filter').value;
    
    const rows = document.querySelectorAll('#inventory-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length < 9) return; // Updated to check for 9 cells (including actions)
        
        const model = cells[0].textContent.toLowerCase();
        const size = cells[1].textContent.toLowerCase();
        const brand = cells[2].textContent.toLowerCase();
        // Check table structure - if warehouse column exists, adjust indices
        const hasWarehouse = cells.length > 9;
        const quantityIndex = hasWarehouse ? 4 : 3;
        const minStockIndex = hasWarehouse ? 5 : 4;
        const statusIndex = hasWarehouse ? 6 : 5;
        
        const quantity = parseInt(cells[quantityIndex].textContent) || 0;
        const minStock = parseInt(cells[minStockIndex].textContent) || 0;
        const stockStatusText = cells[statusIndex].textContent.toLowerCase();
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !model.includes(searchTerm) && !size.includes(searchTerm) && !brand.includes(searchTerm)) {
            showRow = false;
        }
        
        // Brand filter
        if (brandFilter && brand !== brandFilter.toLowerCase()) {
            showRow = false;
        }
        
        // Size filter
        if (sizeFilter && size !== sizeFilter.toLowerCase()) {
            showRow = false;
        }
        
        // Stock status filter - use actual minStock values
        if (stockStatusFilter) {
            if (stockStatusFilter === 'out' && quantity !== 0) {
                showRow = false;
            } else if (stockStatusFilter === 'low') {
                // Low stock: quantity <= minStock but > 0
                if (quantity === 0 || quantity > minStock) {
                    showRow = false;
                }
            } else if (stockStatusFilter === 'medium') {
                // Medium stock: quantity > minStock but <= minStock * 2
                if (quantity === 0 || quantity <= minStock || quantity > minStock * 2) {
                    showRow = false;
                }
            } else if (stockStatusFilter === 'high') {
                // High stock: quantity > minStock * 2
                if (quantity <= minStock * 2) {
                    showRow = false;
                }
            }
        }
        
        row.style.display = showRow ? '' : 'none';
        if (showRow) visibleCount++;
    });
    
    showNotification(`Showing ${visibleCount} of ${rows.length} items`);
}

// Show only low stock items
function showLowStockOnly() {
    document.getElementById('stock-status-filter').value = 'low';
    applyInventoryFilters();
}

// Clear inventory filters
function clearInventoryFilters() {
    const searchInput = document.getElementById('search-input');
    const brandFilter = document.getElementById('brand-filter');
    const sizeFilter = document.getElementById('size-filter');
    const stockStatusFilter = document.getElementById('stock-status-filter');
    
    if (searchInput) searchInput.value = '';
    if (brandFilter) brandFilter.value = '';
    if (sizeFilter) sizeFilter.value = '';
    if (stockStatusFilter) stockStatusFilter.value = '';
    
    // Show all rows
    const rows = document.querySelectorAll('#inventory-table tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    
    showNotification(`Showing all ${rows.length} items`);
}

// Refresh warehouses
function refreshWarehouses() {
    showNotification('Refreshing warehouses...', 'info');
    fetchWarehouses();
}

// Export inventory
function exportInventory() {
    if (!currentWarehouse) return;
    
    const table = document.getElementById('inventory-table');
    const rows = table.getElementsByTagName('tr');
    let csvContent = '';
    
    // Add headers
    const headers = ['Tire Model', 'Size', 'Brand', 'Quantity', 'Min Stock', 'Stock Status', 'Unit Price', 'Total Value'];
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
    a.download = `${currentWarehouse.name.replace(/\s+/g, '_')}_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Edit stock function
async function editStock(itemId) {
    if (!itemId) {
        showNotification('Item ID is missing!', 'error');
        return;
    }
    
    try {
        // Check if modal exists
        const modal = document.getElementById('edit-stock-modal');
        if (!modal) {
            showNotification('Edit modal not found. Please refresh the page.', 'error');
            return;
        }
        
        // Fetch the item data
        const res = await fetch(buildApiUrl('inventory.php?action=list'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch inventory');
        }
        
        const item = data.data.find(i => i.id === itemId);
        if (!item) {
            showNotification('Item not found!', 'error');
            return;
        }
        
        // Populate the edit form - check each element exists
        const editItemId = document.getElementById('edit-item-id');
        const editModel = document.getElementById('edit-tire-model');
        const editSize = document.getElementById('edit-tire-size');
        const editBrand = document.getElementById('edit-tire-brand');
        const editWarehouse = document.getElementById('edit-warehouse-location');
        const editQuantity = document.getElementById('edit-quantity');
        const editPrice = document.getElementById('edit-unit-price');
        const editMinStock = document.getElementById('edit-min-stock');
        
        if (!editItemId || !editModel || !editSize || !editBrand || !editWarehouse || 
            !editQuantity || !editPrice || !editMinStock) {
            showNotification('Edit form elements not found. Please refresh the page.', 'error');
            console.error('Missing form elements:', {
                editItemId: !!editItemId,
                editModel: !!editModel,
                editSize: !!editSize,
                editBrand: !!editBrand,
                editWarehouse: !!editWarehouse,
                editQuantity: !!editQuantity,
                editPrice: !!editPrice,
                editMinStock: !!editMinStock
            });
            return;
        }
        
        editItemId.value = item.id;
        editModel.value = item.model || '';
        editSize.value = item.size || '';
        editBrand.value = item.brand || '';
        editWarehouse.value = item.warehouse || 'main';
        editQuantity.value = item.quantity || 0;
        editPrice.value = item.price || 0;
        editMinStock.value = item.minStock || 0;
        
        // Open the modal
        openModal('edit-stock-modal');
    } catch (err) {
        console.error('Error in editStock:', err);
        showNotification(`Error loading item: ${err.message}`, 'error');
    }
}

// Delete stock function (works with both button element and itemId string)
async function deleteStock(itemIdOrButton) {
    let itemId = null;
    let row = null;
    let itemInfo = null;
    
    // Check if it's a button element (has closest method)
    if (itemIdOrButton && typeof itemIdOrButton.closest === 'function') {
        // This is a button element
        row = itemIdOrButton.closest('tr');
        if (!row) {
            showNotification('Could not find item row!', 'error');
            return;
        }
        itemId = row.getAttribute('data-id') || '';
        const tireModel = row.cells[0].textContent;
        const brand = row.cells[2].textContent;
        const size = row.cells[1].textContent;
        itemInfo = `${tireModel} ${size} (${brand})`;
    } else if (typeof itemIdOrButton === 'string') {
        // This is an item ID string
        itemId = itemIdOrButton;
        try {
            // Fetch the item data to show in confirmation
            const res = await fetch(buildApiUrl('inventory.php?action=list'));
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch inventory');
            }
            
            const item = data.data.find(i => i.id === itemId);
            if (!item) {
                showNotification('Item not found!', 'error');
                return;
            }
            
            itemInfo = `${item.model} ${item.size} (${item.brand})`;
            row = document.querySelector(`tr[data-id="${itemId}"]`);
        } catch (err) {
            showNotification(`Error fetching item: ${err.message}`, 'error');
            return;
        }
    } else {
        showNotification('Invalid delete request!', 'error');
        return;
    }
    
    if (!itemId) {
        showNotification('Item ID not found!', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${itemInfo}" from inventory?\n\nThis action cannot be undone.`)) {
        showNotification(`Deleting ${itemInfo}...`, 'info');
        try {
            const res = await fetch(buildApiUrl('inventory.php?action=delete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Delete failed');
            }
            
            // Add deletion animation if row exists
            if (row) {
                row.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                        row.remove();
                        showNotification('Inventory item deleted successfully!', 'success');
                        updateInventoryDisplay();
                    }, 300);
                    }, 200);
                } else {
                    // If row not found, reload inventory
                    if (currentWarehouse) {
                        loadWarehouseInventory(currentWarehouse.id);
                    } else {
                        updateInventoryDisplay();
                    }
                    showNotification('Inventory item deleted successfully!', 'success');
                }
                
                // Update dashboard statistics after deletion
                updateDashboardStatistics();
        } catch (err) {
            showNotification(`Error deleting item: ${err.message}`, 'error');
        }
    }
}

// Search functionality with real-time filtering
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#inventory-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

// Action functions (deleteStock is now defined above)

// Reorder stock function
async function reorderStock(itemId) {
    try {
        // Fetch the item data
        const res = await fetch(buildApiUrl('inventory.php?action=list'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch inventory');
        }
        
        const item = data.data.find(i => i.id === itemId);
        if (!item) {
            showNotification('Item not found!', 'error');
            return;
        }
        
        const quantity = prompt(`Enter quantity to reorder for ${item.model} ${item.size} (${item.brand}):`, item.minStock * 2);
        if (quantity === null) return;
        
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            showNotification('Please enter a valid quantity!', 'error');
            return;
        }
        
        if (confirm(`Create reorder request for ${qty} units of ${item.model} ${item.size} (${item.brand})?`)) {
            showNotification('Creating reorder request...', 'info');
            
            const reorderData = {
                itemId: item.id,
                model: item.model,
                size: item.size,
                brand: item.brand,
                quantity: qty,
                warehouse: item.warehouse,
                priority: item.quantity <= item.minStock ? 'high' : 'normal'
            };
            
            const reorderRes = await fetch(buildApiUrl('reorders.php?action=create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reorderData)
            });
            
            const reorderResult = await reorderRes.json();
            if (!reorderRes.ok || !reorderResult.success) {
                throw new Error(reorderResult.error || 'Failed to create reorder');
            }
            
            showNotification('Reorder request created successfully!', 'success');
        }
    } catch (err) {
        showNotification(`Error creating reorder: ${err.message}`, 'error');
    }
}

function exportPendingConfirmations() {
    showNotification('Exporting pending confirmations...', 'info');
    // Simulate export process
    setTimeout(() => {
        showNotification('Pending confirmations exported successfully!', 'success');
        // Here you would typically trigger a file download
        downloadPendingConfirmationsCSV();
    }, 1500);
}

// Create reorder function (alias for reorderStock)
function createReorder(itemId) {
    reorderStock(itemId);
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const addStockForm = document.getElementById('add-stock-form');
    if (addStockForm) {
        addStockForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const stockData = {
                model: formData.get('tire-model'),
                size: formData.get('tire-size'),
                brand: formData.get('tire-brand'),
                warehouse: formData.get('warehouse-location'),
                quantity: Number(formData.get('quantity')),
                price: Number(formData.get('unit-price')),
                minStock: Number(formData.get('min-stock'))
            };
            
            // Validate required fields
            if (!stockData.model || !stockData.size || !stockData.brand || !stockData.warehouse) {
                showNotification('Please fill in all required fields!', 'error');
                return;
            }
            
            // Validate numeric fields
            if (stockData.quantity <= 0 || stockData.price <= 0 || stockData.minStock < 0) {
                showNotification('Please enter valid numeric values!', 'error');
                return;
            }
            
            // Call backend to add stock
            showNotification('Adding stock...', 'info');
            try {
                const res = await fetch(buildApiUrl('inventory.php?action=add'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(stockData)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Add failed');
                }
                showNotification('Stock added successfully!', 'success');
                closeModal('add-stock-modal');
                addStockForm.reset();
                // Add new row to table with returned id
                addNewInventoryRow({ ...stockData, id: data.data.id });
                updateInventoryDisplay();
                // Update dashboard statistics
                updateDashboardStatistics();
            } catch (err) {
                showNotification(`Error adding stock: ${err.message}`, 'error');
            }
        });
    }
    
    // Edit stock form submission handler
    const editStockForm = document.getElementById('edit-stock-form');
    if (editStockForm) {
        editStockForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const itemId = document.getElementById('edit-item-id').value;
            if (!itemId) {
                showNotification('Item ID is missing!', 'error');
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const stockData = {
                id: itemId,
                model: formData.get('tire-model'),
                size: formData.get('tire-size'),
                brand: formData.get('tire-brand'),
                warehouse: formData.get('warehouse-location'),
                quantity: Number(formData.get('quantity')),
                price: Number(formData.get('unit-price')),
                minStock: Number(formData.get('min-stock'))
            };
            
            // Validate required fields
            if (!stockData.model || !stockData.size || !stockData.brand || !stockData.warehouse) {
                showNotification('Please fill in all required fields!', 'error');
                return;
            }
            
            // Validate numeric fields
            if (stockData.quantity < 0 || stockData.price < 0 || stockData.minStock < 0) {
                showNotification('Please enter valid numeric values!', 'error');
                return;
            }
            
            // Call backend to update stock
            showNotification('Updating stock...', 'info');
            try {
                const res = await fetch(buildApiUrl('inventory.php?action=update'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(stockData)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Update failed');
                }
                showNotification('Stock updated successfully!', 'success');
                closeModal('edit-stock-modal');
                editStockForm.reset();
                
                // Update dashboard statistics
                updateDashboardStatistics();
                
                // Reload inventory to reflect changes
                if (currentWarehouse) {
                    loadWarehouseInventory(currentWarehouse.id);
                } else {
                    // If no warehouse selected, just refresh the display
                    updateInventoryDisplay();
                }
            } catch (err) {
                showNotification(`Error updating stock: ${err.message}`, 'error');
            }
        });
    }
});

// Add new inventory row to table
function addNewInventoryRow(stockData) {
    const tableBody = document.querySelector('#inventory-table tbody');
    const totalValue = (stockData.quantity * stockData.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    const unitPrice = parseFloat(stockData.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 0
    });
    
    // Determine stock status
    let stockStatus = 'high';
    let stockClass = 'stock-high';
    if (stockData.quantity <= stockData.minStock) {
        stockStatus = 'Low Stock';
        stockClass = 'stock-low';
    } else if (stockData.quantity <= stockData.minStock * 2) {
        stockStatus = 'Medium Stock';
        stockClass = 'stock-medium';
    } else {
        stockStatus = 'High Stock';
        stockClass = 'stock-high';
    }
    
    const newRow = `
        <tr ${stockData.id ? `data-id="${stockData.id}"` : ''} style="background-color: #e8f5e8; animation: fadeIn 0.5s ease;">
            <td>${stockData.model}</td>
            <td>${stockData.size}</td>
            <td>${stockData.brand}</td>
            <td>${getWarehouseName(stockData.warehouse)}</td>
            <td>${stockData.quantity}</td>
            <td>${stockData.minStock}</td>
            <td><span class="stock-level ${stockClass}">${stockStatus}</span></td>
            <td>${unitPrice}</td>
            <td>${totalValue}</td>
            <td>
                <button class="btn btn-primary btn-sm edit-btn" data-id="${stockData.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${stockData.id}">Delete</button>
            </td>
        </tr>
    `;
    
    tableBody.insertAdjacentHTML('afterbegin', newRow);
    
    // Find the newly added row by data-id
    const addedRow = tableBody.querySelector(`tr[data-id="${stockData.id}"]`);
    
    // Remove highlight after 3 seconds
    if (addedRow) {
        setTimeout(() => {
            addedRow.style.backgroundColor = '';
        }, 3000);
    }
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

// Update inventory display after changes
function updateInventoryDisplay() {
    // Update statistics
    updateStatistics();
    
    // Update dashboard statistics
    updateDashboardStatistics();
    
    // This function would typically fetch updated data from your backend
    setTimeout(() => {
        showNotification('Inventory updated!', 'info');
    }, 500);
}

// Update statistics cards
function updateStatistics() {
    const rows = document.querySelectorAll('#inventory-table tbody tr');
    let totalItems = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            totalItems += parseInt(row.cells[4].textContent) || 0;
            
            // Extract numeric value from currency string
            const valueText = row.cells[8].textContent.replace(/[₱,]/g, '');
            totalValue += parseFloat(valueText) || 0;
            
            // Check if it's low stock
            if (row.cells[6].textContent.toLowerCase().includes('low')) {
                lowStockCount++;
            }
        }
    });
    
    // Update the statistics cards
    const statCards = document.querySelectorAll('.stat-number');
    if (statCards[0]) statCards[0].textContent = totalItems.toLocaleString();
    if (statCards[1]) statCards[1].textContent = '₱' + totalValue.toLocaleString();
    if (statCards[2]) statCards[2].textContent = lowStockCount;
}

// Render inventory table
function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentInventory.forEach(item => {
        const row = createInventoryRow(item);
        tbody.appendChild(row);
    });
}

// Create inventory row
function createInventoryRow(item) {
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
    
    // Determine stock status
    let stockStatus = 'High Stock';
    let stockClass = 'stock-high';
    let stockIcon = '✅';
    
    if (item.quantity === 0) {
        stockStatus = 'Out of Stock';
        stockClass = 'stock-out';
        stockIcon = '❌';
    } else if (item.quantity <= item.minStock) {
        stockStatus = 'Low Stock';
        stockClass = 'stock-low';
        stockIcon = '⚠️';
    } else if (item.quantity <= item.minStock * 2) {
        stockStatus = 'Medium Stock';
        stockClass = 'stock-medium';
        stockIcon = '⚡';
    }
    
    // Highlight low stock rows
    if (item.quantity <= item.minStock) {
        row.style.backgroundColor = '#fff5f5';
        row.style.borderLeft = '4px solid #dc3545';
    }
    
    row.innerHTML = `
        <td>${item.model}</td>
        <td>${item.size}</td>
        <td>${item.brand}</td>
        <td class="quantity-cell ${item.quantity <= item.minStock ? 'low-quantity' : ''}">${item.quantity}</td>
        <td>${item.minStock}</td>
        <td><span class="stock-level ${stockClass}">${stockIcon} ${stockStatus}</span></td>
        <td>${unitPrice}</td>
        <td>${totalValue}</td>
        <td>
            <button class="btn btn-primary btn-sm edit-btn" data-id="${item.id || ''}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id || ''}">Delete</button>
        </td>
    `;
    
    return row;
}

// Populate filter dropdowns
function populateFilters() {
    const brandFilter = document.getElementById('brand-filter');
    const sizeFilter = document.getElementById('size-filter');
    
    if (brandFilter) {
        const brands = [...new Set(currentInventory.map(item => item.brand))].sort();
        brandFilter.innerHTML = '<option value="">All Brands</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }
    
    if (sizeFilter) {
        const sizes = [...new Set(currentInventory.map(item => item.size))].sort();
        sizeFilter.innerHTML = '<option value="">All Sizes</option>';
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeFilter.appendChild(option);
        });
    }
}

// Build API URL using current base path (e.g., /TIRE)
function buildApiUrl(pathWithQuery) {
    // Serve inventory.php from the same directory
    return pathWithQuery;
}

// Fetch warehouses
async function fetchWarehouses() {
    try {
        const res = await fetch(buildApiUrl('warehouses.php?action=list'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch warehouses');
        }
        warehouses = data.data;
        renderWarehouses();
    } catch (err) {
        showNotification(`Error loading warehouses: ${err.message}`, 'error');
    }
}

// Render warehouses
function renderWarehouses() {
    const container = document.getElementById('warehouse-selection');
    if (!container) return;
    
    container.innerHTML = '';
    
    warehouses.forEach(warehouse => {
        const warehouseCard = createWarehouseCard(warehouse);
        container.appendChild(warehouseCard);
    });
}

// Create warehouse card
function createWarehouseCard(warehouse) {
    const card = document.createElement('div');
    card.className = 'warehouse-card';
    card.onclick = () => selectWarehouse(warehouse.id);
    
    const capacityUsed = warehouse.stats.capacityUsed;
    const capacityClass = capacityUsed > 80 ? 'capacity-high' : capacityUsed > 60 ? 'capacity-medium' : 'capacity-low';
    
    card.innerHTML = `
        <div class="warehouse-name">${warehouse.name}</div>
        <div class="warehouse-info">
            <strong>Address:</strong> ${warehouse.address}<br>
            <strong>Manager:</strong> ${warehouse.manager}<br>
            <strong>Contact:</strong> ${warehouse.contact}<br>
            <strong>Capacity:</strong> ${warehouse.capacity.toLocaleString()} tires
        </div>
        <div class="warehouse-stats">
            <div class="warehouse-stat">
                <div class="warehouse-stat-number">${warehouse.stats.currentStock.toLocaleString()}</div>
                <div class="warehouse-stat-label">Current Stock</div>
            </div>
            <div class="warehouse-stat">
                <div class="warehouse-stat-number ${capacityClass}">${capacityUsed}%</div>
                <div class="warehouse-stat-label">Capacity Used</div>
            </div>
            <div class="warehouse-stat">
                <div class="warehouse-stat-number">${warehouse.stats.lowStockItems}</div>
                <div class="warehouse-stat-label">Low Stock Items</div>
            </div>
            <div class="warehouse-stat">
                <div class="warehouse-stat-number">${warehouse.stats.totalItems}</div>
                <div class="warehouse-stat-label">Product Types</div>
            </div>
        </div>
        <div class="warehouse-actions">
            <button class="btn btn-primary" onclick="event.stopPropagation(); selectWarehouse('${warehouse.id}')">
                View Inventory
            </button>
        </div>
    `;
    
    return card;
}

// Load warehouse inventory
async function loadWarehouseInventory(warehouseId) {
    try {
        const res = await fetch(buildApiUrl(`warehouses.php?action=inventory&warehouse=${warehouseId}`));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch warehouse inventory');
        }
        currentInventory = data.data.inventory;
        renderInventory();
        populateFilters();
    } catch (err) {
        showNotification(`Error loading inventory: ${err.message}`, 'error');
    }
}

// Populate warehouse info card
function populateWarehouseInfo() {
    if (!currentWarehouse) return;
    
    const infoCard = document.getElementById('warehouse-info');
    if (!infoCard) return;
    
    const capacityUsed = currentWarehouse.stats.capacityUsed;
    const capacityClass = capacityUsed > 80 ? 'capacity-high' : capacityUsed > 60 ? 'capacity-medium' : 'capacity-low';
    
    // Count low stock items
    const lowStockItems = currentInventory.filter(item => item.quantity <= item.minStock);
    const outOfStockItems = currentInventory.filter(item => item.quantity === 0);
    
    infoCard.innerHTML = `
        <div class="warehouse-info-header">
            <h3>${currentWarehouse.name}</h3>
            <span class="warehouse-status status-active">Active</span>
        </div>
        <div class="warehouse-info-details">
            <div class="info-row">
                <strong>Address:</strong> ${currentWarehouse.address}
            </div>
            <div class="info-row">
                <strong>Manager:</strong> ${currentWarehouse.manager}
            </div>
            <div class="info-row">
                <strong>Contact:</strong> ${currentWarehouse.contact}
            </div>
            <div class="info-row">
                <strong>Capacity:</strong> ${currentWarehouse.capacity.toLocaleString()} tires
            </div>
        </div>
        <div class="warehouse-info-stats">
            <div class="info-stat">
                <div class="info-stat-number">${currentWarehouse.stats.currentStock.toLocaleString()}</div>
                <div class="info-stat-label">Current Stock</div>
            </div>
            <div class="info-stat">
                <div class="info-stat-number ${capacityClass}">${capacityUsed}%</div>
                <div class="info-stat-label">Capacity Used</div>
            </div>
            <div class="info-stat">
                <div class="info-stat-number ${lowStockItems.length > 0 ? 'text-warning' : ''}">${lowStockItems.length}</div>
                <div class="info-stat-label">Low Stock Items</div>
            </div>
            <div class="info-stat">
                <div class="info-stat-number">${currentWarehouse.stats.totalItems}</div>
                <div class="info-stat-label">Product Types</div>
            </div>
        </div>
        ${lowStockItems.length > 0 ? `
        <div class="low-stock-alert">
            <h4>⚠️ Low Stock Alert</h4>
            <p>The following items are running low on stock (≤ ${lowStockItems[0].minStock} units):</p>
            <ul>
                ${lowStockItems.slice(0, 5).map(item => `
                    <li><strong>${item.model} ${item.size}</strong> (${item.brand}) - ${item.quantity} units remaining</li>
                `).join('')}
                ${lowStockItems.length > 5 ? `<li>... and ${lowStockItems.length - 5} more items</li>` : ''}
            </ul>
        </div>
        ` : ''}
    `;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add notification styles
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.7;
    }
    
    .warehouse-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        border: 2px solid transparent;
    }
    
    .warehouse-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border-color: #007bff;
    }
    
    .warehouse-name {
        font-size: 1.4rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 10px;
    }
    
    .warehouse-info {
        margin-bottom: 20px;
        line-height: 1.6;
        color: #666;
    }
    
    .warehouse-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .warehouse-stat {
        text-align: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .warehouse-stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
    }
    
    .warehouse-stat-label {
        font-size: 0.9rem;
        color: #666;
        margin-top: 5px;
    }
    
    .warehouse-actions {
        text-align: center;
    }
    
    .capacity-low { color: #28a745; }
    .capacity-medium { color: #ffc107; }
    .capacity-high { color: #dc3545; }
    
    .warehouse-info-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .warehouse-info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 15px;
    }
    
    .warehouse-info-header h3 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
    }
    
    .warehouse-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
    }
    
    .status-active {
        background: #d4edda;
        color: #155724;
    }
    
    .warehouse-info-details {
        margin-bottom: 20px;
    }
    
    .info-row {
        margin-bottom: 10px;
        color: #666;
    }
    
    .warehouse-info-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
    
    .info-stat {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .info-stat-number {
        font-size: 1.8rem;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
    }
    
    .info-stat-label {
        font-size: 0.9rem;
        color: #666;
    }
    
    .stock-level {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .stock-high {
        background: #d4edda;
        color: #155724;
    }
    
    .stock-medium {
        background: #fff3cd;
        color: #856404;
    }
    
    .stock-low {
        background: #f8d7da;
        color: #721c24;
    }
    
    .stock-out {
        background: #f5c6cb;
        color: #721c24;
        font-weight: bold;
    }
    
    .low-quantity {
        color: #dc3545;
        font-weight: bold;
    }
    
    .text-warning {
        color: #ffc107 !important;
    }
    
    .low-stock-alert {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
    }
    
    .low-stock-alert h4 {
        margin: 0 0 10px 0;
        color: #856404;
        font-size: 1.1rem;
    }
    
    .low-stock-alert p {
        margin: 0 0 10px 0;
        color: #856404;
    }
    
    .low-stock-alert ul {
        margin: 0;
        padding-left: 20px;
    }
    
    .low-stock-alert li {
        margin-bottom: 5px;
        color: #856404;
    }
    
    .quantity-cell {
        font-weight: bold;
    }
    
    .quantity-cell.low-quantity {
        background: #fff5f5;
        color: #dc3545;
        border-radius: 4px;
        padding: 2px 6px;
    }
`;
document.head.appendChild(style);

// Section switching (for navigation) - Removed unused sections
// This function is no longer needed as Dashboard, Warehouse, and Reports have been removed

// CSV Export functionality
function downloadPendingConfirmationsCSV() {
    const table = document.getElementById('inventory-table');
    const rows = table.getElementsByTagName('tr');
    let csvContent = '';
    
    // Add headers
    const headers = ['Order ID', 'Tire Model', 'Size', 'Brand', 'Ordered Qty', 'Unit Price', 'Total Value', 'Assigned Warehouse', 'Status'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.style.display !== 'none') {
            const cols = row.getElementsByTagName('td');
            const rowData = [];
            
            for (let j = 0; j < cols.length - 1; j++) { // Skip actions column
                let cellText = cols[j].textContent.trim();
                // Clean up currency values
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
    a.download = `pending_confirmations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Update dashboard statistics
async function updateDashboardStatistics() {
    try {
        // Fetch all data needed for statistics
        const [deliveriesRes, inventoryRes, transactionsRes, warehousesRes] = await Promise.all([
            fetch(buildApiUrl('deliveries.php?action=list')).catch(() => null),
            fetch(buildApiUrl('inventory.php?action=list')).catch(() => null),
            fetch(buildApiUrl('transactions.php?action=list')).catch(() => null),
            fetch(buildApiUrl('warehouses.php?action=list')).catch(() => null)
        ]);
        
        // Process deliveries for pending confirmations
        let pendingCount = 0;
        if (deliveriesRes && deliveriesRes.ok) {
            const deliveriesData = await deliveriesRes.json();
            if (deliveriesData.success && deliveriesData.data) {
                // Count deliveries with status 'pending' or 'ordered'
                pendingCount = deliveriesData.data.filter(d => 
                    d.status === 'pending' || d.status === 'ordered'
                ).length;
            }
        }
        
        // Process inventory for total order value
        let totalValue = 0;
        if (inventoryRes && inventoryRes.ok) {
            const inventoryData = await inventoryRes.json();
            if (inventoryData.success && inventoryData.data) {
                // Calculate total value of all inventory
                totalValue = inventoryData.data.reduce((sum, item) => {
                    return sum + (item.quantity * item.price);
                }, 0);
            }
        }
        
        // Process transactions for confirmed today
        let confirmedToday = 0;
        if (transactionsRes && transactionsRes.ok) {
            const transactionsData = await transactionsRes.json();
            if (transactionsData.success && transactionsData.data) {
                const today = new Date().toDateString();
                confirmedToday = transactionsData.data.filter(t => {
                    const transactionDate = new Date(t.timestamp).toDateString();
                    return transactionDate === today && (
                        t.type === 'stock_confirmed' || 
                        t.type === 'inventory_added' ||
                        t.type === 'inventory_updated'
                    );
                }).length;
            }
        }
        
        // Process warehouses count
        let warehouseCount = 0;
        if (warehousesRes && warehousesRes.ok) {
            const warehousesData = await warehousesRes.json();
            if (warehousesData.success && warehousesData.data) {
                warehouseCount = warehousesData.data.length;
            }
        }
        
        // Update the DOM
        const pendingEl = document.getElementById('pending-confirmations');
        const valueEl = document.getElementById('total-order-value');
        const warehouseEl = document.getElementById('warehouse-count');
        const confirmedEl = document.getElementById('confirmed-today');
        
        if (pendingEl) pendingEl.textContent = pendingCount;
        if (valueEl) valueEl.textContent = '₱' + totalValue.toLocaleString();
        if (warehouseEl) warehouseEl.textContent = warehouseCount;
        if (confirmedEl) confirmedEl.textContent = confirmedToday;
        
    } catch (err) {
        console.error('Error updating dashboard statistics:', err);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    showNotification('Warehouse Inventory Management System loaded successfully!', 'success');
    
    // Load warehouses
    fetchWarehouses();
    
    // Update dashboard statistics
    updateDashboardStatistics();
    
    // Use event delegation for edit/delete buttons on inventory table
    const inventoryTable = document.getElementById('inventory-table');
    if (inventoryTable) {
        const tbody = inventoryTable.querySelector('tbody');
        if (tbody) {
            tbody.addEventListener('click', function(e) {
                // Handle edit button clicks
                if (e.target.classList.contains('edit-btn')) {
                    const itemId = e.target.getAttribute('data-id');
                    if (itemId) {
                        e.preventDefault();
                        e.stopPropagation();
                        editStock(itemId);
                    }
                }
                
                // Handle delete button clicks
                if (e.target.classList.contains('delete-btn')) {
                    const itemId = e.target.getAttribute('data-id');
                    if (itemId) {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteStock(itemId);
                    }
                }
            });
        }
    }
    
    // Initialize search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#inventory-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

// Table sorting functionality
function sortTable(columnIndex, tableId = 'inventory-table') {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.getElementsByTagName('tr')).slice(1);
    const isAscending = table.getAttribute('data-sort-direction') !== 'asc';
    
    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
        const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();
        
        // Handle numeric columns
        if (columnIndex === 4 || columnIndex === 5) { // Stock columns
            return isAscending ? parseInt(aValue) - parseInt(bValue) : parseInt(bValue) - parseInt(aValue);
        }
        
        // Handle currency columns
        if (columnIndex === 7 || columnIndex === 8) { // Price columns
            const aNum = parseFloat(aValue.replace(/[₱,]/g, ''));
            const bNum = parseFloat(bValue.replace(/[₱,]/g, ''));
            return isAscending ? aNum - bNum : bNum - aNum;
        }
        
        // Handle text columns
        if (isAscending) {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    // Clear table body and re-add sorted rows
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    
    table.setAttribute('data-sort-direction', isAscending ? 'asc' : 'desc');
}

// Print functionality
function printReport() {
    const printWindow = window.open('', '', 'height=600,width=800');
    const table = document.getElementById('inventory-table').outerHTML;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Inventory Report - Indang Tire Supply</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .stock-level { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .stock-high { background: #d4edda; color: #155724; }
                    .stock-medium { background: #fff3cd; color: #856404; }
                    .stock-low { background: #f8d7da; color: #721c24; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h1>Inventory Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                ${table}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Refresh data function
async function refreshData() {
    showNotification('Refreshing data...', 'info');
    
    try {
        // Refresh warehouses if available
        if (typeof fetchWarehouses === 'function') {
            await fetchWarehouses();
        }
        
        // Refresh inventory if warehouse is selected
        if (currentWarehouse && typeof loadWarehouseInventory === 'function') {
            await loadWarehouseInventory(currentWarehouse.id);
        }
        
        // Update statistics
        updateStatistics();
        showNotification('Data refreshed successfully!', 'success');
    } catch (err) {
        showNotification(`Error refreshing data: ${err.message}`, 'error');
    }
}