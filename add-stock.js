// Utilities from main script (minimal re-implementations)
function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.style.cssText = `position:fixed;top:20px;right:20px;background:${type==='success'?'#28a745':type==='error'?'#dc3545':'#4285f4'};color:#fff;padding:1rem 1.5rem;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.2);z-index:10000;max-width:300px;`;
    el.innerHTML = `<div class="notification-content" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;"><span>${message}</span><button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;" onclick="this.parentElement.parentElement.remove()">&times;</button></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function getWarehouseName(code) {
    const map = { main: 'Main Warehouse', branch1: 'Branch 1', branch2: 'Branch 2' };
    return map[code] || code;
}

function renderRow(item) {
    const totalValue = (Number(item.quantity) * Number(item.price)).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
    const unitPrice = Number(item.price).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });
    const confirmedDate = new Date(item.confirmedAt || item.createdAt).toLocaleDateString('en-PH');
    let status = 'Confirmed';
    let statusClass = 'status-confirmed';
    
    if (item.status === 'pending') {
        status = 'Pending';
        statusClass = 'status-pending';
    } else if (item.status === 'assigned') {
        status = 'Warehouse Assigned';
        statusClass = 'status-assigned';
    }

    return `
        <tr data-id="${item.id || ''}">
            <td>${item.orderId || 'N/A'}</td>
            <td>${item.model}</td>
            <td>${item.size}</td>
            <td>${item.brand}</td>
            <td>${item.quantity}</td>
            <td>${unitPrice}</td>
            <td>${totalValue}</td>
            <td>${getWarehouseName(item.warehouse)}</td>
            <td>${confirmedDate}</td>
            <td><span class="status-level ${statusClass}">${status}</span></td>
        </tr>
    `;
}

async function fetchInventory() {
    const res = await fetch(buildApiUrl('inventory.php?action=list'));
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch inventory');
    return Array.isArray(data.data) ? data.data : [];
}

async function confirmStock(stockData) {
    const res = await fetch(buildApiUrl('inventory.php?action=confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Confirmation failed');
    return data.data;
}

async function deleteInventoryById(id) {
    const res = await fetch(buildApiUrl('inventory.php?action=delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
}

async function renderTable() {
    try {
        const items = await fetchInventory();
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = items.map(renderRow).join('');
    } catch (e) {
        showNotification(`Error loading inventory: ${e.message}`, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    renderPendingDeliveries();

    const form = document.getElementById('add-stock-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = {
            orderId: fd.get('order-id'),
            model: fd.get('tire-model'),
            size: fd.get('tire-size'),
            brand: fd.get('tire-brand'),
            warehouse: fd.get('warehouse-location'),
            quantity: Number(fd.get('quantity')),
            price: Number(fd.get('unit-price')),
            notes: fd.get('confirmation-notes'),
            status: 'confirmed'
        };
        if (!payload.orderId || !payload.model || !payload.size || !payload.brand || !payload.warehouse || payload.quantity <= 0 || payload.price < 0) {
            showNotification('Please provide valid input for all required fields.', 'error');
            return;
        }
        try {
            showNotification('Confirming stock...', 'info');
            const created = await confirmStock(payload);
            showNotification('Stock confirmed and assigned to warehouse successfully!', 'success');
            form.reset();
            const tbody = document.querySelector('#inventory-table tbody');
            tbody.insertAdjacentHTML('afterbegin', renderRow(created));
            // Refresh pending deliveries in case this was from a delivery
            renderPendingDeliveries();
        } catch (e) {
            showNotification(`Error confirming stock: ${e.message}`, 'error');
        }
    });

    // Note: Delete functionality removed as this system is only for confirming incoming stocks
});

function buildApiUrl(pathWithQuery) {
    // Serve inventory.php from the same directory
    return pathWithQuery;
}

function exportConfirmedStocks() {
    const table = document.getElementById('inventory-table');
    const rows = table.getElementsByTagName('tr');
    let csv = 'Order ID,Tire Model,Size,Brand,Confirmed Qty,Unit Price,Total Value,Assigned Warehouse,Confirmed Date,Status\n';
    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].getElementsByTagName('td');
        if (!cols.length) continue;
        const rowData = [];
        for (let j = 0; j < cols.length; j++) {
            let text = cols[j].textContent.trim();
            if (text.includes('₱')) text = text.replace(/₱|,/g, '');
            rowData.push('"' + text.replace(/"/g, '""') + '"');
        }
        csv += rowData.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmed_stocks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function refreshConfirmedStocks() {
    renderTable();
}

// Fetch pending deliveries
async function fetchPendingDeliveries() {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=list'));
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch deliveries');
        // Filter for pending or ordered deliveries
        return Array.isArray(data.data) ? data.data.filter(d => 
            d.status === 'pending' || d.status === 'ordered'
        ) : [];
    } catch (e) {
        throw new Error(`Error fetching deliveries: ${e.message}`);
    }
}

// Fetch suppliers for display
async function fetchSuppliers() {
    try {
        const res = await fetch(buildApiUrl('deliveries.php?action=suppliers'));
        const data = await res.json();
        if (res.ok && data.success && data.data) {
            return data.data;
        }
        return [];
    } catch (e) {
        return [];
    }
}

// Get supplier name
function getSupplierName(supplierId, suppliers = []) {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : supplierId || 'Unknown Supplier';
}

// Render pending deliveries table
async function renderPendingDeliveries() {
    try {
        const [deliveries, suppliers] = await Promise.all([
            fetchPendingDeliveries(),
            fetchSuppliers()
        ]);
        
        const tbody = document.querySelector('#pending-deliveries-table tbody');
        if (!tbody) return;
        
        if (deliveries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem;">
                        <p>No pending deliveries to confirm.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = deliveries.map(delivery => {
            const totalValue = (delivery.quantity * delivery.unitPrice).toLocaleString('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 0
            });
            const unitPrice = delivery.unitPrice.toLocaleString('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 0
            });
            const expectedDate = delivery.expectedDate ? 
                new Date(delivery.expectedDate).toLocaleDateString('en-PH') : 'N/A';
            
            return `
                <tr data-delivery-id="${delivery.id}">
                    <td>${delivery.id}</td>
                    <td>${getSupplierName(delivery.supplierId, suppliers)}</td>
                    <td>${delivery.model}</td>
                    <td>${delivery.size}</td>
                    <td>${delivery.brand}</td>
                    <td>${delivery.quantity}</td>
                    <td>${unitPrice}</td>
                    <td>${totalValue}</td>
                    <td>${expectedDate}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="confirmDeliveryFromPending('${delivery.id}')" 
                                style="padding: 6px 12px; font-size: 12px;">
                            Confirm
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        const tbody = document.querySelector('#pending-deliveries-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem; color: #dc3545;">
                        <p>Error loading pending deliveries: ${e.message}</p>
                    </td>
                </tr>
            `;
        }
        showNotification(`Error loading pending deliveries: ${e.message}`, 'error');
    }
}

// Confirm delivery from pending list
async function confirmDeliveryFromPending(deliveryId) {
    try {
        // Fetch delivery details
        const deliveriesRes = await fetch(buildApiUrl('deliveries.php?action=list'));
        const deliveriesData = await deliveriesRes.json();
        if (!deliveriesRes.ok || !deliveriesData.success) {
            throw new Error('Failed to fetch delivery details');
        }
        
        const delivery = deliveriesData.data.find(d => d.id === deliveryId);
        if (!delivery) {
            throw new Error('Delivery not found');
        }
        
        // Confirm stock using delivery data
        const stockData = {
            orderId: delivery.id,
            model: delivery.model,
            size: delivery.size,
            brand: delivery.brand,
            warehouse: delivery.warehouse || 'main',
            quantity: delivery.quantity,
            price: delivery.unitPrice,
            notes: `Confirmed from delivery ${delivery.id}`,
            status: 'confirmed'
        };
        
        showNotification('Confirming delivery...', 'info');
        
        // Add to inventory
        const confirmed = await confirmStock(stockData);
        
        // Update delivery status to 'delivered'
        const updateRes = await fetch(buildApiUrl('deliveries.php?action=update_status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deliveryId: delivery.id,
                status: 'delivered',
                receivedBy: 'System'
            })
        });
        
        if (!updateRes.ok) {
            console.warn('Failed to update delivery status, but stock was confirmed');
        }
        
        showNotification('Delivery confirmed and added to inventory!', 'success');
        
        // Refresh both tables
        renderPendingDeliveries();
        renderTable();
        
    } catch (e) {
        showNotification(`Error confirming delivery: ${e.message}`, 'error');
    }
}

// Refresh pending deliveries
function refreshPendingDeliveries() {
    renderPendingDeliveries();
}



