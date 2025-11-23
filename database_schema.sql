-- Tire Inventory Management System Database Schema
-- MySQL/PostgreSQL compatible

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS tire_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE tire_inventory;

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(100),
    email VARCHAR(255),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    manager VARCHAR(255),
    contact VARCHAR(100),
    capacity INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deliveries table (pending deliveries from supply chain)
CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(100) PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    size VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    warehouse VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    min_stock INT DEFAULT 5,
    supplier VARCHAR(255),
    delivery_date DATE,
    notes TEXT,
    status ENUM('pending', 'confirmed', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT,
    FOREIGN KEY (warehouse) REFERENCES warehouses(id),
    INDEX idx_status (status),
    INDEX idx_warehouse (warehouse),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table (confirmed items)
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(100) PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    size VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    warehouse VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    min_stock INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse) REFERENCES warehouses(id),
    INDEX idx_warehouse (warehouse),
    INDEX idx_brand (brand),
    INDEX idx_model (model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table (audit log)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(100) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    data JSON,
    user VARCHAR(100) DEFAULT 'system',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user (user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default warehouses
INSERT INTO warehouses (id, name, address, manager, contact, capacity, status) VALUES
('main', 'Main Warehouse', 'Indang, Cavite, Philippines', 'Juan Santos', '+63 917 123 4567', 2000, 'active'),
('branch1', 'Branch 1 Warehouse', 'Tagaytay City, Cavite, Philippines', 'Maria Cruz', '+63 917 234 5678', 800, 'active'),
('branch2', 'Branch 2 Warehouse', 'Dasmarinas City, Cavite, Philippines', 'Pedro Reyes', '+63 917 345 6789', 1200, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert default suppliers
INSERT INTO suppliers (id, name, contact, status) VALUES
(1, 'Bridgestone Philippines', '+63 917 111 1111', 'active'),
(2, 'Michelin Philippines', '+63 917 222 2222', 'active'),
(3, 'Goodyear Philippines', '+63 917 333 3333', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

