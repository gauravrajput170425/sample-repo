import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TodoHeader from './TodoHeader';
import TaskDetailsModal from './TaskDetailsModal';
import DeleteTaskModal from './DeleteTaskModal';
import ShareListModal from './ShareListModal';
import TodoItem from './TodoItem';
import type { TodoList } from '../types/todoList';
import { TodoStatus, TodoPriority } from '../types/todo';
import type { Todo } from '../types/todo';
import * as todoListService from '../services/todoListService';
import { useAuth } from '../contexts/AuthContext';
import { useSocketEvents } from '../hooks/useSocketEvents';

const TodoListDetail = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [currentList, setCurrentList] = useState<TodoList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [listNameInput, setListNameInput] = useState('');
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{ id: string, text: string } | null>(null);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const listNameInputRef = useRef<HTMLInputElement>(null);

  // Set up socket events specifically for this list
  useSocketEvents({
    listId,
    screenType: 'detail',
    onTodoAdded: (data) => {
      if (data.listId === listId) {
        // Refresh the list when a todo is added
        refreshListDetails();
      }
    },
    onTodoToggled: (data) => {
      if (data.listId === listId) {
        // Refresh the list when a todo is toggled
        refreshListDetails();
      }
    },
    onListDeleted: (data) => {
      if (data.listId === listId) {
        // Navigate away if this list is deleted
        navigate('/');
      }
    }
  });

  // Function to refresh list details
  const refreshListDetails = async () => {
    if (!listId || !authState.isAuthenticated) return;
    
    try {
      const list = await todoListService.fetchTodoList(listId);
      setCurrentList(list);
      setListNameInput(list.name);
    } catch (err: any) {
      console.error("Error refreshing list details:", err);
      if (err.message.includes("404") || err.message.includes("not found")) {
        navigate('/');
      }
    }
  };

  // Fetch the list details from the API
  useEffect(() => {
    if (!listId || !authState.isAuthenticated) return;

    const fetchListDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const list = await todoListService.fetchTodoList(listId);
        console.log("Fetched list details:", list);
        setCurrentList(list);
        setListNameInput(list.name);
      } catch (err: any) {
        console.error("Error fetching list details:", err);
        setError(err.message || "Failed to load the todo list");
        if (err.message.includes("404") || err.message.includes("not found")) {
          // Handle not found
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListDetails();
  }, [listId, authState.isAuthenticated, navigate]);

  useEffect(() => {
    if (isEditingListName && listNameInputRef.current) {
      listNameInputRef.current.focus();
    }
  }, [isEditingListName]);

  const handleAddTask = async (taskName: string, status: TodoStatus, priority: TodoPriority) => {
    if (listId && taskName.trim()) {
      try {
        // Use the service directly to add the todo and get fresh data
        await todoListService.createTodo(listId, taskName, priority, status);
        
        // Refresh the list to get the updated todos
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setIsTaskModalOpen(false);
      } catch (err: any) {
        console.error("Error adding task:", err);
        // Could add error handling UI here
      }
    }
  };

  const handleUpdateTask = async (taskName: string, status: TodoStatus, priority: TodoPriority) => {
    if (listId && todoToEdit && taskName.trim()) {
      try {
        // Update the todo text and priority
        await todoListService.updateTodo(listId, todoToEdit.id, { 
          title: taskName,
          priority: priority
        });
        
        // Toggle the status if it changed
        if (todoToEdit.status !== status) {
          await todoListService.toggleTodo(listId, todoToEdit.id);
        }
        
        // Refresh the list
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setTodoToEdit(null);
      } catch (err: any) {
        console.error("Error updating task:", err);
      }
    }
  };

  const handleToggleTask = async (todoId: string) => {
    if (listId) {
      try {
        await todoListService.toggleTodo(listId, todoId);
        
        // Refresh the list
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
      } catch (err: any) {
        console.error("Error toggling task:", err);
      }
    }
  };

  const handleEditListName = async () => {
    if (listId && listNameInput.trim()) {
      try {
        await todoListService.updateTodoList(listId, listNameInput);
        
        // Refresh the list
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setIsEditingListName(false);
      } catch (err: any) {
        console.error("Error updating list name:", err);
      }
    }
  };

  const handleEditListNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditListName();
    } else if (e.key === 'Escape') {
      if (currentList) {
        setListNameInput(currentList.name);
      }
      setIsEditingListName(false);
    }
  };

  const handleEditTodo = async (todoId: string, text: string) => {
    if (listId && text.trim()) {
      try {
        await todoListService.updateTodo(listId, todoId, { title: text });
        
        // Refresh the list
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setEditingTodo(null);
      } catch (err: any) {
        console.error("Error editing todo:", err);
      }
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (listId) {
      try {
        await todoListService.deleteTodo(listId, todoId);
        
        // Refresh the list
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setIsDeleteTaskModalOpen(false);
        setTodoToDelete(null);
      } catch (err: any) {
        console.error("Error deleting todo:", err);
      }
    }
  };

  const handleShareList = async (email: string, permission: 'edit' | 'view') => {
    if (listId) {
      try {
        // Convert permission from 'edit'/'view' to 'write'/'read' for the API
        const apiPermission = permission === 'edit' ? 'write' : 'read';
        
        await todoListService.shareTodoList(listId, email, apiPermission);
        
        // Refresh the list to get updated sharing information
        const updatedList = await todoListService.fetchTodoList(listId);
        setCurrentList(updatedList);
        
        setIsShareModalOpen(false);
      } catch (err: any) {
        console.error("Error sharing list:", err);
        // Could add error handling UI here
      }
    }
  };

  const openTaskDetailsModal = (todo: Todo) => {
    setTodoToEdit(todo);
  };

  const openDeleteModal = (todoId: string) => {
    setTodoToDelete(todoId);
    setIsDeleteTaskModalOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="font-sans text-gray-900">
        <TodoHeader />
        <main className="px-4 md:px-8 mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="font-sans text-gray-900">
        <TodoHeader />
        <main className="px-4 md:px-8 mx-auto max-w-6xl">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Error loading list</h2>
            <p className="mb-4">{error}</p>
            <Link to="/" className="text-red-600 hover:text-red-800">← Back to lists</Link>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!currentList) {
    return (
      <div className="font-sans text-gray-900">
        <TodoHeader />
        <main className="px-4 md:px-8 mx-auto max-w-6xl">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">List not found</h2>
            <Link to="/" className="text-red-600 hover:text-red-800">← Back to lists</Link>
          </div>
        </main>
      </div>
    );
  }

  const completedCount = currentList.todos.filter(todo => todo.status === TodoStatus.COMPLETED).length;
  const totalCount = currentList.todos.length;

  return (
    <div className="font-sans text-gray-900">
      <TodoHeader />
      
      <main className="px-4 md:px-8 mx-auto max-w-6xl">
        <div className="flex items-center my-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-auto">
            ← Back
          </Link>
          <div className="ml-auto text-gray-500">
            {currentList.isShared ? 
              `Shared with you (${currentList.permission === 'read' ? 'View only' : 'Can edit'})` : 
              currentList.isOwner ? 'You are the owner' : 'Not shared'}
          </div>
          {currentList.isOwner && (
            <button 
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => setIsShareModalOpen(true)}
            >
              Share
            </button>
          )}
        </div>
        
        <div className=" pb-4 mb-6">
          <div className="flex items-center w-full">
            {isEditingListName ? (
              <div className="flex items-center w-full">
                <input
                  ref={listNameInputRef}
                  type="text"
                  value={listNameInput}
                  onChange={(e) => setListNameInput(e.target.value)}
                  onBlur={handleEditListName}
                  onKeyDown={handleEditListNameKeyDown}
                  className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:border-red-500 focus:outline-none w-full"
                  autoComplete="off"
                />
              </div>
            ) : (
              <h1 
                className={`text-2xl font-bold text-gray-900 ${
                  !(currentList.isShared && currentList.permission === 'read') ? 
                  'cursor-pointer hover:text-red-600 transition-colors duration-200' : 
                  ''
                }`}
                onClick={() => {
                  if (!(currentList.isShared && currentList.permission === 'read')) {
                    setListNameInput(currentList.name);
                    setIsEditingListName(true);
                  }
                }}
              >
                {currentList.name}
              </h1>
            )}
          </div>
          <div className="flex items-center mt-2 text-gray-500">
            <span className="flex items-center mr-4">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              {new Date(currentList.createdAt).toLocaleString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {completedCount}/{totalCount} tasks completed
            </span>
          </div>
        </div>
        
        <div className="hidden md:grid md:grid-cols-6 gap-0 text-sm border-b border-[#0000000D] font-medium text-gray-500">
          <div className="whitespace-nowrap px-4 py-2 border-r border-l border-[#0000000D]">Type</div>
          <div className="whitespace-nowrap px-4 py-2 border-r border-[#0000000D]">Task Name</div>
          <div className="whitespace-nowrap px-4 py-2 border-r border-[#0000000D]">Status</div>
          <div className="whitespace-nowrap px-4 py-2 border-r border-[#0000000D]">Created on</div>
          <div className="whitespace-nowrap px-4 py-2 border-r border-[#0000000D]">Priority</div>
          <div className="whitespace-nowrap px-4 py-2 border-r border-[#0000000D]">Actions</div>
        </div>
        
        <div className="flex flex-col space-y-4 md:space-y-0">
          {currentList.todos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onToggle={handleToggleTask}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              editingTodo={editingTodo}
              setEditingTodo={setEditingTodo}
              openTaskDetailsModal={openTaskDetailsModal}
              openDeleteModal={openDeleteModal}
              className="mb-4 md:mb-0 p-3 md:p-0 bg-white rounded-lg shadow-sm md:shadow-none md:rounded-none md:bg-transparent"
              readOnly={currentList.isShared && currentList.permission === 'read'}
            />
          ))}
        </div>
        
        <button 
          onClick={() => setIsTaskModalOpen(true)} 
          className={`mt-6 w-full md:w-auto text-center md:text-left py-3 md:py-0 ${
            currentList.isShared && currentList.permission === 'read' 
              ? 'bg-gray-400 md:text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 md:bg-transparent text-white md:text-red-600 hover:bg-red-700 md:hover:bg-transparent md:hover:text-red-800'
          } font-medium flex justify-center md:justify-start items-center rounded-lg md:rounded-none shadow-sm md:shadow-none`}
          disabled={currentList.isShared && currentList.permission === 'read'}
        >
          + Add Task
        </button>
        
        <TaskDetailsModal 
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleAddTask}
        />
        
        <TaskDetailsModal 
          isOpen={!!todoToEdit}
          onClose={() => setTodoToEdit(null)}
          onSave={handleUpdateTask}
          initialTaskName={todoToEdit?.text || ''}
          initialStatus={todoToEdit?.status || TodoStatus.TODO}
          initialPriority={(todoToEdit as any)?.priority || 'Medium'}
        />
        
        <DeleteTaskModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => {
            setIsDeleteTaskModalOpen(false);
            setTodoToDelete(null);
          }}
          onConfirm={() => todoToDelete && handleDeleteTodo(todoToDelete)}
        />

        <ShareListModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShareList}
        />
      </main>
    </div>
  );
};

export default TodoListDetail; 