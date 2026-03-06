const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_key_2026';

const ADMIN_USER = {
    username: 'admin',
    passwordHash: '$2a$12$ByRyfy2kk3gRsX4I3wXHS.5pGnlOEhA8hWsmVwAilgA.PedtfHcH.'
};

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    if (username !== ADMIN_USER.username) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (!valid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.json({ token, username, role: 'admin' });
}));

router.get('/verify', require('../middleware/auth'), (req, res) => {
    res.json({ valid: true, user: req.user });
});

module.exports = router;
