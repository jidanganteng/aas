const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.getAllReports = async (req, res) => {
    try {
        let query = `
            SELECT r.*, u.name as user_name, c.name as category_name 
            FROM reports r
            JOIN users u ON r.userId = u.id
            JOIN categories c ON r.categoryId = c.id
        `;
        const params = [];
        if (req.user.role === 'USER') {
            query += ' WHERE r.userId = ?';
            params.push(req.user.id);
        }
        query += ' ORDER BY r.createdAt DESC';
        const [reports] = await pool.query(query, params);
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [reports] = await pool.query(`
            SELECT r.*, u.name as user_name, c.name as category_name 
            FROM reports r
            JOIN users u ON r.userId = u.id
            JOIN categories c ON r.categoryId = c.id
            WHERE r.id = ?
        `, [id]);
        if (reports.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        const [comments] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.reportId = ?
            ORDER BY c.createdAt ASC
        `, [id]);
        const report = reports[0];
        report.comments = comments;
        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.createReport = async (req, res) => {
    try {
        const { title, description, categoryId } = req.body;
        const image = req.file ? req.file.path : null;
        if (!title || !description || !categoryId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const [result] = await pool.query(
            `INSERT INTO reports (title, description, image, categoryId, userId, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, image, categoryId, req.user.id, 'PENDING']
        );
        const [newReport] = await pool.query('SELECT * FROM reports WHERE id = ?', [result.insertId]);
        res.status(201).json(newReport[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, categoryId, status } = req.body;
        const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        const report = existing[0];
        if (req.user.role === 'USER' && report.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        let image = report.image;
        if (req.file) {
            if (image && fs.existsSync(image)) fs.unlinkSync(image);
            image = req.file.path;
        }
        await pool.query(
            `UPDATE reports SET title = ?, description = ?, categoryId = ?, status = ?, image = ? WHERE id = ?`,
            [title || report.title, description || report.description, categoryId || report.categoryId, status || report.status, image, id]
        );
        const [updated] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        const report = existing[0];
        if (req.user.role !== 'SUPER_ADMIN' && report.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (report.image && fs.existsSync(report.image)) {
            fs.unlinkSync(report.image);
        }
        await pool.query('DELETE FROM reports WHERE id = ?', [id]);
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getStatusCount = async (req, res) => {
    try {
        let query = `
            SELECT 
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
            FROM reports
        `;
        const params = [];
        if (req.user.role === 'USER') {
            query += ' WHERE userId = ?';
            params.push(req.user.id);
        }
        const [rows] = await pool.query(query, params);
        // Pastikan rows[0] ada
        const result = rows[0] || { pending: 0, approved: 0, rejected: 0 };
        res.json({
            pending: Number(result.pending) || 0,
            approved: Number(result.approved) || 0,
            rejected: Number(result.rejected) || 0
        });
    } catch (error) {
        console.error('❌ getStatusCount error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};