const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        email = email.toLowerCase().trim();
        password = password.trim();
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'USER']
        );
        const token = jwt.sign(
            { id: result.insertId, email, role: 'USER' },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '1d' }
        );
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, name, email, role: 'USER' }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        password = password.trim();

        // HARDCODE SEMENTARA (HAPUS NANTI)
        if (email === 'admin@example.com' && password === 'rahasia123') {
            const token = jwt.sign(
                { id: 1, email: 'admin@example.com', role: 'ADMIN' },
                process.env.JWT_SECRET || 'supersecret',
                { expiresIn: '1d' }
            );
            return res.json({
                message: 'Login successful',
                token,
                user: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'ADMIN' }
            });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '1d' }
        );
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        const [users] = await pool.query('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: users[0] });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};