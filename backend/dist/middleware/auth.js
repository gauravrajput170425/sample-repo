"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const userService_1 = require("../services/userService");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing authentication token' });
    }
    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    if (!token) {
        return res.status(401).json({ error: 'Missing authentication token' });
    }
    const user = (0, userService_1.verifyToken)(token);
    if (!user) {
        console.log('Token verification failed');
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
};
exports.authenticateToken = authenticateToken;
