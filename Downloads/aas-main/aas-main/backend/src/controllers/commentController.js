const pool = require('../config/database');

exports.getCommentsByReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const [comments] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.reportId = ?
            ORDER BY c.createdAt ASC
        `, [reportId]);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { reportId } = req.params;
        if (!content) return res.status(400).json({ message: 'Content is required' });
        const [result] = await pool.query(
            'INSERT INTO comments (content, userId, reportId) VALUES (?, ?, ?)',
            [content, req.user.id, reportId]
        );
        const [newComment] = await pool.query(`
            SELECT c.*, u.name as user_name 
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.id = ?
        `, [result.insertId]);
        res.status(201).json(newComment[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const [comment] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
        if (comment.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment[0].userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await pool.query('DELETE FROM comments WHERE id = ?', [id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};