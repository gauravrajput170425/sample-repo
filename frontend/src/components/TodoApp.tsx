import { useState } from 'react';
import DeleteConfirmation from './DeleteConfirmation';
import EmptyState from './EmptyState';
import TodoHeader from './TodoHeader';
import TodoLists from './TodoLists';
import AddListForm from './AddListForm';
import type { TodoList } from '../types/todoList';
import { useTodoListContext } from '../hooks/useTodoListContext';
import { TodoStatus } from '../types/todo';

const TodoApp = () => {
  const { list: todoLists, addList, deleteList, addTodo, toggleTodo } = useTodoListContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  

  const handleDeleteList = (listId: string) => {
    setListToDelete(listId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteList = () => {
    if (listToDelete) {
      deleteList(listToDelete);
      setShowDeleteConfirmation(false);
      setListToDelete(null);
    }
  };

  const cancelDeleteList = () => {
    setShowDeleteConfirmation(false);
    setListToDelete(null);
  };

  const handleAddTodo = (listId: string, todoText: string) => {
    addTodo(listId, {
      id: Date.now().toString(),
      text: todoText,
      status: TodoStatus.TODO
    });
  };

  return (
    <div className=" font-[Outfit] text-gray-900">
      <TodoHeader />
      
      <main className="px-4 md:px-8">
        <h2 className="text-[18px] font-bold my-8 text-gray-900 pb-3">Your To Do Lists</h2>
        
        {todoLists.length === 0 ? (
          <EmptyState />
        ) : (
          <TodoLists 
            todoLists={todoLists}
            onDeleteList={handleDeleteList}
            onAddTodo={handleAddTodo}
            onToggleTodo={toggleTodo}
          />
        )}
        
       
      </main>
      
      {showDeleteConfirmation && (
        <DeleteConfirmation 
          onCancel={cancelDeleteList} 
          onConfirm={confirmDeleteList} 
        />
      )}
    </div>
  );
};

export default TodoApp; 