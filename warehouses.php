<?php
// Warehouse Management API
// Endpoints:
//  - GET /TIRE/warehouses.php?action=list
//  - GET /TIRE/warehouses.php?action=inventory&warehouse=main

// Load database configuration
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : '';
if (!in_array($action, ['list','inventory'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing action']);
    exit;
}

// Get data directory and file paths
$dataDir = getDataDir();
$warehousesFile = $dataDir . DIRECTORY_SEPARATOR . 'warehouses.json';
$inventoryFile = $dataDir . DIRECTORY_SEPARATOR . 'inventory.json';

try {
    if ($action === 'list') {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }

        $warehouses = read_json($warehousesFile);
        
        // Get inventory data to calculate stats
        $inventory = read_json($inventoryFile);
        
        // Calculate stats for each warehouse
        foreach ($warehouses as &$warehouse) {
            $warehouseItems = array_filter($inventory, function($item) use ($warehouse) {
                return $item['warehouse'] === $warehouse['id'];
            });
            
            $currentStock = array_sum(array_column($warehouseItems, 'quantity'));
            $capacityUsed = $warehouse['capacity'] > 0 ? round(($currentStock / $warehouse['capacity']) * 100) : 0;
            
            // Count low stock items
            $lowStockCount = 0;
            foreach ($warehouseItems as $item) {
                if (isset($item['minStock']) && $item['quantity'] <= $item['minStock']) {
                    $lowStockCount++;
                }
            }
            
            $warehouse['stats'] = [
                'currentStock' => $currentStock,
                'capacityUsed' => $capacityUsed,
                'lowStockItems' => $lowStockCount,
                'totalItems' => count($warehouseItems)
            ];
        }
        
        echo json_encode(['success' => true, 'data' => $warehouses]);
        exit;
    }

    if ($action === 'inventory') {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }

        $warehouseId = isset($_GET['warehouse']) ? $_GET['warehouse'] : '';
        if (empty($warehouseId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Warehouse ID required']);
            exit;
        }

        $inventory = read_json($inventoryFile);
        $warehouseInventory = array_filter($inventory, function($item) use ($warehouseId) {
            return $item['warehouse'] === $warehouseId;
        });

        // Get warehouse details
        $warehouses = read_json($warehousesFile);
        $warehouse = null;
        foreach ($warehouses as $w) {
            if ($w['id'] === $warehouseId) {
                $warehouse = $w;
                break;
            }
        }

        if (!$warehouse) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Warehouse not found']);
            exit;
        }

        echo json_encode([
            'success' => true, 
            'data' => [
                'warehouse' => $warehouse,
                'inventory' => array_values($warehouseInventory)
            ]
        ]);
        exit;
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
}
?>

