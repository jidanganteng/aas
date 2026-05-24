const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }
        const [users] = await pool.query('SELECT id, name, email, role, createdAt FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.id != id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const [users] = await pool.query('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { name, email, password, role = 'USER' } = req.body;
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.id != id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        let query = 'UPDATE users SET name = ?, email = ?';
        const params = [name, email];
        if (role && req.user.role === 'SUPER_ADMIN') {
            query += ', role = ?';
            params.push(role);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }
        query += ' WHERE id = ?';
        params.push(id);
        await pool.query(query, params);
        const [updated] = await pool.query('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [id]);
        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Forbidden: only super admin can delete users' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};