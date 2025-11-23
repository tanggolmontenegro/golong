# Data Transfer Guide - Moving to Another Device

## Current Database System

This application uses **JSON file storage** (not a traditional database). All data is stored in the `data/` directory as JSON files.

## What Needs to Be Transferred

### ✅ MUST Transfer (Your Data)

**The `data/` folder contains all your data:**

```
data/
├── inventory.json      ← Your inventory items
├── deliveries.json     ← Your pending/confirmed deliveries
├── transactions.json   ← Your transaction history
├── suppliers.json      ← Your suppliers list
└── warehouses.json     ← Your warehouses (has defaults)
```

**To transfer your data:**
1. Copy the entire `data/` folder from the source device
2. Paste it into the project on the new device
3. Make sure it's in the same location: `TIRE-main/data/`

### ❌ DON'T Need to Transfer

- `database_schema.sql` - This is only for future MySQL/PostgreSQL setup
- `config/database.php` - Configuration file (auto-creates data files if missing)
- Any other project files (they're the same on all devices)

## Step-by-Step Transfer Process

### Method 1: Manual Copy (Easiest)

1. **On Source Device:**
   - Locate the `data/` folder in your project
   - Copy the entire `data/` folder

2. **Transfer to New Device:**
   - Use USB drive, cloud storage (Google Drive, Dropbox), or email
   - Transfer the `data/` folder

3. **On New Device:**
   - Download/extract the project files
   - Replace the `data/` folder with your transferred one
   - Make sure permissions are set: `chmod -R 777 data/` (Mac/Linux)

### Method 2: Using Git (If Using Version Control)

**If you want to track data in Git:**

1. **Add data to Git** (optional - not recommended for sensitive data):
   ```bash
   git add data/
   git commit -m "Add data files"
   git push
   ```

2. **On new device:**
   ```bash
   git clone <repository>
   git pull
   ```

**⚠️ Warning:** Only do this if data is not sensitive. JSON files may contain business data.

### Method 3: Export/Import Script

I can create a script to export/import data if needed.

## What Happens If You Don't Transfer Data?

If you run the application on a new device **without** the `data/` folder:

- ✅ Application will work
- ✅ Default data will be created:
  - Empty inventory
  - Default suppliers (Bridgestone, Michelin, Goodyear)
  - Default warehouses (Main, Branch 1, Branch 2)
  - Empty transactions
- ❌ **You will lose all your existing data**

## Verification After Transfer

After transferring data to a new device:

1. **Check data files exist:**
   ```bash
   ls -la data/
   ```

2. **Verify file permissions:**
   ```bash
   chmod -R 777 data/
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Test the application:**
   - Go to `http://localhost:8000/index.php`
   - Check if your inventory items appear
   - Check if deliveries are there
   - Verify transactions history

## Data File Locations

**Current System (JSON Files):**
- Location: `TIRE-main/data/*.json`
- Format: JSON (human-readable)
- Can be edited manually (with caution)

**Future System (MySQL/PostgreSQL):**
- If you migrate to database, you'll need to:
  1. Export data from JSON files
  2. Import into database
  3. Transfer database dump file
  4. Import on new device

## Backup Recommendations

### Regular Backups

**Create backups of your data folder regularly:**

```bash
# Create backup
cp -r data/ data-backup-$(date +%Y%m%d)/

# Or compress it
tar -czf data-backup-$(date +%Y%m%d).tar.gz data/
```

### Cloud Backup

Store your `data/` folder in:
- Google Drive
- Dropbox
- OneDrive
- Or any cloud storage

## Quick Transfer Checklist

- [ ] Copy `data/` folder from source device
- [ ] Transfer to new device (USB/Cloud/Email)
- [ ] Place in `TIRE-main/data/` on new device
- [ ] Set permissions: `chmod -R 777 data/`
- [ ] Verify files are there: `ls -la data/`
- [ ] Start server: `npm start`
- [ ] Test application in browser
- [ ] Verify your data appears correctly

## Example Transfer Commands

### Using SCP (Mac/Linux to Mac/Linux):
```bash
scp -r /path/to/TIRE-main/data/ user@newdevice:/path/to/TIRE-main/
```

### Using rsync:
```bash
rsync -avz /path/to/TIRE-main/data/ user@newdevice:/path/to/TIRE-main/data/
```

### Using USB Drive:
1. Copy `data/` folder to USB
2. Plug USB into new device
3. Copy `data/` folder to project directory

## Important Notes

1. **Data is NOT in a database** - it's in JSON files
2. **Each device has its own data** - unless you transfer it
3. **Default data is created** - if `data/` folder is missing
4. **Backup regularly** - JSON files can be corrupted
5. **File permissions matter** - make sure `data/` is writable

## Summary

**To run on another device with your data:**
1. ✅ Copy the `data/` folder
2. ✅ Transfer it to the new device
3. ✅ Place it in the project directory
4. ✅ Set proper permissions
5. ✅ Start the server

**The database (JSON files) is NOT automatically included** - you need to manually transfer the `data/` folder.

