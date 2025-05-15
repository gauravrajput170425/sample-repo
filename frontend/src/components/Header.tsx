import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Todo App
        </Link>
        
        {authState.isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {authState.user?.username || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 