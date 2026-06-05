const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// IMPORT ROUTES
// =======================
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const userRoutes = require('./src/routes/userRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const profileRoutes = require('./src/routes/profileRoutes'); // ← perbaiki path

// =======================
// MIDDLEWARE
// =======================

// CORS
app.use(cors({
    origin: 'http://localhost:3000', // frontend next js
    credentials: true
}));

// membaca json
app.use(express.json());

// folder uploads (pastikan folder uploads ada di root)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// logger request
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.path}`);
    next();
});

// =======================
// ROUTES
// =======================

app.get('/', (req, res) => {
    res.send('Backend Pengaduan Masyarakat is running');
});

app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);

// =======================
// ERROR HANDLER
// =======================

app.use((err, req, res, next) => {
    console.error('🔥 ERROR:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// =======================
// SERVER
// =======================

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});