import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserWithoutPassword } from '../types/user';
import db from '../db/database';

// JWT secret key (in production, use environment variables)
const JWT_SECRET = 'your-secret-key';

export const createUser = async (username: string, email: string, password: string): Promise<UserWithoutPassword> => {
  // Check if user already exists
  const existingUser = db.getUserByUsernameOrEmail(username) || db.getUserByUsernameOrEmail(email);
  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error('Username already exists');
    }
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser: User = {
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  db.addUser(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const authenticateUser = async (usernameOrEmail: string, password: string): Promise<{ token: string, user: UserWithoutPassword }> => {
  // Find user by username or email
  const user = db.getUserByUsernameOrEmail(usernameOrEmail);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username }, 
    JWT_SECRET, 
    { expiresIn: '8h' }
  );
  
  // Return token and user information without password
  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

export const getUserById = (userId: string): UserWithoutPassword | null => {
  const user = db.getUserById(userId);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const verifyToken = (token: string): { userId: string, username: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, username: string };
  } catch (error) {
    return null;
  }
}; 