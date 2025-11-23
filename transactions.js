// transactions.js - Transaction Log Management System

// Global variables
let transactions = [];
let filteredTransactions = [];
let currentPage = 1;
let itemsPerPage = 20;

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

// Fetch transactions
async function fetchTransactions() {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=transactions'));
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to fetch transactions');
        }
        transactions = data.data;
        filteredTransactions = [...transactions];
        updateStatistics();
        renderTransactions();
    } catch (err) {
        showNotification(`Error loading transactions: ${err.message}`, 'error');
    }
}

// Update statistics
function updateStatistics() {
    const totalCount = transactions.length;
    const today = new Date().toDateString();
    const todayCount = transactions.filter(t => 
        new Date(t.timestamp).toDateString() === today
    ).length;
    
    const deliveryCount = transactions.filter(t => 
        t.type.includes('delivery')
    ).length;
    
    const inventoryCount = transactions.filter(t => 
        t.type.includes('inventory') || t.type.includes('stock')
    ).length;
    
    // Update stat cards
    const totalEl = document.getElementById('total-transactions');
    const todayEl = document.getElementById('today-transactions');
    const deliveryEl = document.getElementById('delivery-transactions');
    const inventoryEl = document.getElementById('inventory-transactions');
    
    if (totalEl) totalEl.textContent = totalCount;
    if (todayEl) todayEl.textContent = todayCount;
    if (deliveryEl) deliveryEl.textContent = deliveryCount;
    if (inventoryEl) inventoryEl.textContent = inventoryCount;
}

// Render transactions table
function renderTransactions() {
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageTransactions.forEach(transaction => {
        const row = createTransactionRow(transaction);
        tbody.appendChild(row);
    });
    
    updatePagination();
}

// Create transaction row
function createTransactionRow(transaction) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', transaction.id);
    
    const timestamp = new Date(transaction.timestamp).toLocaleString('en-PH');
    const typeClass = getTypeClass(transaction.type);
    const typeLabel = getTypeLabel(transaction.type);
    
    row.innerHTML = `
        <td>${timestamp}</td>
        <td><span class="transaction-type ${typeClass}">${typeLabel}</span></td>
        <td>${transaction.description}</td>
        <td>${transaction.user || 'System'}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="showTransactionDetails('${transaction.id}')">View Details</button>
        </td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="viewRelatedData('${transaction.id}')">View Related</button>
        </td>
    `;
    
    return row;
}

// Get type class for styling
function getTypeClass(type) {
    if (type.includes('delivery')) return 'type-delivery';
    if (type.includes('inventory') || type.includes('stock')) return 'type-inventory';
    if (type.includes('created')) return 'type-created';
    if (type.includes('updated')) return 'type-updated';
    return 'type-default';
}

// Get type label
function getTypeLabel(type) {
    const labels = {
        'delivery_created': 'Delivery Created',
        'delivery_status_updated': 'Delivery Updated',
        'inventory_added': 'Inventory Added',
        'inventory_updated': 'Inventory Updated',
        'stock_confirmed': 'Stock Confirmed'
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Show transaction details
function showTransactionDetails(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    const detailsContainer = document.getElementById('transaction-details');
    detailsContainer.innerHTML = `
        <div class="transaction-detail">
            <h4>Transaction Information</h4>
            <table class="detail-table">
                <tr><td><strong>ID:</strong></td><td>${transaction.id}</td></tr>
                <tr><td><strong>Type:</strong></td><td>${getTypeLabel(transaction.type)}</td></tr>
                <tr><td><strong>Description:</strong></td><td>${transaction.description}</td></tr>
                <tr><td><strong>User:</strong></td><td>${transaction.user || 'System'}</td></tr>
                <tr><td><strong>Timestamp:</strong></td><td>${new Date(transaction.timestamp).toLocaleString('en-PH')}</td></tr>
            </table>
        </div>
        
        ${transaction.data ? `
        <div class="transaction-detail">
            <h4>Transaction Data</h4>
            <pre class="data-json">${JSON.stringify(transaction.data, null, 2)}</pre>
        </div>
        ` : ''}
    `;
    
    openModal('details-modal');
}

// View related data
function viewRelatedData(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    if (transaction.type.includes('delivery')) {
        showNotification('Redirecting to deliveries page...', 'info');
        setTimeout(() => {
            window.location.href = 'deliveries.php';
        }, 1000);
    } else if (transaction.type.includes('inventory') || transaction.type.includes('stock')) {
        showNotification('Redirecting to inventory page...', 'info');
        setTimeout(() => {
            window.location.href = 'index.php';
        }, 1000);
    } else {
        showNotification('No related data available for this transaction type', 'info');
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    
    filteredTransactions = transactions.filter(transaction => {
        let matches = true;
        
        // Search filter
        if (searchTerm) {
            const searchText = `${transaction.type} ${transaction.description} ${transaction.user}`.toLowerCase();
            if (!searchText.includes(searchTerm)) {
                matches = false;
            }
        }
        
        // Type filter
        if (typeFilter && transaction.type !== typeFilter) {
            matches = false;
        }
        
        // Date filters
        const transactionDate = new Date(transaction.timestamp);
        const today = new Date();
        
        if (dateFilter === 'today') {
            if (transactionDate.toDateString() !== today.toDateString()) {
                matches = false;
            }
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (transactionDate < weekAgo) {
                matches = false;
            }
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (transactionDate < monthAgo) {
                matches = false;
            }
        }
        
        // Custom date range
        if (fromDate) {
            const from = new Date(fromDate);
            if (transactionDate < from) {
                matches = false;
            }
        }
        
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999); // End of day
            if (transactionDate > to) {
                matches = false;
            }
        }
        
        return matches;
    });
    
    currentPage = 1;
    renderTransactions();
    showNotification(`Showing ${filteredTransactions.length} transactions`);
}

// Clear filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('date-filter').value = '';
    document.getElementById('from-date').value = '';
    document.getElementById('to-date').value = '';
    
    filteredTransactions = [...transactions];
    currentPage = 1;
    renderTransactions();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTransactions();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTransactions();
    }
}

// Sort table
function sortTable(columnIndex) {
    const tbody = document.querySelector('#transactions-table tbody');
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
        const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();
        
        // Handle date columns
        if (columnIndex === 0) {
            const aDate = new Date(a.getAttribute('data-timestamp') || aValue);
            const bDate = new Date(b.getAttribute('data-timestamp') || bValue);
            return bDate - aDate; // Newest first
        }
        
        // Handle text columns
        return aValue.localeCompare(bValue);
    });
    
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}

// Export transactions
function exportTransactions() {
    const table = document.getElementById('transactions-table');
    const rows = table.getElementsByTagName('tr');
    let csvContent = '';
    
    // Add headers
    const headers = ['Timestamp', 'Type', 'Description', 'User', 'Details'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cols = row.getElementsByTagName('td');
        const rowData = [];
        
        for (let j = 0; j < cols.length - 1; j++) { // Skip actions column
            let cellText = cols[j].textContent.trim();
            rowData.push('"' + cellText.replace(/"/g, '""') + '"');
        }
        csvContent += rowData.join(',') + '\n';
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Clear old transactions
async function clearOldTransactions() {
    const days = prompt('Enter number of days (transactions older than this will be deleted):', '30');
    if (days === null) return;
    
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1) {
        showNotification('Please enter a valid number of days!', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to clear transactions older than ${daysNum} days? This action cannot be undone.`)) {
        showNotification('Clearing old transactions...', 'info');
        try {
            const res = await fetch(buildApiUrl('transactions.php?action=clear_old'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: daysNum })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to clear old transactions');
            }
            showNotification(`Successfully deleted ${data.data.deleted} old transactions. ${data.data.remaining} transactions remaining.`, 'success');
            fetchTransactions();
        } catch (err) {
            showNotification(`Error clearing old transactions: ${err.message}`, 'error');
        }
    }
}

// Refresh transactions
function refreshTransactions() {
    showNotification('Refreshing transactions...', 'info');
    fetchTransactions();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    fetchTransactions();
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#transactions-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Set default date range
    const today = new Date().toISOString().split('T')[0];
    const fromDateInput = document.getElementById('from-date');
    if (fromDateInput) {
        fromDateInput.max = today;
    }
    
    const toDateInput = document.getElementById('to-date');
    if (toDateInput) {
        toDateInput.max = today;
    }
});

// Add CSS styles
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
    
    .transaction-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
    }
    
    .type-delivery {
        background: #d1ecf1;
        color: #0c5460;
    }
    
    .type-inventory {
        background: #d4edda;
        color: #155724;
    }
    
    .type-created {
        background: #fff3cd;
        color: #856404;
    }
    
    .type-updated {
        background: #f8d7da;
        color: #721c24;
    }
    
    .type-default {
        background: #e2e3e5;
        color: #383d41;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 20px;
        padding: 20px;
    }
    
    .transaction-detail {
        margin-bottom: 20px;
    }
    
    .detail-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .detail-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
    }
    
    .detail-table td:first-child {
        width: 150px;
        font-weight: bold;
    }
    
    .data-json {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        max-height: 300px;
        overflow-y: auto;
    }
`;
document.head.appendChild(style);

