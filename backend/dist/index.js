"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const todoLists_1 = __importDefault(require("./routes/todoLists"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const dbInit_1 = require("./db/dbInit");
const socketService_1 = require("./services/socketService");
// Initialize the database with sample data
(0, dbInit_1.initializeDatabase)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'http://localhost:5173', // Vite dev server
            'https://your-firebase-app-id.web.app', // Firebase hosting domain
            'https://your-firebase-app-id.firebaseapp.com', // Alternative Firebase domain
        ],
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
        credentials: true
    }
});
// Middleware
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173', // Vite dev server
        'https://your-firebase-app-id.web.app', // Firebase hosting domain
        'https://your-firebase-app-id.firebaseapp.com', // Alternative Firebase domain
    ],
    credentials: true
}));
app.use(express_1.default.json());
// Initialize Socket.IO handlers
(0, socketService_1.initializeSocketHandlers)(io);
// Make socket.io instance available to our routes
app.set('io', io);
// Public routes
app.use('/api/auth', auth_1.default);
// Protected routes
app.use('/api/lists', auth_2.authenticateToken, todoLists_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
