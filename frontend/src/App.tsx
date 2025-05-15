import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TodoApp from './components/TodoApp';
import { TodoListProvider } from './contexts/TodoListProvider';
import TodoListDetail from './components/TodoListDetail';
import { DragAndDropProvider } from './contexts/DndProvider';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen ">
      {/* Tailwind test element */}
     
      
      <AuthProvider>
        <BrowserRouter>
          <TodoListProvider>
            <DragAndDropProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/"
                    element={
                      <>
                        <Header />
                        <TodoApp />
                      </>
                    }
                  />
                  <Route
                    path="/list/:listId"
                    element={
                      <>
                        <Header />
                        <TodoListDetail />
                      </>
                    }
                  />
                </Route>
              </Routes>
            </DragAndDropProvider>
          </TodoListProvider>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
