import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TodoList } from '../types/todoList';
import { TodoStatus } from '../types/todo';


interface TodoListProps {
  list: TodoList;
  onDelete: () => void;
  onAddTodo: (listId: string, todoText: string) => void;
  onToggleTodo: (listId: string, todoId: string) => void;
}

export const TodoListComponent = ({ list, onDelete, onAddTodo, onToggleTodo }: TodoListProps) => {
  const [newTodo, setNewTodo] = useState('');
  
  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    onAddTodo(list.id, newTodo);
    setNewTodo('');
  };

  const completedCount = list.todos.filter(todo => todo.status === TodoStatus.COMPLETED).length;
  const totalCount = list.todos.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const formatDate = (date: Date) => {
    const time = date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const dateStr = date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    return `${time}, ${dateStr}`;
  };

  return (
    <div className="bg-[#00000005] rounded-lg  border border-gray-200 overflow-hidden">
      <Link to={`/list/${list.id}`} className="block">
        <div className="flex p-4  border-gray-200 items-center">
          <div className="w-12 h-12 rounded-full border border-gray-200 flex-shrink-0 relative flex items-center justify-center"
               style={{
                 background: `conic-gradient(#fa5252 0% ${percentage}%, #f8f9fa ${percentage}% 100%)`
               }}>
            <div className="absolute w-10 h-10 rounded-full bg-white"></div>
            <div className="relative z-10 text-primary font-semibold text-sm">{percentage}%</div>
          </div>
          
          <div className="ml-4 flex-1">
            <p className="text-lg font-medium mb-2">{list.name}</p>
            <div className="flex gap-4 text-gray-600 text-xs">
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700">
                  <path d="M10 5V10L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {formatDate(list.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700">
                  <path d="M5 10H15M5 5H15M5 15H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {completedCount}/{totalCount} {totalCount === 1 ? 'task' : 'tasks'} completed
              </div>
            </div>
          </div>

          <button 
          className="p-2 text-gray-600 hover:text-primary-dark"
          onClick={(e)=>{
            e.preventDefault()
            onDelete()
            e.stopPropagation()
          }} 
          aria-label="Delete list"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
          </svg>
        </button>
        </div>
      </Link>
    </div>
  );
};

export default TodoListComponent;