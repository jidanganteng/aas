const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const isBrowserRequest = req.headers.accept && req.headers.accept.includes('text/html');

    // Fungsi untuk handle unauthorized (redirect atau JSON)
    const unauthorized = (message) => {
        if (isBrowserRequest) {
            // Redirect ke halaman login (sesuaikan path login kamu)
            return res.redirect('/auth/login');
        } else {
            return res.status(401).json({ message });
        }
    };

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return unauthorized('Unauthorized: No token');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = decoded;
        next();
    } catch (error) {
        return unauthorized('Invalid token');
    }
};