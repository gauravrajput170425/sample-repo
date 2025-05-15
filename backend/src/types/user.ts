export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: string;
}

export interface UserWithoutPassword {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserWithoutPassword;
} 