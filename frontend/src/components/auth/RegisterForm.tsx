import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { register, authState } = useAuth();
  const navigate = useNavigate();

  // Redirect to login after successful registration
  useEffect(() => {
    if (authState.isAuthenticated) {
      // If registration succeeded, redirect to login page
      // We log them out first to require explicit login after registration
      navigate('/login');
    }
  }, [authState.isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    await register(username, email, password);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800">Register</h1>
      
      {authState.error && (
        <div className="w-full p-3 text-sm text-red-600 bg-red-100 rounded-md">
          {authState.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Choose a username"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Create a password"
            required
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Confirm your password"
            required
          />
          {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
        </div>
        
        <button
          type="submit"
          disabled={authState.isLoading}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-70"
        >
          {authState.isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
          Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm; 