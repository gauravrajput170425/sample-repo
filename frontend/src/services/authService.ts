import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return response.json();
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  // Just return the registration response
  // The user will need to log in explicitly after registration
  return response.json();
};

// Store token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Get auth header
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  if (!token) {
    console.log('No auth token found in localStorage');
    return {};
  }
  // Add debugging to trace the token
  console.log('Using token for auth header:', token.substring(0, 10) + '...');
  return { Authorization: `Bearer ${token}` };
}; 