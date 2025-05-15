"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.getUserById = exports.authenticateUser = exports.createUser = void 0;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../db/database"));
// JWT secret key (in production, use environment variables)
const JWT_SECRET = 'your-secret-key';
const createUser = async (username, email, password) => {
    // Check if user already exists
    const existingUser = database_1.default.getUserByUsernameOrEmail(username) || database_1.default.getUserByUsernameOrEmail(email);
    if (existingUser) {
        if (existingUser.username === username) {
            throw new Error('Username already exists');
        }
        throw new Error('Email already exists');
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Create new user
    const newUser = {
        id: (0, uuid_1.v4)(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };
    database_1.default.addUser(newUser);
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};
exports.createUser = createUser;
const authenticateUser = async (usernameOrEmail, password) => {
    // Find user by username or email
    const user = database_1.default.getUserByUsernameOrEmail(usernameOrEmail);
    if (!user) {
        throw new Error('Invalid credentials');
    }
    // Verify password
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    // Return token and user information without password
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};
exports.authenticateUser = authenticateUser;
const getUserById = (userId) => {
    const user = database_1.default.getUserById(userId);
    if (!user)
        return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.getUserById = getUserById;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
