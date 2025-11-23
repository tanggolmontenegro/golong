<?php
// Stock Confirmation API using JSON file storage
// Endpoints:
//  - POST /TIRE/api/inventory.php?action=confirm
//  - GET /TIRE/api/inventory.php?action=list

// Load database configuration
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : '';
if (!in_array($action, ['confirm','list','add','delete','update'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing action']);
    exit;
}

// Get data directory and file paths
$dataDir = getDataDir();
$dataFile = $dataDir . DIRECTORY_SEPARATOR . 'inventory.json';
$transactionsFile = $dataDir . DIRECTORY_SEPARATOR . 'transactions.json';

function log_transaction($type, $description, $data = []) {
    global $transactionsFile;
    $transactions = read_json($transactionsFile);
    $transaction = [
        'id' => uniqid('txn_', true),
        'type' => $type,
        'description' => $description,
        'data' => $data,
        'timestamp' => date('c'),
        'user' => 'system'
    ];
    $transactions[] = $transaction;
    write_json($transactionsFile, $transactions);
    return $transaction;
}

// Parse JSON body
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);
if ($body === null) {
    // Fallback to form data
    $body = $_POST;
}

try {
    $items = read_json($dataFile);

    if ($action === 'list') {
        // Support only GET for list
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }

        echo json_encode(['success' => true, 'data' => $items]);
        exit;
    }

    // Allow only POST for mutations
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if ($action === 'confirm') {
        $required = ['orderId','model','size','brand','warehouse','quantity','price'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $newItem = [
            'id' => uniqid('conf_', true),
            'orderId' => (string)$body['orderId'],
            'model' => (string)$body['model'],
            'size' => (string)$body['size'],
            'brand' => (string)$body['brand'],
            'warehouse' => (string)$body['warehouse'],
            'quantity' => (int)$body['quantity'],
            'price' => (float)$body['price'],
            'notes' => isset($body['notes']) ? (string)$body['notes'] : '',
            'status' => isset($body['status']) ? (string)$body['status'] : 'confirmed',
            'confirmedAt' => date('c'),
            'createdAt' => date('c')
        ];

        if ($newItem['quantity'] <= 0 || $newItem['price'] < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Invalid numeric values']);
            exit;
        }

        $items[] = $newItem;
        write_json($dataFile, $items);

        // Log transaction
        log_transaction('stock_confirmed', "Stock confirmed: {$newItem['model']} {$newItem['size']} ({$newItem['brand']})", $newItem);

        echo json_encode(['success' => true, 'data' => $newItem]);
        exit;
    }

    if ($action === 'add') {
        $required = ['model','size','brand','warehouse','quantity','price','minStock'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $newItem = [
            'id' => uniqid('inv_', true),
            'model' => (string)$body['model'],
            'size' => (string)$body['size'],
            'brand' => (string)$body['brand'],
            'warehouse' => (string)$body['warehouse'],
            'quantity' => (int)$body['quantity'],
            'price' => (float)$body['price'],
            'minStock' => (int)$body['minStock'],
            'createdAt' => date('c')
        ];

        if ($newItem['quantity'] <= 0 || $newItem['price'] < 0 || $newItem['minStock'] < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Invalid numeric values']);
            exit;
        }

        $items[] = $newItem;
        write_json($dataFile, $items);

        // Log transaction
        log_transaction('inventory_added', "Inventory added: {$newItem['model']} {$newItem['size']} ({$newItem['brand']})", $newItem);

        echo json_encode(['success' => true, 'data' => $newItem]);
        exit;
    }

    if ($action === 'delete') {
        $required = ['id'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $itemIndex = -1;
        foreach ($items as $index => $item) {
            if ($item['id'] === $body['id']) {
                $itemIndex = $index;
                break;
            }
        }

        if ($itemIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Item not found']);
            exit;
        }

        $deletedItem = $items[$itemIndex];
        unset($items[$itemIndex]);
        $items = array_values($items); // Re-index array
        write_json($dataFile, $items);

        // Log transaction
        log_transaction('inventory_deleted', "Inventory deleted: {$deletedItem['model']} {$deletedItem['size']} ({$deletedItem['brand']})", $deletedItem);

        echo json_encode(['success' => true, 'data' => $deletedItem]);
        exit;
    }

    if ($action === 'update') {
        $required = ['id'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $itemIndex = -1;
        foreach ($items as $index => $item) {
            if ($item['id'] === $body['id']) {
                $itemIndex = $index;
                break;
            }
        }

        if ($itemIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Item not found']);
            exit;
        }

        $updatedItem = $items[$itemIndex];
        
        // Update fields if provided
        if (isset($body['model'])) $updatedItem['model'] = (string)$body['model'];
        if (isset($body['size'])) $updatedItem['size'] = (string)$body['size'];
        if (isset($body['brand'])) $updatedItem['brand'] = (string)$body['brand'];
        if (isset($body['warehouse'])) $updatedItem['warehouse'] = (string)$body['warehouse'];
        if (isset($body['quantity'])) $updatedItem['quantity'] = (int)$body['quantity'];
        if (isset($body['price'])) $updatedItem['price'] = (float)$body['price'];
        if (isset($body['minStock'])) $updatedItem['minStock'] = (int)$body['minStock'];
        
        $updatedItem['updatedAt'] = date('c');

        // Validate numeric values
        if (isset($body['quantity']) && $updatedItem['quantity'] < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Quantity cannot be negative']);
            exit;
        }
        if (isset($body['price']) && $updatedItem['price'] < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Price cannot be negative']);
            exit;
        }
        if (isset($body['minStock']) && $updatedItem['minStock'] < 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Min stock cannot be negative']);
            exit;
        }

        $items[$itemIndex] = $updatedItem;
        write_json($dataFile, $items);

        // Log transaction
        log_transaction('inventory_updated', "Inventory updated: {$updatedItem['model']} {$updatedItem['size']} ({$updatedItem['brand']})", $updatedItem);

        echo json_encode(['success' => true, 'data' => $updatedItem]);
        exit;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
}


