const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { executeQuery, getConnection } = require('../config/database');
const { auth, managerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all inventory with pagination and filtering
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim(),
    query('warehouse_id').optional().isInt(),
    query('stock_level').optional().isIn(['high', 'medium', 'low'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const warehouseId = req.query.warehouse_id;
        const stockLevel = req.query.stock_level;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push('(tm.model_name LIKE ? OR tb.name LIKE ? OR tm.size LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (warehouseId) {
            whereConditions.push('i.warehouse_id = ?');
            queryParams.push(warehouseId);
        }

        // Stock level filtering
        if (stockLevel) {
            if (stockLevel === 'low') {
                whereConditions.push('i.current_stock <= i.min_stock');
            } else if (stockLevel === 'medium') {
                whereConditions.push('i.current_stock > i.min_stock AND i.current_stock <= i.min_stock * 2');
            } else if (stockLevel === 'high') {
                whereConditions.push('i.current_stock > i.min