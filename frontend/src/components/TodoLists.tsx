import { useState } from 'react';
import type { TodoList } from '../types/todoList';
import { useTodoListContext } from '../hooks/useTodoListContext';
import AddListForm from './AddListForm';
import DraggableTodoList from './DraggableTodoList';

interface TodoListsProps {
  todoLists: TodoList[];
  onDeleteList: (listId: string) => void;
  onAddTodo: (listId: string, todoText: string) => void;
  onToggleTodo: (listId: string, todoId: string) => void;
}

const TodoLists = ({ 
  todoLists, 
  onDeleteList, 
  onAddTodo, 
  onToggleTodo, 
}: TodoListsProps) => {

  const { addList, moveTodoList } = useTodoListContext();
  const [showAddListForm, setShowAddListForm] = useState(false);

  const handleAddList = (name: string) => {    
    const newList: TodoList = {
      id: Date.now().toString(),
      name,
      todos: [],
      createdAt: new Date()
    };
    
    addList(newList);
  };
  
  const onAddAnotherList = () => {
    setShowAddListForm(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {todoLists.map((list, index) => (
        <DraggableTodoList 
          key={list.id} 
          list={list}
          index={index}
          moveList={moveTodoList}
          onDelete={() => onDeleteList(list.id)}
          onAddTodo={onAddTodo}
          onToggleTodo={onToggleTodo}
        />
      ))}
      {showAddListForm && (
        <AddListForm onAddList={handleAddList} />
      )}
      <div className="my-4">
        <button 
          onClick={onAddAnotherList}
          className="cursor-pointer w-full text-[#00000099] py-3 font-medium text-sm hover:text-primary-dark bg-[#FAFAFA] rounded-[12px]"
        >
          + Add another List
        </button>
      </div>
    </div>
  );
};

export default TodoLists; 