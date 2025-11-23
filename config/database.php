<?php
/**
 * Database Configuration
 * 
 * This file provides database connection functionality.
 * Currently uses JSON file storage, but can be easily switched to MySQL/PostgreSQL
 */

// Database configuration (for future MySQL/PostgreSQL implementation)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'tire_inventory');
define('DB_CHARSET', 'utf8mb4');

// Storage mode: 'json' or 'database'
define('STORAGE_MODE', 'json');

/**
 * Get database connection (for MySQL/PostgreSQL)
 */
function getDBConnection() {
    if (STORAGE_MODE === 'database') {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            return new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }
    return null;
}

/**
 * Get data directory for JSON storage
 */
function getDataDir() {
    $rootDir = __DIR__ . '/..';
    $dataDir = $rootDir . DIRECTORY_SEPARATOR . 'data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0777, true);
    }
    return $dataDir;
}

/**
 * Read JSON file
 */
function read_json($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $content = file_get_contents($filePath);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Write JSON file (atomic write)
 */
function write_json($filePath, $data) {
    $tmpFile = $filePath . '.tmp';
    $result = file_put_contents($tmpFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    if ($result === false) {
        throw new Exception("Failed to write JSON file");
    }
    if (!rename($tmpFile, $filePath)) {
        throw new Exception("Failed to rename temporary file");
    }
    return true;
}

/**
 * Initialize JSON data files
 */
function initializeDataFiles() {
    $dataDir = getDataDir();
    
    $files = [
        'inventory.json' => [],
        'deliveries.json' => [],
        'transactions.json' => [],
        'suppliers.json' => [
            ['id' => '1', 'name' => 'Bridgestone Philippines', 'contact' => '+63 917 111 1111'],
            ['id' => '2', 'name' => 'Michelin Philippines', 'contact' => '+63 917 222 2222'],
            ['id' => '3', 'name' => 'Goodyear Philippines', 'contact' => '+63 917 333 3333']
        ],
        'warehouses.json' => [
            [
                'id' => 'main',
                'name' => 'Main Warehouse',
                'address' => 'Indang, Cavite, Philippines',
                'manager' => 'Juan Santos',
                'contact' => '+63 917 123 4567',
                'capacity' => 2000,
                'status' => 'active'
            ],
            [
                'id' => 'branch1',
                'name' => 'Branch 1 Warehouse',
                'address' => 'Tagaytay City, Cavite, Philippines',
                'manager' => 'Maria Cruz',
                'contact' => '+63 917 234 5678',
                'capacity' => 800,
                'status' => 'active'
            ],
            [
                'id' => 'branch2',
                'name' => 'Branch 2 Warehouse',
                'address' => 'Dasmarinas City, Cavite, Philippines',
                'manager' => 'Pedro Reyes',
                'contact' => '+63 917 345 6789',
                'capacity' => 1200,
                'status' => 'active'
            ]
        ]
    ];
    
    foreach ($files as $filename => $defaultData) {
        $filePath = $dataDir . DIRECTORY_SEPARATOR . $filename;
        if (!file_exists($filePath)) {
            write_json($filePath, $defaultData);
        }
    }
}

// Initialize data files on include
initializeDataFiles();

