import { useState, useEffect } from 'react';
import { TodoStatus } from '../types/todo';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskName: string, status: TodoStatus, priority: string) => void;
  initialTaskName?: string;
  initialStatus?: TodoStatus;
  initialPriority?: string;
}

const TaskDetailsModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialTaskName = '',
  initialStatus = TodoStatus.TODO,
  initialPriority = 'Medium'
}: TaskDetailsModalProps) => {
  const [taskName, setTaskName] = useState(initialTaskName);
  const [status, setStatus] = useState<TodoStatus>(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  
  // Update state when props change
  useEffect(() => {
    if (isOpen) {
      setTaskName(initialTaskName);
      setStatus(initialStatus);
      setPriority(initialPriority);
    }
  }, [isOpen, initialTaskName, initialStatus, initialPriority]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (taskName.trim()) {
      onSave(taskName, status, priority);
      setTaskName('');
      setStatus(TodoStatus.TODO);
      setPriority('Medium');
    }
  };

  // Convert enum value to string for display
  const getStatusText = (statusValue: TodoStatus): string => {
    switch(statusValue) {
      case TodoStatus.TODO:
        return 'To Do';
      case TodoStatus.IN_PROGRESS:
        return 'In Progress';
      case TodoStatus.COMPLETED:
        return 'Completed';
      default:
        return 'To Do';
    }
  };

  // Convert string to enum value
  const getStatusValue = (statusText: string): TodoStatus => {
    switch(statusText) {
      case 'To Do':
        return TodoStatus.TODO;
      case 'In Progress':
        return TodoStatus.IN_PROGRESS;
      case 'Completed':
        return TodoStatus.COMPLETED;
      default:
        return TodoStatus.TODO;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000066] flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg max-w-lg w-full p-6">
        <div className="flex items-center mb-4">
          <div className="text-red-600 mr-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 9h16M4 15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Task Details</h2>
          <button 
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Task Name</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task Name"
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Status</label>
            <div className="relative">
              <select
                value={getStatusText(status)}
                onChange={(e) => setStatus(getStatusValue(e.target.value))}
                className="w-full p-2 border rounded-md appearance-none pr-8"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border rounded-md appearance-none pr-8"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 