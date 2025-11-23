#!/bin/bash

# Restore Data Script
# Restores data from a backup file

echo "========================================="
echo "Data Restore Script"
echo "========================================="
echo ""

# Check for backup file argument
if [ -z "$1" ]; then
    echo "Usage: ./restore-data.sh <backup-file.tar.gz>"
    echo ""
    echo "Available backups:"
    if [ -d "backups" ]; then
        ls -lh backups/*.tar.gz 2>/dev/null || echo "No backups found"
    else
        echo "No backups directory found"
    fi
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Backup current data (if exists)
if [ -d "data" ]; then
    echo "📦 Backing up current data..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mv data "data-old-$TIMESTAMP"
fi

# Restore from backup
echo "📥 Restoring data from backup..."
tar -xzf "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Data restored successfully!"
    echo ""
    echo "To verify, check: ls -la data/"
else
    echo "❌ Restore failed!"
    if [ -d "data-old-$TIMESTAMP" ]; then
        echo "Restoring previous data..."
        mv "data-old-$TIMESTAMP" data
    fi
    exit 1
fi

