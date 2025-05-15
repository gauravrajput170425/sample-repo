import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../types/auth';
import * as authService from '../services/authService';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Create the auth context
const AuthContext = createContext<{
  authState: AuthState;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  authState: defaultAuthState,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getAuthToken();
      if (token) {
        try {
          // In a real app, you would verify the token with the server here
          // For now, we'll just set the auth state with the token
          setAuthState({
            token,
            isAuthenticated: true,
            isLoading: false,
            user: null, // We don't have user info from localStorage, in a real app you'd fetch this
            error: null
          });
        } catch (error) {
          authService.removeAuthToken();
          setAuthState({
            ...defaultAuthState,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          ...defaultAuthState,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.login({ usernameOrEmail, password });
      
      // Store the token in localStorage
      authService.setAuthToken(response.token);
      console.log('Token stored in localStorage after login:', response.token.substring(0, 10) + '...');
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed'
      }));
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await authService.register({ username, email, password });
      
      // For registration, we'll temporarily set isAuthenticated to true to trigger
      // the useEffect in RegisterForm, but we won't store the token 
      // This approach ensures users explicitly log in after registration
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // Reset auth state after a short delay to allow the navigation to occur
      setTimeout(() => {
        logout();
      }, 100);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed'
      }));
    }
  };

  const logout = () => {
    authService.removeAuthToken();
    setAuthState({
      ...defaultAuthState,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 