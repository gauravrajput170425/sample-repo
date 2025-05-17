import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/userService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  const token = authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  const user = verifyToken(token);
  if (!user) {
    console.log('Token verification failed');
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
}; 