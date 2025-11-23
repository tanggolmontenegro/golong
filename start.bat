@echo off
REM Tire Inventory Management System - Quick Start Script (Windows)

echo =========================================
echo Tire Inventory Management System
echo =========================================
echo.

REM Check if PHP is installed
where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PHP is not installed!
    echo.
    echo Please install PHP first:
    echo   1. Download from https://www.php.net/downloads.php
    echo   2. Or install XAMPP from https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)

REM Display PHP version
echo [OK] PHP found:
php -v
echo.

REM Check if data directory exists
if not exist "data" (
    echo [INFO] Creating data directory...
    mkdir data
)

echo [OK] Data directory ready
echo.

REM Get current directory
echo [INFO] Project directory: %CD%
echo.

REM Start PHP server
echo =========================================
echo Server starting on: http://localhost:8000
echo =========================================
echo.
echo Access the application at:
echo   Main Page:      http://localhost:8000/index.php
echo   Deliveries:     http://localhost:8000/deliveries.php
echo   Transactions:   http://localhost:8000/transactions.php
echo   Supply Chain:   http://localhost:8000/supply-chain.php
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
php -S localhost:8000

