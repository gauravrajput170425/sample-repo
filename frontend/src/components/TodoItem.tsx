import type { Dispatch, SetStateAction } from 'react';
import type { Todo } from '../types/todo';
import { TodoStatus } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todoId: string) => void;
  onEdit: (todoId: string, text: string) => void;
  onDelete: (todoId: string) => void;
  editingTodo: { id: string, text: string } | null;
  setEditingTodo: Dispatch<SetStateAction<{ id: string, text: string } | null>>;
  openTaskDetailsModal: (todo: Todo) => void;
  openDeleteModal: (todoId: string) => void;
  className?: string;
  readOnly?: boolean;
}

const TodoItem = ({ 
  todo, 
  onToggle, 
  onEdit, 
  onDelete, 
  editingTodo, 
  setEditingTodo,
  openTaskDetailsModal,
  openDeleteModal,
  className = '',
  readOnly = false
}: TodoItemProps) => {
  const isEditing = editingTodo?.id === todo.id;

  const handleEditClick = () => {
    if (!readOnly) {
      openTaskDetailsModal(todo);
    }
  };

  const handleSaveEdit = () => {
    if (editingTodo && !readOnly) {
      onEdit(todo.id, editingTodo.text);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTodo) {
      setEditingTodo({ ...editingTodo, text: e.target.value });
    }
  };

  // Helper function to get status text and color
  const getStatusInfo = (status: TodoStatus) => {
    switch(status) {
      case TodoStatus.TODO:
        return { 
          text: 'To Do',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case TodoStatus.IN_PROGRESS:
        return { 
          text: 'In Progress',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case TodoStatus.COMPLETED:
        return { 
          text: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      default:
        return { 
          text: 'To Do',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
    }
  };

  // Get formatted date - compact for mobile, fuller for desktop
  const getFormattedDate = () => {
    const date = new Date();
    
    // Short format for mobile (MM/DD/YY HH:MM)
    const mobileFormat = date.toLocaleString(undefined, {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // Fuller format for desktop
    const desktopFormat = date.toLocaleString(undefined, {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return { mobileFormat, desktopFormat };
  };

  const isCompleted = todo.status === TodoStatus.COMPLETED;
  const statusInfo = getStatusInfo(todo.status);
  const { mobileFormat, desktopFormat } = getFormattedDate();

  return (
    <div className={`md:grid md:grid-cols-6 gap-0 border-b border-[#0000000D] text-sm ${className}`}>
      <div className="md:whitespace-nowrap md:px-4 py-2 md:border-r md:border-l border-[#0000000D] flex md:block items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => !readOnly && onToggle(todo.id)}
            disabled={readOnly}
            className="sr-only"
          />
          <span className={`w-5 h-5 inline-block rounded-full border ${
            isCompleted 
              ? 'bg-red-600 border-red-600' 
              : readOnly ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-300'
          }`}>
            {isCompleted && (
              <span className="flex items-center justify-center h-full">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </span>
        </label>
      </div>
      <div className="md:whitespace-nowrap px-4 py-2 md:border-r border-[#0000000D] font-medium flex flex-col md:block">
        <div className="md:hidden text-xs text-gray-500 mb-1">Task Name:</div>
        {isEditing ? (
          <input 
            type="text" 
            value={editingTodo?.text} 
            onChange={handleTextChange}
            className="w-full p-1 border border-gray-300 rounded"
            autoFocus
            readOnly={readOnly}
          />
        ) : (
          <div className="truncate max-w-full overflow-hidden text-ellipsis">
            {todo.text}
          </div>
        )}
      </div>
      <div className="md:whitespace-nowrap px-4 py-2 md:border-r border-[#0000000D] flex flex-col md:block overflow-hidden">
        <div className="md:hidden text-xs text-gray-500 mb-1">Status:</div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap inline-block ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      </div>
      <div className="md:whitespace-nowrap px-4 py-2 md:border-r border-[#0000000D] text-gray-500 flex flex-col md:block md:truncate overflow-hidden">
        <div className="md:hidden text-xs text-gray-500 mb-1">Created on:</div>
        <span className="md:hidden">{mobileFormat}</span>
        <span className="hidden md:inline md:truncate overflow-hidden">{desktopFormat}</span>
      </div>
      <div className="md:whitespace-nowrap px-4 py-2 md:border-r border-[#0000000D] flex flex-col md:flex md:items-center">
        <div className="md:hidden text-xs text-gray-500 mb-1">Priority:</div>
        <div className="flex items-center">
          <span className="mr-2">
            {/* Priority icon based on assigned priority (for demonstration) */}
            {Math.random() > 0.5 ? (
              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 10H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          {Math.random() > 0.5 ? 'High' : 'Medium'}
        </div>
      </div>
      <div className="md:whitespace-nowrap px-4 py-2 md:border-r border-[#0000000D] md:flex md:items-center space-x-2">
        <div className="md:hidden text-xs text-gray-500 mb-1">Actions:</div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveEdit}
                className={`text-blue-600 hover:text-blue-800 p-1 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Save"
                disabled={readOnly}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor" />
                </svg>
              </button>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="Cancel"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {!readOnly && (
                <>
                  <button 
                    onClick={handleEditClick}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => openDeleteModal(todo.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                    </svg>
                  </button>
                </>
              )}
              
              {readOnly && (
                <span className="text-gray-400 italic text-xs">View only</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoItem; 