<?php
// Reorder Management API
// Endpoints:
//  - POST /TIRE/reorders.php?action=create
//  - GET /TIRE/reorders.php?action=list
//  - POST /TIRE/reorders.php?action=update_status

// Load database configuration
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : '';
if (!in_array($action, ['create','list','update_status'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing action']);
    exit;
}

// Get data directory and file paths
$dataDir = getDataDir();
$reordersFile = $dataDir . DIRECTORY_SEPARATOR . 'reorders.json';
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
    $body = $_POST;
}

try {
    $reorders = read_json($reordersFile);

    if ($action === 'list') {
        // Support only GET for list
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            exit;
        }

        // Optional filters
        $statusFilter = isset($_GET['status']) ? $_GET['status'] : '';
        $filtered = $reorders;
        
        if ($statusFilter) {
            $filtered = array_filter($reorders, function($r) use ($statusFilter) {
                return $r['status'] === $statusFilter;
            });
        }

        echo json_encode(['success' => true, 'data' => array_values($filtered)]);
        exit;
    }

    // Allow only POST for mutations
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if ($action === 'create') {
        $required = ['itemId', 'model', 'size', 'brand', 'quantity', 'warehouse'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $newReorder = [
            'id' => uniqid('reorder_', true),
            'itemId' => (string)$body['itemId'],
            'model' => (string)$body['model'],
            'size' => (string)$body['size'],
            'brand' => (string)$body['brand'],
            'quantity' => (int)$body['quantity'],
            'warehouse' => (string)$body['warehouse'],
            'status' => 'pending',
            'priority' => isset($body['priority']) ? (string)$body['priority'] : 'normal',
            'notes' => isset($body['notes']) ? (string)$body['notes'] : '',
            'createdAt' => date('c'),
            'createdBy' => isset($body['createdBy']) ? (string)$body['createdBy'] : 'system'
        ];

        if ($newReorder['quantity'] <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Quantity must be greater than 0']);
            exit;
        }

        $reorders[] = $newReorder;
        write_json($reordersFile, $reorders);

        // Log transaction
        log_transaction('reorder_created', "Reorder request created: {$newReorder['model']} {$newReorder['size']} ({$newReorder['brand']}) - Qty: {$newReorder['quantity']}", $newReorder);

        echo json_encode(['success' => true, 'data' => $newReorder]);
        exit;
    }

    if ($action === 'update_status') {
        $required = ['id', 'status'];
        foreach ($required as $key) {
            if (!isset($body[$key]) || $body[$key] === '') {
                http_response_code(422);
                echo json_encode(['success' => false, 'error' => "Missing field: $key"]);
                exit;
            }
        }

        $validStatuses = ['pending', 'approved', 'ordered', 'received', 'cancelled'];
        if (!in_array($body['status'], $validStatuses)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'error' => 'Invalid status']);
            exit;
        }

        $reorderIndex = -1;
        foreach ($reorders as $index => $reorder) {
            if ($reorder['id'] === $body['id']) {
                $reorderIndex = $index;
                break;
            }
        }

        if ($reorderIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Reorder not found']);
            exit;
        }

        $oldStatus = $reorders[$reorderIndex]['status'];
        $reorders[$reorderIndex]['status'] = (string)$body['status'];
        $reorders[$reorderIndex]['updatedAt'] = date('c');
        if (isset($body['notes'])) {
            $reorders[$reorderIndex]['notes'] = (string)$body['notes'];
        }

        write_json($reordersFile, $reorders);

        // Log transaction
        log_transaction('reorder_status_updated', "Reorder status updated: {$reorders[$reorderIndex]['model']} {$reorders[$reorderIndex]['size']} - {$oldStatus} → {$body['status']}", $reorders[$reorderIndex]);

        echo json_encode(['success' => true, 'data' => $reorders[$reorderIndex]]);
        exit;
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
    exit;
}


