#!/usr/bin/env node

/**
 * Node.js Server for Tire Inventory Management System
 * This server runs PHP files using php-server package
 */

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;
const PHP_PORT = 8000;

// Check if PHP is available
function checkPHP() {
    return new Promise((resolve, reject) => {
        const phpCheck = spawn('php', ['-v']);
        phpCheck.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                reject(new Error('PHP is not installed or not in PATH'));
            }
        });
        phpCheck.on('error', () => {
            reject(new Error('PHP is not installed or not in PATH'));
        });
    });
}

// Start PHP server
function startPHPServer() {
    const phpServer = spawn('php', ['-S', `localhost:${PHP_PORT}`], {
        cwd: __dirname,
        stdio: 'inherit'
    });

    phpServer.on('error', (err) => {
        console.error('❌ Failed to start PHP server:', err.message);
        console.error('\nPlease install PHP:');
        console.error('  macOS:   brew install php');
        console.error('  Ubuntu:  sudo apt-get install php');
        console.error('  Windows: Download from php.net or use XAMPP');
        process.exit(1);
    });

    phpServer.on('exit', (code) => {
        if (code !== null && code !== 0) {
            console.error(`\n❌ PHP server exited with code ${code}`);
        }
    });

    return phpServer;
}

// Ensure data directory exists
function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('📁 Created data directory');
    }
    
    // Set permissions (Unix-like systems)
    if (process.platform !== 'win32') {
        try {
            fs.chmodSync(dataDir, 0o777);
        } catch (err) {
            // Ignore permission errors
        }
    }
}

// Main function
async function main() {
    console.log('=========================================');
    console.log('Tire Inventory Management System');
    console.log('Node.js Server Wrapper');
    console.log('=========================================\n');

    // Check PHP
    try {
        await checkPHP();
        console.log('✅ PHP is available');
    } catch (err) {
        console.error('❌', err.message);
        console.error('\nPlease install PHP first:');
        console.error('  macOS:   brew install php');
        console.error('  Ubuntu:  sudo apt-get install php');
        console.error('  Windows: Download from php.net or use XAMPP');
        process.exit(1);
    }

    // Ensure data directory
    ensureDataDirectory();
    console.log('✅ Data directory ready\n');

    // Start PHP server
    console.log('🚀 Starting PHP server...\n');
    const phpServer = startPHPServer();

    // Wait a moment for PHP server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('=========================================');
    console.log(`Server running on: http://localhost:${PHP_PORT}`);
    console.log('=========================================\n');
    console.log('Access the application at:');
    console.log(`  • Main Page:      http://localhost:${PHP_PORT}/index.php`);
    console.log(`  • Deliveries:     http://localhost:${PHP_PORT}/deliveries.php`);
    console.log(`  • Transactions:   http://localhost:${PHP_PORT}/transactions.php`);
    console.log(`  • Supply Chain:   http://localhost:${PHP_PORT}/supply-chain.php`);
    console.log('\nPress Ctrl+C to stop the server\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down server...');
        phpServer.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n\n🛑 Shutting down server...');
        phpServer.kill();
        process.exit(0);
    });
}

// Run main function
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

