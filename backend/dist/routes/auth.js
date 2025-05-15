"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService_1 = require("../services/userService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const JWT_SECRET = 'your-secret-key'; // Should match the secret in userService
// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Password validation (at least 6 characters)
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const user = await (0, userService_1.createUser)(username, email, password);
        // Create temporary token for the response
        // This is just to maintain the expected response format
        // The token won't be stored in the frontend
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        // Return in the format expected by the frontend
        res.status(201).json({ token, user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Login user
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        // Validate input
        if (!usernameOrEmail || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const authResult = await (0, userService_1.authenticateUser)(usernameOrEmail, password);
        res.json(authResult);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
exports.default = router;
