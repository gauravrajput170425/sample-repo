import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/userService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('Auth middleware triggered');
  console.log('Request headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  if (!authHeader) {
    console.log('No authorization header found');
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  const token = authHeader.split(' ')[1]; // Bearer TOKEN format
  console.log('Token extracted:', token ? token.substring(0, 10) + '...' : 'none');
  
  if (!token) {
    console.log('No token found in authorization header');
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  const user = verifyToken(token);
  if (!user) {
    console.log('Token verification failed');
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  console.log('Token verified successfully for user:', user.username);
  req.user = user;
  next();
}; 