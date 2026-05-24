const pool = require('../config/database');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name required' });
        const [existing] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
        if (existing.length) return res.status(400).json({ message: 'Category already exists' });
        const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name required' });
        await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        res.json({ id, name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { id } = req.params;
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};