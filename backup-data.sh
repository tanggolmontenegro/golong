#!/bin/bash

# Backup Data Script
# Creates a timestamped backup of your data folder

echo "========================================="
echo "Data Backup Script"
echo "========================================="
echo ""

# Check if data directory exists
if [ ! -d "data" ]; then
    echo "❌ Data directory not found!"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Create timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/data-backup-$TIMESTAMP.tar.gz"

# Create backup
echo "📦 Creating backup..."
tar -czf "$BACKUP_FILE" data/

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   Location: $BACKUP_FILE"
    echo "   Size: $BACKUP_SIZE"
    echo ""
    echo "To restore:"
    echo "   tar -xzf $BACKUP_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi

