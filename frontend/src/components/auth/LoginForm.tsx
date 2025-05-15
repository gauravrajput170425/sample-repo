import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState } = useAuth();
  const navigate = useNavigate();

  // Redirect to home page after successful login
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/');
    }
  }, [authState.isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(usernameOrEmail, password);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-gray-800">Login</h1>
      
      {authState.error && (
        <div className="w-full p-3 text-sm text-red-600 bg-red-100 rounded-md">
          {authState.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Username or Email
          </label>
          <input
            id="usernameOrEmail"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your username or email"
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
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={authState.isLoading}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-70"
        >
          {authState.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginForm; 