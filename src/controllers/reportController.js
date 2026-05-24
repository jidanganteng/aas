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
        res.status(500).json({
            error: error.message
        });
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
            return res.status(404).json({
                message: 'Report not found'
            });
        }

        const [comments] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.reportId = ?
            ORDER BY c.createdAt ASC
        `, [id]);

        const report = reports[0];

        // Parse images JSON
        try {
            report.images = report.images
                ? JSON.parse(report.images)
                : [];
        } catch {
            report.images = [];
        }

        report.comments = comments;

        res.json(report);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

exports.createReport = async (req, res) => {
    try {
        const { title, description, categoryId } = req.body;
        const userId = req.user.id;

        let imagePaths = [];

        // Multiple upload
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => file.path);
        }

        const [result] = await pool.query(
            `
            INSERT INTO reports
            (
                title,
                description,
                categoryId,
                userId,
                images,
                status,
                createdAt,
                updatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `,
            [
                title,
                description,
                categoryId,
                userId,
                JSON.stringify(imagePaths),
                'PENDING'
            ]
        );

        const [newReport] = await pool.query(
            'SELECT * FROM reports WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: newReport[0]
        });

    } catch (error) {
        console.error('❌ createReport error:', error);

        res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, categoryId, status } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM reports WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: 'Report not found'
            });
        }

        const report = existing[0];

        if (
            req.user.role === 'USER' &&
            report.userId !== req.user.id
        ) {
            return res.status(403).json({
                message: 'Forbidden'
            });
        }

        let images = [];

        try {
            images = report.images
                ? JSON.parse(report.images)
                : [];
        } catch {
            images = [];
        }

        // Tambah gambar baru
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            images = [...images, ...newImages];
        }

        await pool.query(
            `
            UPDATE reports
            SET
                title = ?,
                description = ?,
                categoryId = ?,
                status = ?,
                images = ?,
                updatedAt = NOW()
            WHERE id = ?
            `,
            [
                title || report.title,
                description || report.description,
                categoryId || report.categoryId,
                status || report.status,
                JSON.stringify(images),
                id
            ]
        );

        const [updated] = await pool.query(
            'SELECT * FROM reports WHERE id = ?',
            [id]
        );

        res.json(updated[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            'SELECT * FROM reports WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: 'Report not found'
            });
        }

        const report = existing[0];

        if (
            req.user.role !== 'SUPER_ADMIN' &&
            report.userId !== req.user.id
        ) {
            return res.status(403).json({
                message: 'Forbidden'
            });
        }

        // Hapus semua gambar
        try {
            const images = report.images
                ? JSON.parse(report.images)
                : [];

            images.forEach(img => {
                if (fs.existsSync(img)) {
                    fs.unlinkSync(img);
                }
            });

        } catch (err) {
            console.error('Delete image error:', err);
        }

        await pool.query(
            'DELETE FROM reports WHERE id = ?',
            [id]
        );

        res.json({
            message: 'Report deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
};

// ✅ PERBAIKAN: updateReportStatus dengan mapping lowercase → uppercase
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        let { status } = req.body;

        // Mapping dari lowercase (frontend) ke uppercase (ENUM database)
        const statusMap = {
            'pending':   'PENDING',
            'processed': 'PROCESSED',
            'completed': 'COMPLETED',
            'rejected':  'REJECTED',
            // support jika sudah uppercase
            'PENDING':   'PENDING',
            'PROCESSED': 'PROCESSED',
            'COMPLETED': 'COMPLETED',
            'REJECTED':  'REJECTED'
        };

        const mappedStatus = statusMap[status];
        if (!mappedStatus) {
            return res.status(400).json({ message: 'Status tidak valid' });
        }

        // Pastikan laporan ada
        const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Update status
        await pool.query(
            'UPDATE reports SET status = ?, updatedAt = NOW() WHERE id = ?',
            [mappedStatus, id]
        );

        res.json({ success: true, message: 'Status berhasil diupdate', status: mappedStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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

        const result = rows[0] || {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        res.json({
            pending: Number(result.pending) || 0,
            approved: Number(result.approved) || 0,
            rejected: Number(result.rejected) || 0
        });

    } catch (error) {
        console.error('❌ getStatusCount error:', error);

        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};