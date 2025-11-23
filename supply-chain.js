// supply-chain.js - Supply Chain Management System

// Global variables
let recentAdditions = [];

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

// Add stock to deliveries (pending confirmation)
async function addStockToDeliveries(stockData, supplier, deliveryDate, notes) {
    try {
        const deliveryData = {
            ...stockData,
            supplier: supplier,
            deliveryDate: deliveryDate,
            notes: notes || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const res = await fetch(buildApiUrl('deliveries.php?action=add_pending'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deliveryData)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to add delivery');
        }
        return data.data;
    } catch (err) {
        throw new Error(`Error adding delivery: ${err.message}`);
    }
}

// Get warehouse name
function getWarehouseName(warehouseValue) {
    const warehouseNames = {
        'main': 'Main Warehouse',
        'branch1': 'Branch 1',
        'branch2': 'Branch 2'
    };
    return warehouseNames[warehouseValue] || warehouseValue;
}

// Add to recent additions
function addToRecentAdditions(stockData, addedItem) {
    const recentItem = {
        id: addedItem.id,
        date: new Date().toLocaleDateString('en-PH'),
        supplier: stockData.supplier,
        model: stockData.model,
        size: stockData.size,
        brand: stockData.brand,
        quantity: stockData.quantity,
        price: stockData.price,
        totalValue: stockData.quantity * stockData.price,
        warehouse: getWarehouseName(stockData.warehouse)
    };
    
    recentAdditions.unshift(recentItem);
    
    // Keep only last 10 additions
    if (recentAdditions.length > 10) {
        recentAdditions = recentAdditions.slice(0, 10);
    }
    
    updateRecentTable();
    updateStatistics();
}

// Update recent additions table
function updateRecentTable() {
    const tbody = document.querySelector('#recent-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    recentAdditions.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = item.totalValue.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0
        });
        
        const unitPrice = item.price.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0
        });
        
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.supplier}</td>
            <td>${item.model}</td>
            <td>${item.size}</td>
            <td>${item.brand}</td>
            <td>${item.quantity}</td>
            <td>${unitPrice}</td>
            <td>${totalValue}</td>
            <td>${item.warehouse}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const itemsAddedToday = recentAdditions.filter(item => {
        const today = new Date().toLocaleDateString('en-PH');
        return item.date === today;
    }).length;
    
    const itemsAddedEl = document.getElementById('items-added-today');
    if (itemsAddedEl) {
        itemsAddedEl.textContent = itemsAddedToday;
    }
}

// View recent additions
function viewRecentAdditions() {
    const recentSection = document.getElementById('recent-additions');
    if (recentSection) {
        recentSection.style.display = 'block';
        recentSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide recent additions
function hideRecentAdditions() {
    const recentSection = document.getElementById('recent-additions');
    if (recentSection) {
        recentSection.style.display = 'none';
    }
}

// Refresh data
async function refreshData() {
    showNotification('Refreshing data...', 'info');
    try {
        // Refresh statistics
        updateStatistics();
        
        // Refresh recent additions if available
        if (typeof updateRecentTable === 'function') {
            updateRecentTable();
        }
        
        showNotification('Data refreshed successfully!', 'success');
    } catch (err) {
        showNotification(`Error refreshing data: ${err.message}`, 'error');
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        deliveryDateInput.value = today;
    }
    
    // Form submission
    const addStockForm = document.getElementById('add-stock-form');
    if (addStockForm) {
        addStockForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const stockData = {
                model: formData.get('model'),
                size: formData.get('size'),
                brand: formData.get('brand'),
                warehouse: formData.get('warehouse'),
                quantity: Number(formData.get('quantity')),
                price: Number(formData.get('price')),
                minStock: Number(formData.get('minStock'))
            };
            
            const supplier = formData.get('supplier');
            const deliveryDate = formData.get('deliveryDate');
            const notes = formData.get('notes');
            
            // Validate required fields
            if (!stockData.model || !stockData.size || !stockData.brand || 
                !stockData.warehouse || !supplier || !deliveryDate) {
                showNotification('Please fill in all required fields!', 'error');
                return;
            }
            
            // Validate numeric fields
            if (stockData.quantity <= 0 || stockData.price < 0 || stockData.minStock < 0) {
                showNotification('Please enter valid numeric values!', 'error');
                return;
            }
            
            try {
                showNotification('Adding stock to deliveries (pending confirmation)...', 'info');
                
                // Add stock to deliveries (pending)
                const addedItem = await addStockToDeliveries(stockData, supplier, deliveryDate, notes);
                
                // Add to recent additions with supplier info
                const recentData = {
                    ...stockData,
                    supplier: supplier,
                    deliveryDate: deliveryDate,
                    notes: notes
                };
                addToRecentAdditions(recentData, addedItem);
                
                showNotification(`Successfully added ${stockData.quantity} units of ${stockData.model} ${stockData.size} to deliveries. Please confirm in Deliveries page.`, 'success');
                
                // Reset form
                addStockForm.reset();
                deliveryDateInput.value = today;
                document.getElementById('min-stock').value = 5;
                
            } catch (err) {
                showNotification(err.message, 'error');
            }
        });
    }
    
    // Auto-populate brand when supplier is selected
    const supplierSelect = document.getElementById('supplier-select');
    const brandSelect = document.getElementById('tire-brand');
    
    if (supplierSelect && brandSelect) {
        supplierSelect.addEventListener('change', function() {
            const supplier = this.value;
            if (supplier.includes('Bridgestone')) {
                brandSelect.value = 'Bridgestone';
            } else if (supplier.includes('Michelin')) {
                brandSelect.value = 'Michelin';
            } else if (supplier.includes('Goodyear')) {
                brandSelect.value = 'Goodyear';
            }
        });
    }
    
    // Calculate total value
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('unit-price');
    
    function updateTotalValue() {
        const quantity = Number(quantityInput.value) || 0;
        const price = Number(priceInput.value) || 0;
        const total = quantity * price;
        
        // You can add a total value display here if needed
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('input', updateTotalValue);
    }
    if (priceInput) {
        priceInput.addEventListener('input', updateTotalValue);
    }
    
    // Initialize statistics
    updateStatistics();
});

// Add CSS animations and styles
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
    
    .form-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
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
        transition: border-color 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
    
    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 30px;
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
    
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        text-align: center;
    }
    
    .btn-primary {
        background: #007bff;
        color: white;
    }
    
    .btn-primary:hover {
        background: #0056b3;
        transform: translateY(-1px);
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #545b62;
    }
    
    .btn-success {
        background: #28a745;
        color: white;
    }
    
    .btn-success:hover {
        background: #1e7e34;
    }
    
    .btn-info {
        background: #17a2b8;
        color: white;
    }
    
    .btn-info:hover {
        background: #117a8b;
    }
    
    .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
    }
`;
document.head.appendChild(style);



