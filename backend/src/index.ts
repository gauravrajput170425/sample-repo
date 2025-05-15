import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import todoListsRouter from './routes/todoLists';
import authRouter from './routes/auth';
import { authenticateToken, AuthRequest } from './middleware/auth';
import { initializeDatabase } from './db/dbInit';
import { initializeSocketHandlers } from './services/socketService';

// Initialize the database with sample data
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',  // Vite dev server
      'https://your-firebase-app-id.web.app',  // Firebase hosting domain
      'https://your-firebase-app-id.firebaseapp.com',  // Alternative Firebase domain
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'https://your-firebase-app-id.web.app',  // Firebase hosting domain
    'https://your-firebase-app-id.firebaseapp.com',  // Alternative Firebase domain
  ],
  credentials: true
}));
app.use(express.json());

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Make socket.io instance available to our routes
app.set('io', io);

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/lists', authenticateToken, todoListsRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 