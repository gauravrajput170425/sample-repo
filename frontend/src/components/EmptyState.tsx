import { useState } from "react";
import AddListForm from "./AddListForm";
import type { TodoList } from "../types/todoList";
import { useTodoListContext } from "../hooks/useTodoListContext";



const EmptyState = () => {
  const { addList } = useTodoListContext();
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
  
  
  if (showAddListForm) {
    return <AddListForm onAddList={handleAddList} />
  }

  return (
    <div className="text-center py-8 px-4 flex flex-col items-center gap-6 my-8">
      {/* Placeholder for 3D illustration */}
      <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] mb-4">
        {/* 
          In a real implementation you would add an actual image here:
          <img src="/path/to/empty-state-illustration.png" alt="Empty to-do list" />
        */}
        <div className="w-full h-full bg-contain bg-center bg-no-repeat" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='80' stroke='%23FA5252' stroke-width='2' stroke-dasharray='5 5'/%3E%3Cpath d='M70 100L90 120L130 80' stroke='%23FA5252' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>
      <p className="text-lg text-gray-800 m-0">Create your first list and become more productive</p>
      <button 
        className="bg-primary text-white py-3 px-8 rounded text-base font-medium hover:bg-primary-dark"
        onClick={()=>{
          setShowAddListForm(true);
        }}
      >
        Add List
      </button>
    </div>
  );
};

export default EmptyState; 